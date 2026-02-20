---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Go Unit Tests (Service + Repository)

## Objective
Add unit tests for the core Go backend layers: domain validation (if any), repository operations (job, user, cache, trends), and service-layer logic (job service, auth service, aggregator). Use SQLite in-memory databases for repository tests. Target the highest-value paths first.

## Context
- `internal/repository/job_repo.go` — Job CRUD, search with filters/pagination/sorting
- `internal/repository/user_repo.go` — User CRUD, saved jobs
- `internal/repository/cache_repo.go` — Cache read/write with TTL
- `internal/repository/trends_repo.go` — Market trends snapshot, salary stats
- `internal/service/job_service.go` — Search orchestration with caching
- `internal/service/auth_service.go` — Register, login, JWT, saved jobs
- `internal/service/aggregator.go` — Fan-out/fan-in across job sources
- `internal/database/database.go` — DB initialization + migrations

## Tasks

<task type="auto">
  <name>Create repository layer tests</name>
  <files>
    - internal/repository/job_repo_test.go (NEW)
    - internal/repository/user_repo_test.go (NEW)
    - internal/repository/cache_repo_test.go (NEW)
    - internal/repository/trends_repo_test.go (NEW)
  </files>
  <action>
    1. **Test helpers:**
       - Create a `testDB(t *testing.T) *sqlx.DB` helper that opens an in-memory SQLite DB, runs migrations via `database.Migrate(db)`, and returns it.
       - This helper is reused across all repo test files.

    2. **`job_repo_test.go`:**
       - `TestJobRepo_UpsertAndGetByID` — Insert a job, retrieve by ID, verify all fields
       - `TestJobRepo_Search_Filters` — Insert 5 jobs with different locations, skills, salary ranges. Test search with `location`, `experience_level`, `is_remote`, `salary_min`, `salary_max`, `source`, `employment_type` filters
       - `TestJobRepo_Search_Pagination` — Insert 15 jobs, search with page=2 limit=5, verify correct slice and pagination meta
       - `TestJobRepo_Search_Sorting` — Test `sort=salary`, `sort=date` produce correct ordering

    3. **`user_repo_test.go`:**
       - `TestUserRepo_CreateAndGetByEmail` — Create user, retrieve by email
       - `TestUserRepo_SavedJobs` — Save a job, list saved jobs, unsave, verify list empty

    4. **`cache_repo_test.go`:**
       - `TestCacheRepo_SetAndGet` — Store cache entry, retrieve, verify data
       - `TestCacheRepo_Expiry` — Store with TTL, verify expired entries are not returned (mock time or use very short TTL)

    5. **`trends_repo_test.go`:**
       - `TestTrendsRepo_ComputeAndGetTrends` — Insert jobs with skills, compute snapshot, retrieve trends
       - `TestTrendsRepo_SalaryStats` — Insert jobs with salary ranges, get stats, verify min/max/avg/count
       - `TestTrendsRepo_SourceDistribution` — Insert jobs from different sources, verify counts

    DO NOT mock the database — use real in-memory SQLite.
    DO NOT add any external test dependencies. Use only `testing` + `github.com/stretchr/testify/assert` if already in go.mod, otherwise just use standard library.
    Each test function should be self-contained (create its own DB via helper).
  </action>
  <verify>
    ```bash
    cd /path/to/project && go test ./internal/repository/... -v -count=1 2>&1 | tail -20
    ```
  </verify>
  <done>
    - All repository tests pass
    - Job search with filters, pagination, and sorting tested
    - User CRUD and saved jobs tested
    - Cache set/get/expiry tested
    - Trends compute, salary stats, source distribution tested
  </done>
</task>

<task type="auto">
  <name>Create service layer tests</name>
  <files>
    - internal/service/auth_service_test.go (NEW)
    - internal/service/job_service_test.go (NEW)
  </files>
  <action>
    1. **`auth_service_test.go`:**
       - `TestAuthService_RegisterAndLogin` — Register a user, then login with same credentials, verify JWT returned
       - `TestAuthService_RegisterDuplicate` — Register twice with same email, verify error
       - `TestAuthService_LoginWrongPassword` — Register, then login with wrong password, verify error
       - `TestAuthService_SavedJobs` — Register, save a job, list saved jobs, unsave
       - Use real in-memory SQLite DB (same helper pattern as repo tests)

    2. **`job_service_test.go`:**
       - `TestJobService_SearchJobs` — Seed DB with jobs, call SearchJobs, verify results
       - `TestJobService_GetJobByID` — Seed DB, get by ID, verify fields
       - `TestJobService_GetFilters` — Seed DB with varied jobs, call GetFilters, verify all filter categories populated
       - Use real in-memory SQLite DB

    DO NOT test the aggregator in this plan (it requires mocking external APIs — that's integration testing).
    DO NOT add any mocking frameworks. Use real dependencies with in-memory SQLite.
  </action>
  <verify>
    ```bash
    cd /path/to/project && go test ./internal/service/... -v -count=1 2>&1 | tail -20
    ```
  </verify>
  <done>
    - Auth service tests pass (register, login, duplicate, wrong password, saved jobs)
    - Job service tests pass (search, get by ID, filters)
    - All tests use real in-memory SQLite
  </done>
</task>

## Success Criteria
- [ ] `go test ./internal/repository/... -count=1` passes
- [ ] `go test ./internal/service/... -count=1` passes
- [ ] At least 15 test functions across all files
- [ ] All tests use in-memory SQLite (no mocks, no external deps)
