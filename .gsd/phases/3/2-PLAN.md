---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Standardized API Error Envelopes + Search Enhancement

## Objective
Standardize all API error responses with a consistent envelope format and add the `employment_type` filter to complete the search feature. Currently, error responses are ad-hoc `map[string]string{"error": "..."}` — this plan unifies them with a proper `APIError` type and adds relevant sort options accepted by the frontend.

## Context
- `internal/api/handlers/jobs.go` — current handler error patterns
- `internal/api/handlers/companies.go`
- `internal/api/handlers/analytics.go`
- `internal/api/handlers/auth.go`
- `internal/domain/job.go` — `JobQueryParams`
- `internal/repository/job_repo.go` — `ListJobs` SQL builder

## Tasks

<task type="auto">
  <name>Create API error envelope + update all handlers</name>
  <files>
    - internal/api/handlers/response.go (NEW)
    - internal/api/handlers/jobs.go (MODIFY)
    - internal/api/handlers/companies.go (MODIFY)
    - internal/api/handlers/analytics.go (MODIFY)
    - internal/api/handlers/auth.go (MODIFY)
  </files>
  <action>
    1. **Create `internal/api/handlers/response.go`** with:
       ```go
       type APIError struct {
           Error   string `json:"error"`
           Message string `json:"message,omitempty"`
           Code    int    `json:"code"`
       }

       func writeError(w http.ResponseWriter, code int, err string) {
           writeJSON(w, code, APIError{Error: err, Code: code})
       }

       type APISuccess struct {
           Data    interface{} `json:"data,omitempty"`
           Message string      `json:"message,omitempty"`
       }
       ```

    2. **Update all handlers** to use `writeError()` instead of inline `map[string]string{"error": ...}`:
       - `jobs.go` — 3 error sites
       - `companies.go` — 3 error sites
       - `analytics.go` — 2 error sites
       - `auth.go` — all validation/auth error sites

    DO NOT change successful response formats (they already use proper envelopes).
    DO NOT add error codes that don't match HTTP status codes.
  </action>
  <verify>
    ```bash
    go build ./cmd/server/ && echo "BUILD OK"
    # Start server, test error response format:
    # curl -s http://localhost:8080/api/v1/jobs/nonexistent | python3 -m json.tool
    # Should return {"error": "job not found", "code": 404}
    ```
  </verify>
  <done>
    - All error responses use consistent `{"error": "...", "code": N}` format
    - `writeError` helper used across all handlers
    - Build passes
  </done>
</task>

<task type="auto">
  <name>Add employment_type filter + frontend-compatible sort values</name>
  <files>
    - internal/domain/job.go (MODIFY)
    - internal/repository/job_repo.go (MODIFY)
    - internal/api/handlers/jobs.go (MODIFY)
    - internal/api/openapi.json (MODIFY)
  </files>
  <action>
    1. **Add `EmploymentType` field to `JobQueryParams`** in `domain/job.go`

    2. **Add filter in `ListJobs` SQL** in `job_repo.go`:
       ```go
       if params.EmploymentType != "" {
           where = append(where, "employment_type = :employment_type")
           args["employment_type"] = params.EmploymentType
       }
       ```

    3. **Add sort aliases** — Map frontend-friendly names to SQL:
       - `"date"` → `"posted_at DESC"` (same as default)
       - `"salary"` → `"COALESCE(salary_max, 0) DESC"` (highest first)
       - `"relevance"` → `"posted_at DESC"` (for now, same as date — true relevance ranking is out of scope)

    4. **Parse `employment_type` param** in `jobs.go` handler

    5. **Update `openapi.json`** — Add `employment_type` param and update sort enum to include both formats

    DO NOT change existing sort values (date_asc, salary_desc etc still work).
    DO NOT implement full-text relevance scoring — just alias "relevance" to date sort.
  </action>
  <verify>
    ```bash
    go build ./cmd/server/ && echo "BUILD OK"
    # curl -s 'http://localhost:8080/api/v1/jobs?employment_type=full-time' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Jobs: {d[\"pagination\"][\"totalItems\"]}')"
    # curl -s 'http://localhost:8080/api/v1/jobs?sort=salary' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Jobs: {d[\"pagination\"][\"totalItems\"]}')"
    ```
  </verify>
  <done>
    - `employment_type` filter works in API
    - `sort=date`, `sort=salary`, `sort=relevance` all accepted
    - OpenAPI spec documents new params
    - Build passes
  </done>
</task>

## Success Criteria
- [ ] All API errors return `{"error": "...", "code": N}` format
- [ ] `writeError` helper used consistently across all handlers
- [ ] `employment_type` filter works for job listings
- [ ] Short sort names (`date`, `salary`, `relevance`) accepted alongside existing names
- [ ] OpenAPI spec updated with new params
