---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Domain Models, Repository & Seed Data

## Objective
Define the unified domain models, implement the repository layer with full CRUD + caching awareness, and seed the database with mock data. After this plan, the backend can serve job data from SQLite instead of hardcoded slices.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md (ADR-005, ADR-008)
- internal/database/database.go (from Plan 1.1)
- internal/database/migrations/001_initial_schema.sql (from Plan 1.1)
- internal/domain/job.go (existing — will be refactored)
- internal/domain/analytics.go (existing — will be refactored)
- internal/repository/job_repo.go (existing — will be rewritten)

## Tasks

<task type="auto">
  <name>Refactor domain models for database backing</name>
  <files>
    internal/domain/job.go (MODIFY)
    internal/domain/analytics.go (MODIFY)
    internal/domain/user.go (NEW)
    internal/domain/cache.go (NEW)
  </files>
  <action>
    1. Update `internal/domain/job.go`:
       - Keep existing `Job`, `JobSummary`, `Salary`, `Company`, `JobQueryParams`, `Pagination`, `PaginationMeta`, `FilterOptions` types
       - Add `db` struct tags alongside `json` tags for sqlx compatibility
       - Add `Skills` field as a custom type `StringSlice` that implements `sql.Scanner` and `driver.Valuer` for JSON marshaling from/to TEXT column
       - Add `CreatedAt` and `UpdatedAt` fields

    2. Update `internal/domain/analytics.go`:
       - Keep `SkillCount`, `AnalyticsSummary`, `SourceDistribution` types
       - Add `MarketTrend` struct matching the market_trends table

    3. Create `internal/domain/user.go`:
       ```go
       type User struct {
           ID           string    `json:"id" db:"id"`
           Email        string    `json:"email" db:"email"`
           PasswordHash string    `json:"-" db:"password_hash"`
           Name         string    `json:"name" db:"name"`
           CreatedAt    time.Time `json:"createdAt" db:"created_at"`
           UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
       }

       type SavedJob struct {
           UserID  string    `json:"userId" db:"user_id"`
           JobID   string    `json:"jobId" db:"job_id"`
           SavedAt time.Time `json:"savedAt" db:"saved_at"`
       }

       type RegisterRequest struct {
           Email    string `json:"email"`
           Password string `json:"password"`
           Name     string `json:"name"`
       }

       type LoginRequest struct {
           Email    string `json:"email"`
           Password string `json:"password"`
       }

       type AuthResponse struct {
           Token string `json:"token"`
           User  User   `json:"user"`
       }
       ```

    4. Create `internal/domain/cache.go`:
       ```go
       type SearchCacheEntry struct {
           QueryHash   string    `db:"query_hash"`
           QueryText   string    `db:"query_text"`
           Filters     string    `db:"filters"`
           ResultCount int       `db:"result_count"`
           FetchedAt   time.Time `db:"fetched_at"`
       }
       ```
       Add helper: `IsFresh(ttl time.Duration) bool` method that checks if cached data is within TTL.
  </action>
  <verify>
    - `go build ./internal/domain/` compiles without errors
    - All types have both `json` and `db` struct tags
    - `StringSlice` type implements `sql.Scanner` and `driver.Valuer`
  </verify>
  <done>All domain models defined with database tags, custom types for JSON columns</done>
</task>

<task type="auto">
  <name>Implement repository layer with caching & seed data</name>
  <files>
    internal/repository/job_repo.go (REWRITE)
    internal/repository/user_repo.go (NEW)
    internal/repository/cache_repo.go (NEW)
    internal/repository/seed.go (NEW)
  </files>
  <action>
    1. Rewrite `internal/repository/job_repo.go`:
       - Constructor takes `*sqlx.DB` instead of creating in-memory data
       - `ListJobs(ctx, params, pag)` — query jobs table with filters + pagination
       - `GetJob(ctx, id)` — single job by ID
       - `UpsertJob(ctx, job)` — insert or update (for caching API results)
       - `UpsertJobs(ctx, jobs)` — batch upsert in a transaction
       - `ListCompanies(ctx, query)` — query companies table
       - `GetCompany(ctx, slug)` — single company
       - `UpsertCompany(ctx, company)` — insert or update
       - `GetFilterOptions(ctx)` — aggregate distinct values from jobs table
       - `GetTopSkills(ctx, limit)` — aggregate from jobs skills JSON
       - `GetAnalyticsSummary(ctx)` — computed from jobs table
       - All queries use `sqlx.Select` / `sqlx.Get` for struct scanning
       - Filter queries use dynamic WHERE clause building (NOT string concatenation for values — use named params)

    2. Create `internal/repository/user_repo.go`:
       - `CreateUser(ctx, user)` — insert new user
       - `GetUserByEmail(ctx, email)` — for login
       - `GetUserByID(ctx, id)` — for auth middleware
       - `SaveJob(ctx, userID, jobID)` — bookmark a job
       - `UnsaveJob(ctx, userID, jobID)` — remove bookmark
       - `GetSavedJobs(ctx, userID)` — list bookmarked jobs
       - `IsJobSaved(ctx, userID, jobID)` — check if bookmarked

    3. Create `internal/repository/cache_repo.go`:
       - `GetCacheEntry(ctx, queryHash)` — check if search is cached
       - `SetCacheEntry(ctx, entry)` — create/update cache entry
       - `IsCacheFresh(ctx, queryHash, ttl)` — checks if cache is within TTL (24h)
       - `DeleteStaleCaches(ctx, ttl)` — cleanup old entries

    4. Create `internal/repository/seed.go`:
       - `SeedDatabase(ctx, db)` function that inserts the 10 existing mock jobs and 9 companies from the current hardcoded data
       - Only seeds if jobs table is empty (idempotent)
       - Preserves the exact same data currently in the in-memory repo

    IMPORTANT: Do NOT use string interpolation for SQL values. Always use parameterized queries to prevent SQL injection.
  </action>
  <verify>
    - `go build ./internal/repository/` compiles without errors
    - seed.go contains all 10 jobs and 9 companies from the original mock data
    - All repository functions use parameterized queries (no string interpolation for values)
  </verify>
  <done>Repository layer fully implements CRUD for all tables, seed data preserves original mock jobs</done>
</task>

## Success Criteria
- [ ] Domain models compile with both `json` and `db` struct tags
- [ ] Repository layer has full CRUD for jobs, companies, users, saved_jobs, search_cache
- [ ] Seed data contains all 10 original mock jobs and 9 companies
- [ ] `go build ./...` succeeds
