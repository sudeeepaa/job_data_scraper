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

## Phase 1 Discussion Decisions (2026-02-20)

### ADR-004: Remove CLI Scraper, Start Fresh
**Date:** 2026-02-20
**Status:** Accepted
**Context:** Existing codebase has two subsystems: CLI scraper (broken, missing packages) and web platform (mock data). Maintaining both adds complexity.
**Decision:** Remove `cmd/job-data-scraper/` and `models/` package entirely. Start fresh with unified web platform.
**Consequences:** Cleaner codebase. All scraping will be done through the web API, not a separate CLI tool.

### ADR-005: sqlx for Database Access
**Date:** 2026-02-20
**Status:** Accepted
**Context:** Need a SQL layer for SQLite. Options: raw `database/sql`, `sqlx`, or `GORM`.
**Decision:** Use `jmoiron/sqlx` — thin wrapper over `database/sql` with struct scanning and named parameters.
**Consequences:** Go-native SQL feel with quality-of-life improvements. No ORM magic hiding queries.

### ADR-006: Embedded SQL Migrations
**Date:** 2026-02-20
**Status:** Accepted
**Context:** Need schema migrations without external tools.
**Decision:** Use Go `embed` package to embed SQL migration files in the binary.
**Consequences:** Self-contained binary, no migration tool dependency. Migrations run on startup.

### ADR-007: Simple Email/Password Authentication
**Date:** 2026-02-20
**Status:** Accepted
**Context:** User wants to save/bookmark jobs and track viewed listings. Requires user identity.
**Decision:** Implement email/password registration with bcrypt hashing and JWT session tokens.
**Consequences:** Adds `users` and `saved_jobs` tables. Auth middleware for protected routes. More portfolio-impressive.

### ADR-008: Keep Mock Data as Seed
**Date:** 2026-02-20
**Status:** Accepted
**Context:** Frontend currently works with mock data. Need to keep it functional during rebuild.
**Decision:** Preserve existing mock data as database seed, used as fallback when APIs are unavailable.
**Consequences:** App always has data to display even without API keys configured.
