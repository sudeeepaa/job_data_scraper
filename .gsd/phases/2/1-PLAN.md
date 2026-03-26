---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Job Source API Clients

## Objective
Create Go HTTP clients for RapidAPI JSearch and Adzuna APIs that fetch job listings and normalize them into our unified `domain.Job` model. Each client is a standalone package under `internal/sources/`.

## Context
- .gsd/SPEC.md
- .gsd/phases/2/RESEARCH.md
- internal/domain/job.go (Job, StringSlice models)
- internal/config/config.go (env var loading)

## Tasks

<task type="auto">
  <name>Create JSearch API client</name>
  <files>
    internal/sources/jsearch/client.go
    internal/sources/jsearch/models.go
    internal/config/config.go (add API key fields)
  </files>
  <action>
    1. Add `JSearchAPIKey` to config.Config, read from `JSEARCH_API_KEY` env var
    2. Create `internal/sources/jsearch/models.go`:
       - Define `searchResponse` struct: Status, RequestID, Data []jobResult
       - Define `jobResult` struct matching JSearch API fields: JobID, EmployerName, EmployerLogo, EmployerWebsite, JobTitle, JobDescription, JobApplyLink, JobEmploymentType, JobCity, JobState, JobCountry, JobMinSalary, JobMaxSalary, JobPostedAt etc.
    3. Create `internal/sources/jsearch/client.go`:
       - `Client` struct with httpClient, apiKey, host fields
       - `New(apiKey string) *Client` constructor, set default timeout (10s)
       - `Search(ctx context.Context, query, location string, page int) ([]domain.Job, error)`:
         - Build URL: `https://jsearch.p.rapidapi.com/search?query={query}&page={page}&num_pages=1`
         - If location != "", append to query as "{query} in {location}"
         - Set headers: X-RapidAPI-Key, X-RapidAPI-Host
         - Decode JSON into searchResponse
         - Call normalize() on each jobResult → domain.Job
       - `normalize(jr jobResult) domain.Job`:
         - Map all fields per RESEARCH.md normalization table
         - Generate ID as UUID
         - Set external_id = jr.JobID
         - Slugify employer_name for company_slug
         - Infer is_remote from location containing "remote" or "anywhere"
         - Normalize employment_type: "FULLTIME"→"full-time", etc.
         - Set source = "jsearch", source_url = jr.JobApplyLink
         - Extract basic skills from description (simple keyword match for common tech terms)
  </action>
  <verify>go build ./internal/sources/jsearch/ && echo "JSEARCH OK"</verify>
  <done>JSearch client compiles, has Search() returning []domain.Job, normalizes all fields</done>
</task>

<task type="auto">
  <name>Create Adzuna API client</name>
  <files>
    internal/sources/adzuna/client.go
    internal/sources/adzuna/models.go
    internal/config/config.go (add Adzuna fields)
  </files>
  <action>
    1. Add `AdzunaAppID` and `AdzunaAppKey` to config.Config, read from `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`
    2. Create `internal/sources/adzuna/models.go`:
       - Define `searchResponse` struct: Results []jobResult, Count int
       - Define `jobResult` struct: ID, Title, Description, Company (nested: DisplayName), Location (nested: DisplayName, Area []string), SalaryMin, SalaryMax, SalaryIsPredicted, ContractType, ContractTime, Category (nested: Label, Tag), Created, RedirectURL
    3. Create `internal/sources/adzuna/client.go`:
       - `Client` struct with httpClient, appID, appKey, country fields
       - `New(appID, appKey string) *Client` constructor, country defaults to "us"
       - `Search(ctx context.Context, query, location string, page int) ([]domain.Job, error)`:
         - Build URL: `https://api.adzuna.com/v1/api/jobs/{country}/search/{page}?app_id={}&app_key={}&what={query}&results_per_page=10&content-type=application/json`
         - If location != "", add `where={location}`
         - Decode JSON into searchResponse
         - Call normalize() on each jobResult → domain.Job
       - `normalize(jr jobResult) domain.Job`:
         - Map all fields per RESEARCH.md normalization table
         - Generate ID as UUID
         - Set external_id = string(jr.ID)
         - Slugify company for company_slug
         - Parse jr.Created into time.Time
         - Set source = "adzuna", source_url = jr.RedirectURL
         - Infer is_remote and employment_type from ContractTime/title
         - Convert salary from annual (GBP for UK) — keep as-is for US
  </action>
  <verify>go build ./internal/sources/adzuna/ && echo "ADZUNA OK"</verify>
  <done>Adzuna client compiles, has Search() returning []domain.Job, normalizes all fields</done>
</task>

## Success Criteria
- [ ] Both clients compile independently
- [ ] Both produce []domain.Job with correct field mapping
- [ ] Config loads API keys from environment
- [ ] Source field is "jsearch" or "adzuna" respectively
