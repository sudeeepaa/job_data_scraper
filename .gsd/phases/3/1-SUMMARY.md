## Plan 3.1 Summary: Market Trends Pipeline + API Endpoints

### Completed
- Created `internal/repository/trends_repo.go` with 4 methods: `ComputeAndStoreSnapshot`, `GetTrends`, `GetSourceDistribution`, `GetSalaryStats`
- Added `SalaryStats` domain type to `internal/domain/analytics.go` with proper `db` tags
- Updated `JobService` with 4 new methods and `trendsRepo` dependency
- Added 4 analytics handler endpoints and wired routes
- Updated `main.go` to initialize `TrendsRepo`

### Endpoints Added
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/trends` | Top skills with salary data |
| GET | `/api/v1/analytics/sources` | Job count per source |
| GET | `/api/v1/analytics/salary` | Aggregate salary statistics |
| POST | `/api/v1/analytics/refresh` | Recompute trend snapshot |

### Verified
- All 4 endpoints return valid JSON
- Trends shows 10 skills with salary ranges
- Salary stats includes median computation
- Build passes
