package service

import (
	"context"
	"crypto/sha256"
	"fmt"
	"log/slog"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/repository"
	"github.com/samuelshine/job-data-scraper/internal/sources"
)

// Aggregator fans out search requests to multiple job sources,
// deduplicates results, and persists them via the repository layer.
type Aggregator struct {
	sources   []sources.JobSource
	jobRepo   *repository.JobRepo
	cacheRepo *repository.CacheRepo
	cacheTTL  time.Duration
	mu        sync.RWMutex
	statuses  map[string]domain.SourceHealth
}

// NewAggregator creates a new aggregator.
func NewAggregator(srcs []sources.JobSource, jobRepo *repository.JobRepo, cacheRepo *repository.CacheRepo, cacheTTL time.Duration) *Aggregator {
	return &Aggregator{
		sources:   srcs,
		jobRepo:   jobRepo,
		cacheRepo: cacheRepo,
		cacheTTL:  cacheTTL,
		statuses:  make(map[string]domain.SourceHealth, len(srcs)),
	}
}

// sourceResult holds results from a single source goroutine.
type sourceResult struct {
	source   string
	jobs     []domain.Job
	err      error
	query    string
	started  time.Time
	finished time.Time
}

// SourceHealth returns the latest status for each configured source.
func (a *Aggregator) SourceHealth(ctx context.Context) []domain.SourceHealth {
	a.mu.RLock()
	defer a.mu.RUnlock()

	statuses := make([]domain.SourceHealth, 0, len(a.sources))
	for _, src := range a.sources {
		status := a.statuses[src.Name()]
		status.Name = src.Name()
		status.Enabled = true

		// Fetch total yield from database for this source
		if count, err := a.jobRepo.GetJobCountBySource(ctx, src.Name()); err == nil {
			status.ResultCount = count
		}

		statuses = append(statuses, status)
	}

	sort.Slice(statuses, func(i, j int) bool {
		return statuses[i].Name < statuses[j].Name
	})

	return statuses
}

// SearchAndStore fans out to all sources, deduplicates, and persists results.
// If forceRefresh is false and the cache is fresh, it returns stored data without calling APIs.
func (a *Aggregator) SearchAndStore(ctx context.Context, query, location string, page int, forceRefresh bool) ([]domain.Job, error) {
	cacheKey := buildCacheKey(query, location, page)

	// Check cache freshness
	fresh := false
	if !forceRefresh {
		var err error
		fresh, err = a.cacheRepo.IsCacheFresh(ctx, cacheKey, a.cacheTTL)
		if err != nil {
			slog.Warn("cache check failed", "cache_key", cacheKey, "err", err)
		}
	}
	if fresh {
		slog.Info("cache hit", "cache_key", cacheKey, "fresh", true)
		// Return from database
		params := domain.JobQueryParams{Query: query, Location: location}
		pag := domain.Pagination{Page: 1, Limit: 20}
		jobs, _, err := a.jobRepo.ListJobs(ctx, params, pag)
		if err != nil {
			return nil, fmt.Errorf("aggregator: failed to read cached jobs: %w", err)
		}
		// Convert summaries back to full jobs for consistency
		fullJobs := make([]domain.Job, 0, len(jobs))
		for _, s := range jobs {
			j, err := a.jobRepo.GetJob(ctx, s.ID)
			if err == nil && j != nil {
				fullJobs = append(fullJobs, *j)
			}
		}
		return fullJobs, nil
	}

	if forceRefresh {
		slog.Info("force refresh", "cache_key", cacheKey, "sources", len(a.sources))
	} else {
		slog.Info("cache miss", "cache_key", cacheKey, "sources", len(a.sources))
	}

	if len(a.sources) == 0 {
		return nil, fmt.Errorf("aggregator: no sources configured")
	}

	// Fan-out: launch goroutines per source
	results := make(chan sourceResult, len(a.sources))
	var wg sync.WaitGroup

	fetchCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	for _, src := range a.sources {
		wg.Add(1)
		go func(s sources.JobSource) {
			defer wg.Done()
			started := time.Now()
			jobs, err := s.Search(fetchCtx, query, location, page)
			results <- sourceResult{
				source:   s.Name(),
				jobs:     jobs,
				err:      err,
				query:    query,
				started:  started,
				finished: time.Now(),
			}
		}(src)
	}

	// Close channel when all goroutines complete
	go func() {
		wg.Wait()
		close(results)
	}()

	// Fan-in: collect results
	var allJobs []domain.Job
	var errors []string
	for res := range results {
		a.updateSourceHealth(res)
		if res.err != nil {
			slog.Warn("source fetch failed", "source", res.source, "err", res.err)
			errors = append(errors, fmt.Sprintf("%s: %v", res.source, res.err))
			continue
		}
		slog.Info("source fetch ok", "source", res.source, "jobs", len(res.jobs))
		allJobs = append(allJobs, res.jobs...)
	}

	// If all sources failed, try returning cached data
	if len(allJobs) == 0 && len(errors) > 0 {
		slog.Warn("all sources failed, falling back to cache", "errors", strings.Join(errors, "; "))
		params := domain.JobQueryParams{Query: query, Location: location}
		pag := domain.Pagination{Page: 1, Limit: 20}
		cached, _, err := a.jobRepo.ListJobs(ctx, params, pag)
		if err == nil && len(cached) > 0 {
			slog.Info("serving cached fallback results", "count", len(cached))
			fullJobs := make([]domain.Job, 0, len(cached))
			for _, s := range cached {
				j, err := a.jobRepo.GetJob(ctx, s.ID)
				if err == nil && j != nil {
					fullJobs = append(fullJobs, *j)
				}
			}
			return fullJobs, nil
		}
		return nil, fmt.Errorf("aggregator: all sources failed: %s", strings.Join(errors, "; "))
	}

	// Deduplicate
	deduped := dedup(allJobs)
	slog.Info("dedup complete", "total", len(allJobs), "unique", len(deduped))

	// Persist to database
	if err := a.jobRepo.UpsertJobs(ctx, deduped); err != nil {
		slog.Error("failed to persist jobs", "err", err)
		// Still return results even if persistence fails
	} else {
		// Upsert companies
		companies := extractCompanies(deduped)
		for _, co := range companies {
			if err := a.jobRepo.UpsertCompany(ctx, &co); err != nil {
				slog.Warn("failed to upsert company", "slug", co.Slug, "err", err)
			}
		}
	}

	// Update cache entry
	cacheEntry := &domain.SearchCacheEntry{
		QueryHash:   cacheKey,
		QueryText:   query,
		ResultCount: len(deduped),
	}
	if err := a.cacheRepo.SetCacheEntry(ctx, cacheEntry); err != nil {
		slog.Warn("failed to update cache entry", "cache_key", cacheKey, "err", err)
	}

	return deduped, nil
}

