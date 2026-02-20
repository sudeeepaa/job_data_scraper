# Phase 2 Research: Job Source Integrations

## API Response Formats

### RapidAPI JSearch (`/search`)
- **Host**: `jsearch.p.rapidapi.com`
- **Auth**: `X-RapidAPI-Key` + `X-RapidAPI-Host` headers
- **Response**: `{ status, request_id, data: [jobs] }`
- **Job fields**: `job_id`, `employer_name`, `employer_logo`, `employer_website`, `job_publisher`, `job_employment_type` (FULLTIME/PARTTIME/CONTRACTOR/INTERN), `job_title`, `job_apply_link`, `job_description`, `job_url`, `apply_options[]`
- **Location**: nested fields for city, state, country
- **Salary**: estimated fields
- **Params**: `query`, `page`, `num_pages`, `date_posted`, `employment_types`, `job_requirements`
- **Rate limit**: ~200 requests/month free tier, exposed in response headers

### Adzuna API (`/v1/api/jobs/{country}/search/{page}`)
- **Auth**: `app_id` + `app_key` query params
- **Response**: `{ results: [jobs], count, mean }`
- **Job fields**: `id`, `title`, `description`, `company.display_name`, `location.display_name`, `location.area[]`, `salary_min`, `salary_max`, `salary_is_predicted`, `contract_type`, `contract_time`, `category.label`, `created`, `redirect_url`, `latitude`, `longitude`
- **Params**: `what` (keywords), `where` (location), `full_time`/`part_time`, `salary_min`/`salary_max`, `sort_by`, `results_per_page`, `content-type=application/json`
- **Rate limit**: ~250 requests/day free tier

## Normalization Mapping

| Our Field | JSearch | Adzuna |
|-----------|---------|--------|
| id | UUID generated | UUID generated |
| external_id | job_id | id (string) |
| title | job_title | title |
| description | job_description | description |
| company | employer_name | company.display_name |
| company_slug | slugify(employer_name) | slugify(company) |
| location | city + state | location.display_name |
| salary_min | salary estimate | salary_min |
| salary_max | salary estimate | salary_max |
| source | "jsearch" | "adzuna" |
| source_url | job_apply_link | redirect_url |
| employment_type | job_employment_type (normalize) | contract_time |
| is_remote | infer from location/title | infer from location/title |
| posted_at | posted timestamp | created |

## Architecture Decisions

- **No scraper in Phase 2**: SPEC says optional, keep scope tight. Can add later.
- **Aggregator pattern**: Fan-out goroutines per source, fan-in via channel, dedup by title+company.
- **Key storage**: Environment variables (JSEARCH_API_KEY, ADZUNA_APP_ID, ADZUNA_APP_KEY).
- **Caching integration**: Aggregator checks cache freshness before calling APIs. If fresh, skip.
- **Skills extraction**: Parse from job description keywords (not provided by APIs directly). Defer to Phase 3 for proper NLP — for now, store empty or basic.
