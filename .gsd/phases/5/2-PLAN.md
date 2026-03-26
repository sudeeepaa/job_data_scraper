---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: API Integration Tests + Performance

## Objective
Add HTTP-level integration tests for the API endpoints (jobs, companies, analytics, auth) using Go's `httptest` package. Also add response compression (gzip middleware) and basic query optimizations (database indexes).

## Context
- `internal/api/routes.go` — Router setup with all endpoints
- `internal/api/handlers/` — All 4 handler files (jobs, companies, analytics, auth)
- `internal/api/middleware/auth.go` — JWT auth middleware
- `internal/database/database.go` — Migrations
- `cmd/server/main.go` — Server entry point

## Tasks

<task type="auto">
  <name>Create API integration tests</name>
  <files>
    - internal/api/api_test.go (NEW)
  </files>
  <action>
    1. **Test setup helper:**
       - Create `setupTestServer(t *testing.T) *httptest.Server` that:
         - Opens in-memory SQLite DB
         - Runs migrations + seeds test data
         - Creates router with all handlers
         - Returns `httptest.NewServer(router)`

    2. **Job endpoint tests:**
       - `TestAPI_ListJobs` — GET /api/v1/jobs, verify 200 + JSON with pagination
       - `TestAPI_ListJobs_WithFilters` — GET /api/v1/jobs?location=... verify filtered results
       - `TestAPI_GetJob` — GET /api/v1/jobs/{id}, verify 200 + full job object
       - `TestAPI_GetJob_NotFound` — GET /api/v1/jobs/nonexistent, verify 404 + error envelope

    3. **Company endpoint tests:**
       - `TestAPI_ListCompanies` — GET /api/v1/companies, verify 200 + company list
       - `TestAPI_GetCompany` — GET /api/v1/companies/{slug}, verify 200

    4. **Analytics endpoint tests:**
       - `TestAPI_GetSkills` — GET /api/v1/analytics/skills, verify 200
       - `TestAPI_GetSummary` — GET /api/v1/analytics/summary, verify 200
       - `TestAPI_GetSources` — GET /api/v1/analytics/sources, verify 200
       - `TestAPI_RefreshTrends` — POST /api/v1/analytics/refresh, verify 200

    5. **Auth endpoint tests:**
       - `TestAPI_Register` — POST /api/v1/auth/register with valid body, verify 201 + token
       - `TestAPI_Login` — Register then POST /api/v1/auth/login, verify 200 + token
       - `TestAPI_Profile` — Register, then GET /api/v1/me/ with Bearer token, verify 200 + user
       - `TestAPI_SavedJobs_Flow` — Register → save job → list saved → unsave → verify empty

    All tests verify:
    - Correct HTTP status codes
    - Response body structure (JSON parsing)
    - Error envelope format for failures

    DO NOT test with external network calls.
    DO NOT use any test framework beyond standard library.
    Each test is self-contained (creates its own server).
  </action>
  <verify>
    ```bash
    cd /path/to/project && go test ./internal/api/... -v -count=1 2>&1 | tail -20
    ```
  </verify>
  <done>
    - All API integration tests pass
    - Job, company, analytics, and auth endpoints covered
    - Error responses tested
    - Auth flow (register → login → profile → saved jobs) tested end-to-end
  </done>
</task>

<task type="auto">
  <name>Add gzip compression + database indexes</name>
  <files>
    - internal/api/middleware/compress.go (NEW)
    - internal/api/routes.go (MODIFY)
    - internal/database/database.go (MODIFY)
  </files>
  <action>
    1. **Create `compress.go` middleware:**
       - Implement `GzipMiddleware(next http.Handler) http.Handler`
       - Check `Accept-Encoding` header for "gzip"
       - Wrap `http.ResponseWriter` with `gzip.NewWriter`
       - Set `Content-Encoding: gzip`, `Vary: Accept-Encoding`
       - Only compress responses > 1KB
       - Skip for already-compressed content types

    2. **Wire gzip middleware in `routes.go`:**
       - Add `GzipMiddleware` to the middleware chain (outermost)
       - Apply to all routes

    3. **Add database indexes in `database.go`:**
       - Add to migrations:
         ```sql
         CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
         CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
         CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
         CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);
         CREATE INDEX IF NOT EXISTS idx_jobs_salary ON jobs(salary_min, salary_max);
         CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
         CREATE INDEX IF NOT EXISTS idx_search_cache_key ON search_cache(cache_key);
         ```

    DO NOT compress SSE/streaming responses.
    DO NOT add any external compression libraries — use stdlib `compress/gzip`.
  </action>
  <verify>
    ```bash
    cd /path/to/project && go build ./cmd/server/ && echo "BUILD OK"
    # Test gzip:
    # curl -s -H "Accept-Encoding: gzip" http://localhost:8080/api/v1/jobs -o /dev/null -w "%{content_type} %{size_download}"
    ```
  </verify>
  <done>
    - Gzip middleware compresses responses > 1KB
    - Database indexes created for frequently filtered columns
    - Build passes
  </done>
</task>

## Success Criteria
- [ ] `go test ./internal/api/... -count=1` passes
- [ ] At least 14 API integration tests
- [ ] Gzip middleware compresses large responses
- [ ] Database indexes exist for job search columns
