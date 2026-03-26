---
phase: 5
plan: 3
wave: 2
---

# Plan 5.3: Docker + README + Environment Config

## Objective
Make the project deployment-ready with Docker/docker-compose, a comprehensive README, and proper environment configuration with `.env.example`.

## Context
- `cmd/server/main.go` — Server entry point
- `internal/config/config.go` — Configuration loading
- `frontend/` — Astro frontend (Node.js)
- `go.mod` — Go module definition
- `frontend/package.json` — Frontend dependencies

## Tasks

<task type="auto">
  <name>Create Dockerfile, docker-compose, and .env.example</name>
  <files>
    - Dockerfile (NEW)
    - docker-compose.yml (NEW)
    - .env.example (NEW)
    - .dockerignore (NEW)
  </files>
  <action>
    1. **Create `Dockerfile`** — Multi-stage build:
       - **Stage 1 (frontend):** Use `node:20-alpine`, copy `frontend/`, run `npm ci && npm run build`
       - **Stage 2 (backend):** Use `golang:1.22-alpine`, copy Go source, run `go build -o /server ./cmd/server/`
       - **Stage 3 (runtime):** Use `alpine:3.19`, copy compiled binary + frontend dist, set entrypoint
       - Final image should be < 50MB

    2. **Create `docker-compose.yml`:**
       - Single service `jobpulse` using the Dockerfile
       - Port mapping: `8080:8080`
       - Environment variables from `.env` file
       - Volume for SQLite data persistence: `./data:/app/data`
       - Healthcheck: `curl -f http://localhost:8080/api/v1/analytics/summary || exit 1`

    3. **Create `.env.example`:**
       - Document ALL environment variables used by `internal/config/config.go`
       - Include: `JSEARCH_API_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `JWT_SECRET`, `PORT`, `DB_PATH`
       - Add comments explaining each variable
       - Include safe defaults where appropriate

    4. **Create `.dockerignore`:**
       - Ignore: `.git`, `node_modules`, `.gsd`, `*.db`, `.env`, `frontend/node_modules`, `frontend/dist`

    DO NOT use docker-compose v2 extension features — keep it compatible.
    DO NOT hardcode any secrets or API keys.
  </action>
  <verify>
    ```bash
    # Verify Dockerfile syntax:
    cat Dockerfile | head -5
    # Verify docker-compose:
    cat docker-compose.yml
    # Verify build (dry run — don't actually build):
    go build ./cmd/server/ && echo "BUILD OK"
    ```
  </verify>
  <done>
    - Multi-stage Dockerfile exists and is syntactically correct
    - docker-compose.yml references Dockerfile with proper config
    - .env.example documents all environment variables
    - .dockerignore excludes dev artifacts
  </done>
</task>

<task type="auto">
  <name>Create comprehensive README</name>
  <files>
    - README.md (NEW or OVERWRITE)
  </files>
  <action>
    1. **Write `README.md`** with these sections:
       - **Header** — Project name, one-line description, badges (Go version, License)
       - **Features** — Bullet list of all features (multi-source aggregation, search/filter, market trends, auth, saved jobs, dark mode, responsive)
       - **Architecture** — Brief text + ASCII diagram showing: Frontend (Astro) → API (Go/chi) → Services → Repository → SQLite
       - **Tech Stack** — Table: Backend (Go, chi, sqlx, SQLite), Frontend (Astro, Preact, Tailwind CSS, Chart.js), Infrastructure (Docker)
       - **Quick Start** — Step-by-step to run locally:
         1. Clone repo
         2. Copy `.env.example` to `.env`, fill in API keys
         3. `go run ./cmd/server/` (starts backend with seed data on :8080)
         4. `cd frontend && npm install && npm run dev` (starts frontend on :4321)
       - **Docker** — `docker compose up` one-liner
       - **API Reference** — Table of all endpoints with method, path, description, auth required
       - **Project Structure** — `tree`-style listing of key directories
       - **Environment Variables** — Table from .env.example with descriptions
       - **Running Tests** — `go test ./...`
       - **License** — MIT

    DO NOT include placeholder or example output — keep it concrete.
    DO NOT exceed 300 lines — keep it concise but complete.
  </action>
  <verify>
    ```bash
    wc -l README.md && echo "README EXISTS"
    ```
  </verify>
  <done>
    - README.md covers all sections
    - Quick start instructions are copy-paste runnable
    - API reference lists all endpoints
    - Under 300 lines
  </done>
</task>

## Success Criteria
- [ ] Dockerfile builds multi-stage (frontend + backend + runtime)
- [ ] docker-compose.yml with port mapping, volumes, healthcheck
- [ ] .env.example documents ALL environment variables
- [ ] README.md with quick start, architecture, API reference
- [ ] README under 300 lines
