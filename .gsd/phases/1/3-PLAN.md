---
phase: 1
plan: 3
wave: 3
---

# Plan 1.3: Auth System, Service Layer & API Wiring

## Objective
Implement the authentication system (register, login, JWT, middleware), update the service layer to use the new database-backed repository, and rewire `main.go` to boot from SQLite. After this plan, the API server starts with real database, auth endpoints work, and existing job/company/analytics endpoints serve data from SQLite.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md (ADR-007)
- internal/database/database.go (from Plan 1.1)
- internal/domain/user.go (from Plan 1.2)
- internal/repository/ (from Plan 1.2)
- internal/service/job_service.go (existing — will be updated)
- internal/api/routes.go (existing — will be updated)
- internal/api/handlers/ (existing — will be updated)
- cmd/server/main.go (existing — will be updated)

## Tasks

<task type="auto">
  <name>Implement auth service & middleware</name>
  <files>
    internal/service/auth_service.go (NEW)
    internal/api/middleware/auth.go (NEW)
    internal/api/handlers/auth.go (NEW)
  </files>
  <action>
    1. Create `internal/service/auth_service.go`:
       - `AuthService` struct with dependency on `*repository.UserRepo`
       - `Register(ctx, req RegisterRequest) (*AuthResponse, error)`:
         a. Validate email format and password length (min 6 chars)
         b. Check if email already exists → return error if so
         c. Hash password with `bcrypt.GenerateFromPassword` (cost 12)
         d. Generate UUID for user ID
         e. Save user via repo
         f. Generate JWT token
         g. Return AuthResponse with token and user
       - `Login(ctx, req LoginRequest) (*AuthResponse, error)`:
         a. Get user by email → return "invalid credentials" if not found
         b. Compare password with bcrypt → return "invalid credentials" if mismatch
         c. Generate JWT token
         d. Return AuthResponse
       - `generateToken(userID string) (string, error)`:
         a. Create JWT with `golang-jwt/jwt/v5`
         b. Claims: `sub` (user ID), `exp` (24h from now), `iat` (now)
         c. Sign with HS256 and a configurable secret key
         d. Secret loaded from `JWT_SECRET` env var, default to a dev fallback

    2. Create `internal/api/middleware/auth.go`:
       - `AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler`:
         a. Extract `Authorization: Bearer <token>` header
         b. Parse and validate JWT
         c. Extract user ID from claims
         d. Store user ID in request context via `context.WithValue`
         e. If no token or invalid, return 401
       - `OptionalAuthMiddleware(jwtSecret string)` — same but doesn't reject if no token (for checking if user is logged in on public routes)
       - Helper: `GetUserIDFromContext(ctx) (string, bool)` — extracts user ID from context

    3. Create `internal/api/handlers/auth.go`:
       - `AuthHandler` struct with `*service.AuthService`
       - `Register(w, r)` — decode JSON body → call service → return AuthResponse
       - `Login(w, r)` — decode JSON body → call service → return AuthResponse
       - `GetProfile(w, r)` — get user ID from context → return user profile
       - `GetSavedJobs(w, r)` — get user ID → return user's saved jobs
       - `SaveJob(w, r)` — get user ID + job ID from path → save
       - `UnsaveJob(w, r)` — get user ID + job ID from path → unsave
       - All handlers set `Content-Type: application/json`
       - Error responses use consistent JSON format: `{"error": "message"}`
  </action>
  <verify>
    - `go build ./internal/service/` compiles without errors
    - `go build ./internal/api/middleware/` compiles without errors
    - `go build ./internal/api/handlers/` compiles without errors
  </verify>
  <done>Auth system complete: register, login, JWT generation, middleware, profile + saved jobs handlers</done>
</task>

<task type="auto">
  <name>Update service layer & rewire main.go</name>
  <files>
    internal/service/job_service.go (MODIFY)
    internal/api/routes.go (MODIFY)
    cmd/server/main.go (MODIFY)
    internal/config/config.go (NEW)
  </files>
  <action>
    1. Create `internal/config/config.go`:
       - `Config` struct with fields for all env vars:
         - `Port` (default "8080")
         - `DatabasePath` (default "jobpulse.db")
         - `JWTSecret` (default "dev-secret-change-in-production")
         - `CORSOrigins` (default ["http://localhost:4321"])
       - `LoadConfig()` function that reads from environment with defaults

    2. Update `internal/service/job_service.go`:
       - Change `JobService` to take repository interfaces or concrete types backed by `*sqlx.DB`
       - Update constructor: `NewJobService(jobRepo *repository.JobRepo, userRepo *repository.UserRepo, cacheRepo *repository.CacheRepo)`
       - All methods now call the database-backed repository
       - Keep the same method signatures for backward compatibility

    3. Update `internal/api/routes.go`:
       - Add auth routes under `/api/v1/auth/`:
         - `POST /register` → authHandler.Register
         - `POST /login` → authHandler.Login
       - Add protected routes using AuthMiddleware:
         - `GET /api/v1/me` → authHandler.GetProfile
         - `GET /api/v1/me/saved-jobs` → authHandler.GetSavedJobs
         - `POST /api/v1/me/saved-jobs/{id}` → authHandler.SaveJob
         - `DELETE /api/v1/me/saved-jobs/{id}` → authHandler.UnsaveJob
       - Keep existing job/company/analytics routes unchanged
       - Update router constructor to accept all handler dependencies
       - Use OptionalAuthMiddleware on job detail route (to show if job is saved)

    4. Update `cmd/server/main.go`:
       - Load config
       - Initialize database: `database.NewDatabase(cfg.DatabasePath)`
       - Run seed on first launch: `repository.SeedDatabase(ctx, db)`
       - Initialize all repos: `JobRepo`, `UserRepo`, `CacheRepo`
       - Initialize services: `JobService`, `AuthService`
       - Initialize all handlers
       - Create router with all handlers
       - Start server
       - Clean up: `go build ./cmd/server` should produce a working binary

    IMPORTANT:
    - Keep handlers responding with same JSON structure for backward frontend compatibility
    - Use environment variables for all configuration (no hardcoded secrets)
  </action>
  <verify>
    - `go build ./cmd/server` compiles without errors
    - `go vet ./...` passes
    - Running the server creates `jobpulse.db` file
    - `curl http://localhost:8080/health` returns "OK"
    - `curl http://localhost:8080/api/v1/jobs` returns seeded job data from SQLite
    - `curl -X POST http://localhost:8080/api/v1/auth/register -d '{"email":"test@test.com","password":"test123","name":"Test"}' -H 'Content-Type: application/json'` returns a JWT token
  </verify>
  <done>Server boots from SQLite, seeds data, serves jobs, auth endpoints functional</done>
</task>

## Success Criteria
- [ ] Server starts and creates SQLite database on first run
- [ ] Seed data is loaded (10 jobs, 9 companies)
- [ ] All existing job/company/analytics endpoints work with SQLite backend
- [ ] User registration returns JWT token
- [ ] User login returns JWT token
- [ ] Protected routes require valid JWT
- [ ] Save/unsave job endpoints work for authenticated users
- [ ] `go build ./cmd/server` produces a working binary
- [ ] `go vet ./...` passes
