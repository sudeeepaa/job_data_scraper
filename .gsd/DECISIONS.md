# DECISIONS.md — Architecture Decision Records

> Log of significant technical decisions.

## ADR-001: Use RapidAPI JSearch as Primary Job Source
**Date:** 2026-02-20
**Status:** Accepted
**Context:** Need real job data from LinkedIn/Indeed. Direct scraping is legally risky and technically fragile.
**Decision:** Use RapidAPI JSearch (aggregates LinkedIn, Indeed, Glassdoor) as primary source with Adzuna as fallback.
**Consequences:** Limited to ~200 free requests/month on JSearch. Must implement smart caching to stay within limits.

## ADR-002: SQLite for Storage
**Date:** 2026-02-20
**Status:** Accepted
**Context:** Need persistent storage but want zero-dependency deployment (no external database server).
**Decision:** Use SQLite via Go's `database/sql` with `modernc.org/sqlite` (pure Go, no CGO).
**Consequences:** Single-file database, easy to deploy. May limit concurrent writes but sufficient for this use case.

## ADR-003: Hybrid Caching Strategy
**Date:** 2026-02-20
**Status:** Accepted
**Context:** API rate limits require careful management. Users don't need real-time data.
**Decision:** Cache search results for 24 hours. Only refresh when user initiates a search and cached data is stale.
**Consequences:** Reduces API calls dramatically. Users see slightly stale data between refreshes but can manually trigger update.
