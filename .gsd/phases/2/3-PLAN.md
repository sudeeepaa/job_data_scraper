---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: API Integration & Config Wiring

## Objective
Wire the aggregator into the existing API endpoints so that job searches trigger real API calls (when cache is stale), update the job service to use the aggregator, and ensure the server boots with configured sources.

## Context
- internal/service/aggregator.go (from Plan 2.2)
- internal/service/job_service.go (current service layer)
- internal/api/routes.go
- internal/api/handlers/jobs.go
- cmd/server/main.go
- internal/config/config.go

## Tasks

<task type="auto">
  <name>Update service layer and main.go wiring</name>
  <files>
    internal/service/job_service.go (add aggregator integration)
    cmd/server/main.go (create source clients, pass to aggregator)
    internal/config/config.go (finalize all env vars)
  </files>
  <action>
    1. Update `config.go`:
       - Add CacheTTL field (default 24h)
       - Ensure all API key fields have clear log messages when missing
    
    2. Update `job_service.go`:
       - Add `aggregator *Aggregator` field to JobService
       - Add `SearchJobs(ctx, query, location string, page int) ([]domain.Job, error)` method that delegates to aggregator.SearchAndStore()
       - Keep existing `ListJobs()` for cached/filtered browsing
    
    3. Update `cmd/server/main.go`:
       - Import sources packages
       - Build source list conditionally: only add JSearch client if JSEARCH_API_KEY is set, only add Adzuna if ADZUNA_APP_ID is set
       - Create aggregator with source list
       - Pass aggregator to JobService
       - Log which sources are active on startup
       - If no API keys configured, log warning and continue (app works with seed data only)
    
    4. Update `handlers/jobs.go`:
       - Add optional `refresh=true` query param to ListJobs handler
       - When refresh=true AND query is provided, call svc.SearchJobs() to trigger live API fetch
       - Otherwise, serve from cached/stored data via svc.ListJobs()
  </action>
  <verify>go build ./cmd/server/ && echo "WIRING OK"</verify>
  <done>Server compiles with aggregator wired in, conditionally loads API sources, search triggers live fetch on refresh</done>
</task>

<task type="auto">
  <name>Create .env.example and update README</name>
  <files>
    .env.example (NEW)
    README.md (update API section)
  </files>
  <action>
    1. Create `.env.example` with all environment variables:
       - PORT=8080
       - DATABASE_PATH=jobpulse.db
       - JWT_SECRET=change-me-in-production
       - JSEARCH_API_KEY=your-rapidapi-key
       - ADZUNA_APP_ID=your-adzuna-app-id
       - ADZUNA_APP_KEY=your-adzuna-app-key
    
    2. Update README.md:
       - Add "Environment Variables" section listing all vars
       - Update API endpoints to include new auth routes (/auth/register, /auth/login, /me/*)
       - Note that app works without API keys (uses seed data)
       - Add "Data Sources" section explaining JSearch + Adzuna
  </action>
  <verify>test -f .env.example && echo "ENV OK"</verify>
  <done>.env.example exists with all vars, README documents data sources and auth endpoints</done>
</task>

## Success Criteria
- [ ] Server builds and boots without API keys (graceful)
- [ ] Server boots with API keys and creates source clients
- [ ] ListJobs with refresh=true triggers aggregator
- [ ] .env.example documents all configuration
- [ ] README updated with current API surface
