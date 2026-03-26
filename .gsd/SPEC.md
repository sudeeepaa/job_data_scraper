# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

**JobPulse** is a full-stack job aggregation platform that pulls real listings from multiple sources (RapidAPI JSearch, Adzuna, and optional web scraping), lets users search and filter jobs with a modern UI, shows market trend insights derived from search data, and redirects users to apply directly. Built with a Go backend showcasing concurrency, caching, and clean architecture — designed as a college project and portfolio piece.

## Goals

1. **Real job data** — Aggregate listings from RapidAPI JSearch (primary), Adzuna (fallback), and optionally scraped sources into a unified format
2. **Smart search & filters** — Search by title/skill/company with filters for location, experience, remote, salary, and source
3. **Market trend insights** — Show trending skills, salary ranges, and demand patterns derived from the user's search results and aggregated data
4. **Modern, user-centric UI** — Minimalistic interface that works for technical and non-technical job seekers, with dark mode, responsive design, and smooth interactions
5. **Apply redirect** — Each job detail page shows an "Apply Now" button that opens the original job posting URL
6. **Go-centric backend** — Leverage goroutines for concurrent API fetching, channels, middleware patterns, caching, and clean architecture
7. **User accounts** — Simple email/password login so users can save/bookmark jobs and track viewed listings

## Non-Goals (Out of Scope)

- ~~User authentication / accounts~~ *(moved to goals)*
- Job application tracking (just redirect to source)
- Resume parsing or matching
- Email notifications or alerts
- Admin panel
- Real-time WebSocket updates
- Mobile native app

## Users

**Primary:** College students and professionals (technical and non-technical) looking for jobs. They want to search across multiple platforms from a single interface, see what skills are in demand, and quickly apply.

**Secondary:** Portfolio viewers (recruiters, professors) evaluating the project's technical quality.

## Constraints

- **API rate limits** — RapidAPI JSearch free tier: ~200 requests/month; Adzuna free tier: ~250/day
- **No database** — Use SQLite or file-based storage to keep deployment simple (no external DB dependency)
- **Budget** — $0 — all APIs must have free tiers
- **Timeline** — College project timeline
- **Deployment** — Must run locally; optionally deployable to free hosting (Railway, Render, etc.)

## Data Strategy

- **Hybrid caching** — Cache search results for 24 hours. Data older than 1 day is refreshed on the next user-initiated search (not automatically)
- **No background jobs** — Fetching only happens when a user searches
- **Graceful degradation** — If primary API is down/exhausted, fall back to Adzuna, then to cached data

## Success Criteria

- [ ] Users can search for jobs and see real listings from at least 2 sources
- [ ] Job detail page shows full description + "Apply Now" redirect button
- [ ] Market trends section shows relevant insights for the search query
- [ ] UI is responsive, has dark mode, and looks portfolio-worthy
- [ ] Backend uses Go concurrency (goroutines for parallel API calls)
- [ ] Data is cached and refreshes only when stale (>24h) on search
- [ ] Users can register, log in, and save/bookmark jobs
- [ ] Project runs locally with `go run` + `npm run dev`
- [ ] Deployable to a free hosting platform
