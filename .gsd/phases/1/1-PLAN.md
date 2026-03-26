---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Project Cleanup & Database Foundation

## Objective
Remove the defunct CLI scraper code, set up SQLite with embedded migrations, and create the complete database schema. This establishes the storage foundation that all subsequent plans depend on.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- .gsd/DECISIONS.md (ADR-002, ADR-004, ADR-005, ADR-006)
- go.mod
- cmd/job-data-scraper/main.go (to be removed)
- models/ (to be removed)

## Tasks

<task type="auto">
  <name>Clean up legacy code & add dependencies</name>
  <files>
    cmd/job-data-scraper/ (DELETE entire directory)
    models/ (DELETE entire directory)
    server (DELETE pre-compiled binary)
    .gitignore (ADD server binary, SQLite DB files)
    go.mod (ADD new dependencies)
  </files>
  <action>
    1. Delete `cmd/job-data-scraper/` directory entirely
    2. Delete `models/` directory entirely
    3. Delete the `server` binary from repo root (9MB pre-compiled binary)
    4. Update `.gitignore` to exclude:
       - `server` (binary)
       - `*.db` (SQLite database files)
       - `.env` (environment variables)
    5. Run `go get` to add these dependencies to go.mod:
       - `modernc.org/sqlite` (pure-Go SQLite driver)
       - `github.com/jmoiron/sqlx` (SQL extensions)
       - `github.com/golang-jwt/jwt/v5` (JWT tokens)
       - `golang.org/x/crypto` (bcrypt for password hashing)
    6. Run `go mod tidy` to clean up
  </action>
  <verify>
    - `ls cmd/` should only show `server/`
    - `ls models/` should fail (directory removed)
    - `ls server` should fail (binary removed)
    - `go mod tidy` succeeds without errors
    - `grep "modernc.org/sqlite" go.mod` returns a match
    - `grep "jmoiron/sqlx" go.mod` returns a match
    - `grep "golang-jwt" go.mod` returns a match
  </verify>
  <done>Old scraper code removed, new dependencies installed, .gitignore updated</done>
</task>

<task type="auto">
  <name>Create embedded migration system & database schema</name>
  <files>
    internal/database/migrations/001_initial_schema.sql (NEW)
    internal/database/database.go (NEW)
  </files>
  <action>
    1. Create `internal/database/migrations/001_initial_schema.sql` with full schema:

       ```sql
       -- Users table
       CREATE TABLE IF NOT EXISTS users (
           id TEXT PRIMARY KEY,
           email TEXT UNIQUE NOT NULL,
           password_hash TEXT NOT NULL,
           name TEXT NOT NULL DEFAULT '',
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
       );

       -- Jobs table (unified model, stores cached API results)
       CREATE TABLE IF NOT EXISTS jobs (
           id TEXT PRIMARY KEY,
           external_id TEXT,
           title TEXT NOT NULL,
           description TEXT NOT NULL DEFAULT '',
           company TEXT NOT NULL,
           company_slug TEXT NOT NULL DEFAULT '',
           location TEXT NOT NULL DEFAULT '',
           salary_min INTEGER,
           salary_max INTEGER,
           salary_currency TEXT DEFAULT 'USD',
           posted_at DATETIME,
           expires_at DATETIME,
           source TEXT NOT NULL,
           source_url TEXT NOT NULL DEFAULT '',
           skills TEXT DEFAULT '[]',
           is_remote BOOLEAN DEFAULT FALSE,
           employment_type TEXT DEFAULT 'full-time',
           experience_level TEXT DEFAULT '',
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
       );
       CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
       CREATE INDEX IF NOT EXISTS idx_jobs_company_slug ON jobs(company_slug);
       CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);

       -- Companies table
       CREATE TABLE IF NOT EXISTS companies (
           slug TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           industry TEXT DEFAULT '',
           description TEXT DEFAULT '',
           website TEXT DEFAULT '',
           logo_url TEXT DEFAULT '',
           job_count INTEGER DEFAULT 0,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
       );

       -- Search cache table (tracks freshness for hybrid caching)
       CREATE TABLE IF NOT EXISTS search_cache (
           query_hash TEXT PRIMARY KEY,
           query_text TEXT NOT NULL,
           filters TEXT DEFAULT '{}',
           result_count INTEGER DEFAULT 0,
           fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
       );

       -- Saved jobs (user bookmarks)
       CREATE TABLE IF NOT EXISTS saved_jobs (
           user_id TEXT NOT NULL,
           job_id TEXT NOT NULL,
           saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           PRIMARY KEY (user_id, job_id),
           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
           FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
       );

       -- Market trends (aggregated data from searches)
       CREATE TABLE IF NOT EXISTS market_trends (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           skill_name TEXT NOT NULL,
           mention_count INTEGER DEFAULT 0,
           avg_salary_min INTEGER,
           avg_salary_max INTEGER,
           snapshot_date DATE NOT NULL,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
       );
       CREATE INDEX IF NOT EXISTS idx_market_trends_date ON market_trends(snapshot_date);
       CREATE INDEX IF NOT EXISTS idx_market_trends_skill ON market_trends(skill_name);
       ```

    2. Create `internal/database/database.go`:
       - Use `//go:embed migrations/*.sql` to embed migration files
       - `NewDatabase(dbPath string) (*sqlx.DB, error)` function that:
         a. Opens SQLite connection with `modernc.org/sqlite` driver
         b. Enables WAL mode and foreign keys via PRAGMA
         c. Reads and executes embedded migrations
         d. Returns the `*sqlx.DB` connection
       - Keep it simple: run all migration files in order on startup
       - DO NOT use a migration framework — just read .sql files and exec

    NOTE: Skills in jobs table are stored as JSON text (TEXT column). Go code will marshal/unmarshal []string to/from JSON.
  </action>
  <verify>
    - `go build ./internal/database/` compiles without errors
    - Migration SQL file exists at `internal/database/migrations/001_initial_schema.sql`
    - The database.go file uses `//go:embed`
  </verify>
  <done>Embedded migration system created, full schema defined, database.go compiles cleanly</done>
</task>

## Success Criteria
- [ ] All legacy scraper code removed from repo
- [ ] New Go dependencies installed (sqlite, sqlx, jwt, bcrypt)
- [ ] SQLite database can be created and migrated with all 6 tables
- [ ] `go build ./...` succeeds