// ScrapeSource triggers a focused fetch for a specific named source.
func (a *Aggregator) ScrapeSource(ctx context.Context, sourceName string) ([]domain.Job, error) {
	a.mu.RLock()
	var targeted sources.JobSource
	for _, s := range a.sources {
		if s.Name() == sourceName {
			targeted = s
			break
		}
	}
	a.mu.RUnlock()

	if targeted == nil {
		return nil, fmt.Errorf("source %q not found or disabled", sourceName)
	}

	started := time.Now()
	// Use a default query for manual refresh
	query := "software"
	location := "remote"
	jobs, err := targeted.Search(ctx, query, location, 1)

	a.updateSourceHealth(sourceResult{
		source:   targeted.Name(),
		jobs:     jobs,
		err:      err,
		query:    "manual_refresh",
		started:  started,
		finished: time.Now(),
	})

	if err != nil {
		return nil, err
	}

	// Persist results
	deduped := dedup(jobs)
	if err := a.jobRepo.UpsertJobs(ctx, deduped); err != nil {
		slog.Error("scrape source: failed to persist jobs", "source", sourceName, "err", err)
	}

	return deduped, nil
}

// dedup removes duplicate jobs by lowercase(title + company).
func dedup(jobs []domain.Job) []domain.Job {
	seen := make(map[string]bool)
	result := make([]domain.Job, 0, len(jobs))
	for _, j := range jobs {
		key := strings.ToLower(j.Title + "|" + j.Company)
		if !seen[key] {
			seen[key] = true
			result = append(result, j)
		}
	}
	return result
}

// extractCompanies extracts unique companies from a slice of jobs.
func extractCompanies(jobs []domain.Job) []domain.Company {
	seen := make(map[string]bool)
	companies := []domain.Company{}
	for _, j := range jobs {
		if j.CompanySlug == "" || seen[j.CompanySlug] {
			continue
		}
		seen[j.CompanySlug] = true
		companies = append(companies, domain.Company{
			Slug:     j.CompanySlug,
			Name:     j.Company,
			JobCount: 1,
		})
	}
	return companies
}

// buildCacheKey creates a deterministic cache key from search parameters.
func buildCacheKey(query, location string, page int) string {
	raw := fmt.Sprintf("search:%s:%s:%d", strings.ToLower(query), strings.ToLower(location), page)
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%x", h[:8])
}

func (a *Aggregator) updateSourceHealth(res sourceResult) {
	a.mu.Lock()
	defer a.mu.Unlock()

	status := a.statuses[res.source]
	status.Name = res.source
	status.LastQuery = res.query
	status.ResultCount = len(res.jobs)
	status.LastDuration = res.finished.Sub(res.started).Round(time.Millisecond).String()
	status.LastAttemptAt = timePtr(res.finished)

	if res.err != nil {
		status.Healthy = false
		status.LastError = res.err.Error()
	} else {
		status.Healthy = true
		status.LastError = ""
		status.LastSuccessAt = timePtr(res.finished)
	}

	a.statuses[res.source] = status
}

func timePtr(value time.Time) *time.Time {
	return &value
}
