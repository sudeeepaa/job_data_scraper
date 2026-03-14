package service

import (
	"context"
	"crypto/sha256"
	"fmt"
	"log"
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
}

// NewAggregator creates a new aggregator.
func NewAggregator(srcs []sources.JobSource, jobRepo *repository.JobRepo, cacheRepo *repository.CacheRepo, cacheTTL time.Duration) *Aggregator {
	return &Aggregator{
		sources:   srcs,
		jobRepo:   jobRepo,
		cacheRepo: cacheRepo,
		cacheTTL:  cacheTTL,
	}
}

// sourceResult holds results from a single source goroutine.
type sourceResult struct {
	source string
	jobs   []domain.Job
	err    error
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
			log.Printf("⚠️  Cache check failed: %v", err)
		}
	}
	if fresh {
		log.Printf("📦 Cache hit for %q (fresh)", cacheKey)
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
		log.Printf("🔄 Force refresh for %q, fetching from %d sources", cacheKey, len(a.sources))
	} else {
		log.Printf("🔍 Cache miss for %q, fetching from %d sources", cacheKey, len(a.sources))
	}

	if len(a.sources) == 0 {
		return nil, fmt.Errorf("aggregator: no sources configured")
	}

	// Fan-out: launch goroutines per source
	results := make(chan sourceResult, len(a.sources))
	var wg sync.WaitGroup

	fetchCtx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	for _, src := range a.sources {
		wg.Add(1)
		go func(s sources.JobSource) {
			defer wg.Done()
			jobs, err := s.Search(fetchCtx, query, location, page)
			results <- sourceResult{source: s.Name(), jobs: jobs, err: err}
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
		if res.err != nil {
			log.Printf("⚠️  Source %q failed: %v", res.source, res.err)
			errors = append(errors, fmt.Sprintf("%s: %v", res.source, res.err))
			continue
		}
		log.Printf("✅ Source %q returned %d jobs", res.source, len(res.jobs))
		allJobs = append(allJobs, res.jobs...)
	}

	// If all sources failed, try returning cached data
	if len(allJobs) == 0 && len(errors) > 0 {
		log.Printf("⚠️  All sources failed, attempting cached fallback")
		params := domain.JobQueryParams{Query: query, Location: location}
		pag := domain.Pagination{Page: 1, Limit: 20}
		cached, _, err := a.jobRepo.ListJobs(ctx, params, pag)
		if err == nil && len(cached) > 0 {
			log.Printf("📦 Returning %d cached results as fallback", len(cached))
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
	log.Printf("📊 %d total → %d unique after dedup", len(allJobs), len(deduped))

	// Persist to database
	if err := a.jobRepo.UpsertJobs(ctx, deduped); err != nil {
		log.Printf("⚠️  Failed to persist jobs: %v", err)
		// Still return results even if persistence fails
	} else {
		// Upsert companies
		companies := extractCompanies(deduped)
		for _, co := range companies {
			if err := a.jobRepo.UpsertCompany(ctx, &co); err != nil {
				log.Printf("⚠️  Failed to upsert company %s: %v", co.Slug, err)
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
		log.Printf("⚠️  Failed to update cache entry: %v", err)
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
