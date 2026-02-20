---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Job Aggregator Service

## Objective
Create an aggregator service that fans out search requests to multiple job sources using goroutines, collects results via channels, deduplicates matches, and stores them in the database. Integrates with the cache layer for 24h TTL freshness checks.

## Context
- .gsd/SPEC.md (hybrid caching, graceful degradation)
- .gsd/phases/2/RESEARCH.md
- internal/sources/jsearch/client.go (from Plan 2.1)
- internal/sources/adzuna/client.go (from Plan 2.1)
- internal/repository/job_repo.go (UpsertJobs, ListJobs)
- internal/repository/cache_repo.go (IsCacheFresh, SetCacheEntry)
- internal/domain/job.go, cache.go

## Tasks

<task type="auto">
  <name>Create source interface and aggregator</name>
  <files>
    internal/sources/source.go (NEW — shared interface)
    internal/service/aggregator.go (NEW — fan-out/fan-in)
  </files>
  <action>
    1. Create `internal/sources/source.go`:
       - Define `JobSource` interface: `Search(ctx context.Context, query, location string, page int) ([]domain.Job, error)` + `Name() string`
       - Both JSearch and Adzuna clients should implicitly satisfy this interface (add Name() method to each)
    
    2. Create `internal/service/aggregator.go`:
       - `Aggregator` struct with fields: sources []sources.JobSource, jobRepo, cacheRepo, cacheTTL (24h)
       - `NewAggregator(sources []sources.JobSource, jobRepo, cacheRepo, cacheTTL)` constructor
       - `SearchAndStore(ctx context.Context, query, location string, page int) ([]domain.Job, error)`:
         a. Compute cache key hash from query+location+page
         b. Check if cache is fresh via cacheRepo.IsCacheFresh()
         c. If fresh: return results from jobRepo.ListJobs (cached data)
         d. If stale or missing:
            - Fan-out: launch one goroutine per source with context timeout (15s)
            - Each goroutine sends results to a shared channel
            - Fan-in: collect all results, handle partial failures gracefully
            - Deduplicate by title+company (case-insensitive)
            - Store via jobRepo.UpsertJobs() in one transaction
            - Update search_cache entry with new timestamp
            - Also upsert companies from results (extract unique company slugs)
            - Return merged results
       - `dedup(jobs []domain.Job) []domain.Job` — removes duplicates by lowercase(title+company)
       - Handle error cases:
         - All sources fail → return cached data if any, else error
         - Partial failure → return results from successful sources + log warnings
  </action>
  <verify>go build ./internal/service/ && go build ./internal/sources/ && echo "AGGREGATOR OK"</verify>
  <done>Aggregator compiles, implements fan-out/fan-in with goroutines, dedup, cache check, and graceful degradation</done>
</task>

<task type="auto">
  <name>Add Name() method to source clients</name>
  <files>
    internal/sources/jsearch/client.go
    internal/sources/adzuna/client.go
  </files>
  <action>
    Add `Name() string` method to both JSearch and Adzuna clients:
    - JSearch: returns "jsearch"
    - Adzuna: returns "adzuna"
    This ensures both implement the JobSource interface.
  </action>
  <verify>go build ./internal/... 2>&1 | grep -v "^$" || echo "ALL OK"</verify>
  <done>Both clients implement sources.JobSource interface</done>
</task>

## Success Criteria
- [ ] Aggregator compiles and uses goroutines for concurrent fetching
- [ ] Cache freshness check prevents redundant API calls
- [ ] Deduplication removes cross-source duplicates
- [ ] Graceful degradation: partial failures still return results
- [ ] Results persisted to SQLite via UpsertJobs
