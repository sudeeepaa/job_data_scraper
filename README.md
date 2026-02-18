# JobPulse - Job Data Platform

A full-stack job data platform that aggregates listings from LinkedIn and Indeed. Built with **Go** backend and **Astro** frontend.

## Features

- 🔍 **Unified Search** - Search across multiple job sources
- 🎯 **Smart Filters** - Filter by location, experience, salary, source
- 📊 **Analytics Dashboard** - Track trending skills and market insights
- 🌙 **Dark Mode** - Beautiful dark/light theme support
- ⚡ **Optimized Performance** - SSR + Islands architecture for minimal JS

## Tech Stack

### Backend
- **Go** with chi router
- RESTful API design
- In-memory data store (PostgreSQL-ready)

### Frontend
- **Astro** with hybrid SSR/SSG
- **Preact** for interactive islands
- **Tailwind CSS 4** for styling
- **Chart.js** for analytics

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 20+

### 1. Start the Backend

```bash
# From project root
go run ./cmd/server
```

The API will be available at `http://localhost:8080`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:4321`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/jobs` | List jobs with filters & pagination |
| `GET /api/v1/jobs/:id` | Get job details |
| `GET /api/v1/companies` | List companies |
| `GET /api/v1/companies/:slug` | Get company with jobs |
| `GET /api/v1/analytics/skills` | Top skills |
| `GET /api/v1/analytics/summary` | Stats overview |
| `GET /api/v1/filters` | Available filter options |

### Query Parameters (Jobs)

- `q` - Search query
- `location` - Filter by location
- `experience` - Filter by level (entry, mid, senior, lead)
- `source` - Filter by source (linkedin, indeed)
- `remote` - Filter remote only (true)
- `page` - Page number
- `limit` - Items per page (default: 20)

## Project Structure

```
job-data-scraper/
├── cmd/server/          # Go server entry point
├── internal/
│   ├── api/             # HTTP handlers & routes
│   ├── domain/          # Domain models
│   ├── repository/      # Data access
│   └── service/         # Business logic
├── frontend/
│   ├── src/
│   │   ├── components/  # Astro & Preact components
│   │   ├── layouts/     # Page layouts
│   │   ├── pages/       # Route pages
│   │   ├── lib/         # API client
│   │   └── types/       # TypeScript types
│   └── astro.config.mjs
└── README.md
```

## Development

### Backend

```bash
# Build
go build ./cmd/server

# Run with hot reload (requires air)
air
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env`:

```env
PUBLIC_API_URL=http://localhost:8080
```

## License

MIT
