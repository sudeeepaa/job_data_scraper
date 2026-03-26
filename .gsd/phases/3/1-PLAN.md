---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Market Trends Pipeline + API Endpoints

## Objective
Build the market trends analysis pipeline. The `market_trends` table already exists in the schema but has no repo methods, service logic, or API endpoints. This plan creates a repo to compute and store trend snapshots from the jobs table, adds service methods, wires new analytics handler endpoints, and updates routes + OpenAPI spec.

## Context
- `.gsd/SPEC.md`
- `internal/database/migrations/001_initial_schema.sql` — `market_trends` table definition
- `internal/domain/cache.go` — `MarketTrend` struct already exists
- `internal/domain/analytics.go` — `SkillCount`, `SourceDistribution` types
- `internal/repository/job_repo.go` — existing `GetTopSkills`, `GetAnalyticsSummary`
- `internal/service/job_service.go` — existing pass-through methods
- `internal/api/handlers/analytics.go` — existing `GetTopSkills`, `GetSummary`
- `internal/api/routes.go` — existing analytics routes

## Tasks

<task type="auto">
  <name>Create market trends repo + service methods</name>
  <files>
    - internal/repository/trends_repo.go (NEW)
    - internal/service/job_service.go (MODIFY)
  </files>
  <action>
    Create `internal/repository/trends_repo.go` with a `TrendsRepo` struct backed by `*sqlx.DB`:

    1. **`ComputeAndStoreSnapshot(ctx)`** — Queries the `jobs` table to:
       - Count skill mentions (parse JSON skills column, count occurrences)
       - Compute avg salary_min/salary_max per skill
       - Insert results into `market_trends` table with today's `snapshot_date`
       - Use an INSERT OR REPLACE to avoid duplicates for the same skill+date

    2. **`GetTrends(ctx, limit int)`** — Returns the latest snapshot's market trends (top N skills with salaries), ordered by mention_count DESC

    3. **`GetSourceDistribution(ctx)`** — Queries `jobs` table: `SELECT source, COUNT(*) as count FROM jobs GROUP BY source ORDER BY count DESC`

    4. **`GetSalaryRanges(ctx)`** — Returns salary range buckets:
       - Query: `SELECT MIN(salary_min), MAX(salary_max), AVG(salary_min), AVG(salary_max) FROM jobs WHERE salary_min IS NOT NULL`
       - Return a `SalaryStats` struct

    Add to `internal/domain/analytics.go`:
    - `SalaryStats` struct with fields: `MinSalary`, `MaxSalary`, `AvgMin`, `AvgMax`, `MedianSalary`, `TotalWithSalary` (int)

    Update `internal/service/job_service.go`:
    - Add `trendsRepo *repository.TrendsRepo` field
    - Update `NewJobService` constructor (add trendsRepo param)
    - Add `GetMarketTrends(ctx, limit)`, `GetSourceDistribution(ctx)`, `GetSalaryStats(ctx)`, `RefreshTrends(ctx)` methods

    DO NOT change the market_trends table schema — it already exists in migrations.
    DO NOT add new dependencies — use existing sqlx patterns.
  </action>
  <verify>
    ```bash
    go build ./internal/... && echo "OK"
    ```
  </verify>
  <done>
    - `TrendsRepo` has 4 methods, all compile
    - `JobService` has new market trends methods
    - `SalaryStats` domain type exists
  </done>
</task>

<task type="auto">
  <name>Wire market trends endpoints + update OpenAPI</name>
  <files>
    - internal/api/handlers/analytics.go (MODIFY)
    - internal/api/routes.go (MODIFY)
    - internal/api/openapi.json (MODIFY)
    - cmd/server/main.go (MODIFY)
  </files>
  <action>
    1. **Update `main.go`** — Create `TrendsRepo`, pass to `NewJobService`

    2. **Update analytics handler** — Add 3 new endpoints:
       - `GetMarketTrends(w, r)` — calls `svc.GetMarketTrends(ctx, limit)`, returns JSON with cache header 15min
       - `GetSourceDistribution(w, r)` — calls `svc.GetSourceDistribution(ctx)`, returns `{"data": [...]}`
       - `GetSalaryStats(w, r)` — calls `svc.GetSalaryStats(ctx)`, returns stats object
       - `RefreshTrends(w, r)` — POST endpoint that calls `svc.RefreshTrends(ctx)`, returns `{"message": "ok"}`

    3. **Update `routes.go`** — Add under `/api/v1/analytics`:
       - `GET /analytics/trends` → `GetMarketTrends`
       - `GET /analytics/sources` → `GetSourceDistribution`
       - `GET /analytics/salary` → `GetSalaryStats`
       - `POST /analytics/refresh` → `RefreshTrends`

    4. **Update `openapi.json`** — Add the 4 new endpoint definitions with schemas

    DO NOT change existing endpoint behavior.
    DO NOT add auth requirement to GET analytics endpoints (they stay public).
  </action>
  <verify>
    ```bash
    go build ./cmd/server/ && echo "BUILD OK"
    # Start server and test:
    # curl -s http://localhost:8080/api/v1/analytics/sources | python3 -m json.tool
    # curl -s http://localhost:8080/api/v1/analytics/salary | python3 -m json.tool
    # curl -s -X POST http://localhost:8080/api/v1/analytics/refresh
    # curl -s http://localhost:8080/api/v1/analytics/trends | python3 -m json.tool
    ```
  </verify>
  <done>
    - 4 new analytics endpoints return valid JSON
    - OpenAPI spec updated with new paths
    - Full build passes
  </done>
</task>

## Success Criteria
- [ ] `GET /api/v1/analytics/trends` returns top skills with salary data
- [ ] `GET /api/v1/analytics/sources` returns job count per source
- [ ] `GET /api/v1/analytics/salary` returns salary range statistics
- [ ] `POST /api/v1/analytics/refresh` triggers trend snapshot recomputation
- [ ] All existing analytics endpoints (`/skills`, `/summary`) unchanged
- [ ] OpenAPI spec documents new endpoints
