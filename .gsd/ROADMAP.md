# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)

- [ ] Real job data from RapidAPI JSearch + Adzuna
- [ ] Search & filter jobs
- [ ] Market trend insights
- [ ] Modern, responsive UI with dark mode
- [ ] "Apply Now" redirect on job detail page
- [ ] Go concurrency for API fetching
- [ ] Hybrid caching (24h TTL, manual refresh)

## Phases

### Phase 1: Foundation & Data Layer
**Status**: ⬜ Not Started
**Objective**: Set up SQLite storage, define unified job schema, implement the caching layer with 24h TTL, and restructure the Go project for clean architecture.
**Key deliverables**:
- SQLite database with job/company/search_cache tables
- Unified `Job` model replacing the current dual-model setup
- Repository layer with cache-aware read/write operations
- Database migrations and seed logic

---

### Phase 2: Job Source Integrations
**Status**: ⬜ Not Started
**Objective**: Implement Go clients for RapidAPI JSearch and Adzuna, plus an optional web scraper. Use goroutines and channels for concurrent fetching with graceful fallback.
**Key deliverables**:
- `sources/jsearch` — RapidAPI JSearch client with response normalization
- `sources/adzuna` — Adzuna API client with response normalization
- `sources/scraper` — Optional web scraper for a single target site
- `Aggregator` service using goroutines to fan-out/fan-in across sources
- Rate limiting and error handling per source
- Configuration via environment variables for API keys

---

### Phase 3: Search, Filters & Market Trends API
**Status**: ⬜ Not Started
**Objective**: Build the search engine with multi-field filtering, pagination, and the market trends analysis pipeline. Wire hybrid caching into the search flow.
**Key deliverables**:
- Enhanced search with full-text matching, filters (location, experience, remote, salary, source)
- Hybrid cache logic: serve cached if <24h, fetch fresh on search if stale
- Market trends endpoint: top skills, salary ranges, demand signals derived from search results
- Sorting options (date, salary, relevance)
- API response envelopes with proper error handling

---

### Phase 4: Frontend Rebuild — Modern UI
**Status**: ⬜ Not Started
**Objective**: Rebuild the Astro + Preact frontend with a modern, minimalistic design. Focus on search UX, job cards, detail pages with "Apply Now", and market trends visualization.
**Key deliverables**:
- **Home/Search page** — Hero search bar, quick filters, results grid
- **Job detail page** — Full description, skills, salary, "Apply Now" button redirecting to source URL
- **Market trends page** — Charts and insights derived from aggregated data
- **Companies page** — Browse by company
- Dark/light mode toggle with system preference detection
- Responsive design (mobile-first)
- Loading states, error handling, smooth transitions

---

### Phase 5: Polish, Testing & Deploy-Ready
**Status**: ⬜ Not Started
**Objective**: Harden the application with tests, optimize performance, write documentation, and prepare for deployment.
**Key deliverables**:
- Go unit tests for service/repository/source layers
- Frontend component tests
- API integration tests
- Performance optimization (response compression, query optimization)
- README with setup instructions, architecture diagram
- Docker/docker-compose for easy deployment
- Environment-based configuration for production
