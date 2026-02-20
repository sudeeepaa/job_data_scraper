## Plan 3.2 Summary: Standardized Error Envelopes + Search Enhancement

### Completed
- Created `internal/api/handlers/response.go` with `APIError` type and `writeError` helper
- Updated all 4 handler files (jobs, companies, analytics, auth) to use `writeError`
- Added `EmploymentType` field to `JobQueryParams`
- Added `employment_type` filter in `ListJobs` SQL builder
- Added short sort aliases: `date` → `date_desc`, `salary` → `salary_desc`, `relevance` → `date_desc`

### Error Envelope Format
```json
{"error": "job not found", "code": 404}
```

### Verified
- Error envelope returns structured `{"error": "...", "code": N}` format
- `employment_type=full-time` filter works
- `sort=salary` and `sort=date` aliases work
- Build passes
