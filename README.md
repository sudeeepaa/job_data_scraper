# JobPulse — Job Data Platform

A full-stack job aggregation platform that pulls real listings from multiple sources, lets users search and filter jobs, shows market trend insights, and redirects users to apply. Built with **Go** backend (goroutines, SQLite, JWT auth) and **Astro** frontend.

> 51 tests | Multi-stage Docker | Zero external dependencies

## Features

- 🔍 **Real Job Data** - Aggregates from RapidAPI JSearch + Adzuna
- 🎯 **Smart Filters** - Location, experience, salary, source, remote
- 📊 **Analytics Dashboard** - Trending skills and market insights
- 🔐 **User Accounts** - Register, login, save/bookmark jobs
- ⚡ **Concurrent Fetching** - Goroutine fan-out/fan-in across sources
- 📦 **Hybrid Caching** - 24h TTL with manual refresh
- 🌙 **Dark Mode** - Beautiful dark/light theme support

## Tech Stack

### Backend
- **Go** with chi router
- **SQLite** via modernc.org/sqlite (zero-dependency)
- **JWT** authentication (bcrypt, HS256)
- Goroutine-based job aggregator
- Repository pattern with sqlx

### Frontend
- **Astro** with hybrid SSR/SSG
- **Preact** for interactive islands
- **Tailwind CSS 4** for styling

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 20+

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys (optional — app works with seed data)
# Local `go run ./cmd/server` now auto-loads `.env`
```

### 2. Start the Backend

```bash
go run ./cmd/server
```

The API will be available at `http://localhost:8080`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:4321`

### Docker

```bash
# Build and run everything
docker compose up --build

# Or just the API
docker build -t jobpulse-api .
docker run -p 8080:8080 -v jobpulse-data:/data jobpulse-api
```

### Run Tests

```bash
# All tests (repo + service + API integration)
go test ./... -v

# Just unit tests
go test ./internal/repository/... ./internal/service/... -v

# API integration tests only
go test ./internal/api/... -v
```

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `8080` | No | Server port |
| `DATABASE_PATH` | `jobpulse.db` | No | SQLite database file |
| `JWT_SECRET` | dev default | **Yes (prod)** | JWT signing secret |
| `CORS_ORIGINS` | `http://localhost:4321` | No | Allowed CORS origins |
| `JSEARCH_API_KEY` | — | No | RapidAPI JSearch key |
| `ADZUNA_APP_ID` | — | No | Adzuna application ID |
| `ADZUNA_APP_KEY` | — | No | Adzuna application key |

> **Note:** The app works without API keys using seed data. Add keys to enable live job fetching.

### Optional Live Sync

Use these to keep the local database warm with real API data in the background:

| Variable | Example | Description |
|----------|---------|-------------|
| `LIVE_SYNC_QUERIES` | `golang developer|python developer` | `|`-separated searches to refresh periodically |
| `LIVE_SYNC_LOCATIONS` | `Remote|San Francisco, CA` | Optional `|`-separated locations |
| `LIVE_SYNC_INTERVAL` | `30m` | Sync cadence (`time.ParseDuration` format, or minutes) |
| `LIVE_SYNC_ON_START` | `true` | Run one sync immediately on server startup |

When enabled, the worker fetches page 1 for each query/location pair and refreshes analytics afterward.

## Data Sources

| Source | API | Rate Limit |
|--------|-----|------------|
| JSearch | RapidAPI JSearch | ~200 req/month (free) |
| Adzuna | Adzuna REST API | ~250 req/day (free) |

Jobs are fetched on-demand when users search with `refresh=true`, cached for 24 hours, and deduplicated across sources.

## API Endpoints

### Public

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/v1/jobs` | List jobs with filters & pagination |
| `GET /api/v1/jobs/:id` | Get job details |
| `GET /api/v1/companies` | List companies |
| `GET /api/v1/companies/:slug` | Get company with jobs |
| `GET /api/v1/analytics/skills` | Top skills |
| `GET /api/v1/analytics/summary` | Stats overview |
| `GET /api/v1/analytics/trends` | Market trends by skill |
| `GET /api/v1/analytics/sources` | Source distribution |
| `GET /api/v1/analytics/salary` | Salary statistics |
| `POST /api/v1/analytics/refresh` | Recompute trends |
| `GET /api/v1/filters` | Available filter options |

### Auth

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | Register (email, password, name) |
| `POST /api/v1/auth/login` | Login (returns JWT) |

### Protected (Bearer token required)

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/me` | Get user profile |
| `GET /api/v1/me/saved-jobs` | List saved jobs |
| `POST /api/v1/me/saved-jobs/:id` | Save a job |
| `DELETE /api/v1/me/saved-jobs/:id` | Unsave a job |

### Query Parameters (Jobs)

| Param | Description |
|-------|-------------|
| `q` | Search query |
| `location` | Filter by location |
| `experience` | Filter by level (entry, mid, senior, lead) |
| `source` | Filter by source (jsearch, adzuna) |
| `remote` | Filter remote only (`true`) |
| `salary_min` | Minimum salary filter |
| `refresh` | Trigger live API fetch (`true`) |
| `page` | Page number |
| `limit` | Items per page (default: 20) |

## Project Structure

```
job-data-scraper/
├── cmd/server/              # Go server entry point
├── internal/
│   ├── api/                 # HTTP handlers, middleware, routes + integration tests
│   ├── config/              # Environment variable loading
│   ├── database/
│   │   └── migrations/      # Embedded SQL migrations (001, 002)
│   ├── domain/              # Domain models (Job, User, Company, etc.)
│   ├── repository/          # Data access layer + unit tests
│   ├── service/             # Business logic + unit tests
│   └── sources/             # Job API clients (JSearch, Adzuna)
├── frontend/                # Astro frontend
├── Dockerfile               # Multi-stage build (Node → Go → Alpine)
├── docker-compose.yml       # Full stack deployment
├── .env.example             # Environment template
└── README.md
```

## License

MIT
