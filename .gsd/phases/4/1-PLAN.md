---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: API Client + Types + Analytics Upgrade

## Objective
Extend the frontend API client with the new Phase 3 endpoints (trends, sources, salary, refresh, auth), add corresponding TypeScript types, and upgrade the analytics page to display market trends data with source distribution and salary stats alongside the existing skills chart.

## Context
- `frontend/src/lib/api.ts` — Existing API client (only has jobs, companies, skills, summary)
- `frontend/src/types/index.ts` — Existing types (missing MarketTrend, SalaryStats, SourceDistribution, auth types)
- `frontend/src/pages/analytics.astro` — Current analytics page (skills chart + summary only)
- `frontend/src/components/islands/SkillsChart.tsx` — Existing chart.js component

## Tasks

<task type="auto">
  <name>Extend API client + types for Phase 3 endpoints and auth</name>
  <files>
    - frontend/src/types/index.ts (MODIFY)
    - frontend/src/lib/api.ts (MODIFY)
  </files>
  <action>
    1. **Add types to `frontend/src/types/index.ts`:**
       - `MarketTrend` — `{ skillName: string; mentionCount: number; avgSalaryMin?: number; avgSalaryMax?: number; snapshotDate: string; }`
       - `SourceDistribution` — `{ source: string; count: number; }`
       - `SalaryStats` — `{ minSalary: number; maxSalary: number; avgMin: number; avgMax: number; medianSalary: number; totalWithSalary: number; }`
       - `AuthResponse` — `{ token: string; user: { id: string; email: string; name: string; } }`
       - `UserProfile` — `{ id: string; email: string; name: string; createdAt: string; }`
       - `SavedJob` — Same as `JobSummary`
       - `APIError` — `{ error: string; code: number; }`

    2. **Add API functions to `frontend/src/lib/api.ts`:**
       - `fetchMarketTrends(limit?)` → `GET /api/v1/analytics/trends?limit=N`
       - `fetchSourceDistribution()` → `GET /api/v1/analytics/sources`
       - `fetchSalaryStats()` → `GET /api/v1/analytics/salary`
       - `refreshTrends()` → `POST /api/v1/analytics/refresh`
       - `register(email, password, name)` → `POST /api/v1/auth/register`
       - `login(email, password)` → `POST /api/v1/auth/login`
       - `fetchProfile(token)` → `GET /api/v1/me/` with Authorization header
       - `fetchSavedJobs(token)` → `GET /api/v1/me/saved-jobs`
       - `saveJob(token, jobId)` → `POST /api/v1/me/saved-jobs/{id}`
       - `unsaveJob(token, jobId)` → `DELETE /api/v1/me/saved-jobs/{id}`

    DO NOT change the existing `fetchAPI` function signature.
    DO NOT add any external dependencies.
    Match the Go backend's JSON field names exactly (camelCase from json tags).
  </action>
  <verify>
    ```bash
    cd frontend && npx tsc --noEmit && echo "TYPES OK"
    ```
  </verify>
  <done>
    - All new types compile
    - All 10+ new API functions exist
    - TypeScript check passes
  </done>
</task>

<task type="auto">
  <name>Upgrade analytics page with market trends, sources, salary stats</name>
  <files>
    - frontend/src/pages/analytics.astro (MODIFY)
    - frontend/src/components/islands/TrendsChart.tsx (NEW)
    - frontend/src/components/islands/SourcesChart.tsx (NEW)
  </files>
  <action>
    1. **Create `TrendsChart.tsx`** — Preact island using chart.js:
       - Horizontal bar chart showing top skills with mention counts
       - Each bar labeled with avg salary range on hover tooltip
       - Same styling pattern as existing `SkillsChart.tsx`
       - Props: `{ trends: MarketTrend[]; title: string; }`

    2. **Create `SourcesChart.tsx`** — Preact island using chart.js:
       - Doughnut/pie chart showing source distribution  
       - Color-coded by source (linkedin=blue, indeed=purple, etc.)
       - Props: `{ sources: SourceDistribution[]; title: string; }`

    3. **Update `analytics.astro`:**
       - Add data fetching: `fetchMarketTrends(15)`, `fetchSourceDistribution()`, `fetchSalaryStats()`
       - Add salary stats card row (min, max, avg, median) with green accent
       - Add market trends chart section using `TrendsChart`
       - Add source distribution chart section using `SourcesChart`  
       - Add "Refresh Data" button that calls `POST /api/v1/analytics/refresh` and reloads
       - Keep existing skills chart and summary sections

    DO NOT remove existing analytics sections.
    DO NOT change the page layout structure — extend it.
    Use the same card/section styling as existing analytics page elements.
  </action>
  <verify>
    ```bash
    cd frontend && npm run build 2>&1 | tail -5 && echo "BUILD OK"
    ```
  </verify>
  <done>
    - Analytics page shows salary stats, trends chart, sources chart
    - Existing skills chart and summary still present
    - Page builds without errors
  </done>
</task>

## Success Criteria
- [ ] API client has functions for all Phase 3 + auth endpoints
- [ ] TypeScript types match Go backend models
- [ ] Analytics page shows market trends with salary data
- [ ] Analytics page shows source distribution chart
- [ ] Analytics page shows salary statistics
- [ ] "Refresh Data" button triggers trend recomputation
- [ ] Existing analytics (skills + summary) unchanged
