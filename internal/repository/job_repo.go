package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// JobRepo provides database-backed access to job and company data.
type JobRepo struct {
	db *sqlx.DB
}

// NewJobRepo creates a new job repository.
func NewJobRepo(db *sqlx.DB) *JobRepo {
	return &JobRepo{db: db}
}

// ListJobs returns filtered and paginated jobs.
func (r *JobRepo) ListJobs(ctx context.Context, params domain.JobQueryParams, pag domain.Pagination) ([]domain.JobSummary, int, error) {
	// Build dynamic WHERE clause
	where := []string{"1=1"}
	args := map[string]interface{}{}

	if params.Query != "" {
		where = append(where, "(LOWER(title) LIKE :query OR LOWER(company) LIKE :query OR LOWER(skills) LIKE :query)")
		args["query"] = "%" + strings.ToLower(params.Query) + "%"
	}
	if params.Location != "" {
		for idx, term := range splitLocationTerms(params.Location) {
			key := fmt.Sprintf("location_%d", idx)
			where = append(where, fmt.Sprintf("LOWER(location) LIKE :%s", key))
			args[key] = "%" + term + "%"
		}
	}
	if params.ExperienceLevel != "" {
		where = append(where, "experience_level = :experience_level")
		args["experience_level"] = params.ExperienceLevel
	}
	if params.Source != "" {
		where = append(where, "source = :source")
		args["source"] = params.Source
	}
	if params.SalaryMin != nil {
		where = append(where, "salary_max >= :salary_min")
		args["salary_min"] = *params.SalaryMin
	}
	if params.IsRemote != nil {
		where = append(where, "is_remote = :is_remote")
		args["is_remote"] = *params.IsRemote
	}
	if params.EmploymentType != "" {
		where = append(where, "employment_type = :employment_type")
		args["employment_type"] = params.EmploymentType
	}

	whereClause := strings.Join(where, " AND ")

	// Sort
	orderBy := "posted_at DESC"
	switch params.Sort {
	case "date_asc":
		orderBy = "posted_at ASC"
	case "salary_desc":
		orderBy = "COALESCE(salary_max, 0) DESC"
	case "salary_asc":
		orderBy = "COALESCE(salary_min, 0) ASC"
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM jobs WHERE %s", whereClause)
	countStmt, countArgs, err := sqlx.Named(countQuery, args)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to build count query: %w", err)
	}
	countStmt = r.db.Rebind(countStmt)

	var total int
	if err := r.db.GetContext(ctx, &total, countStmt, countArgs...); err != nil {
		return nil, 0, fmt.Errorf("failed to count jobs: %w", err)
	}

	// Fetch paginated results
	args["limit"] = pag.Limit
	args["offset"] = pag.Offset()

	selectQuery := fmt.Sprintf(`
		SELECT id, title, company, company_slug, location,
		       salary_min, salary_max, salary_currency,
		       posted_at, source, source_url, skills, is_remote, experience_level
		FROM jobs
		WHERE %s
		ORDER BY %s
		LIMIT :limit OFFSET :offset
	`, whereClause, orderBy)

	stmt, selectArgs, err := sqlx.Named(selectQuery, args)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to build select query: %w", err)
	}
	stmt = r.db.Rebind(stmt)

	var jobs []domain.JobSummary
	if err := r.db.SelectContext(ctx, &jobs, stmt, selectArgs...); err != nil {
		return nil, 0, fmt.Errorf("failed to list jobs: %w", err)
	}

	if jobs == nil {
		jobs = []domain.JobSummary{}
	}

	return jobs, total, nil
}

func splitLocationTerms(location string) []string {
	rawParts := strings.Split(strings.ToLower(location), ",")
	terms := make([]string, 0, len(rawParts))
	seen := make(map[string]bool, len(rawParts))

	for _, part := range rawParts {
		part = strings.TrimSpace(part)
		if part == "" || seen[part] {
			continue
		}
		seen[part] = true
		terms = append(terms, part)
	}

	if len(terms) == 0 {
		return []string{strings.TrimSpace(strings.ToLower(location))}
	}

	return terms
}

// GetJob returns a single job by ID.
func (r *JobRepo) GetJob(ctx context.Context, id string) (*domain.Job, error) {
	var job domain.Job
	err := r.db.GetContext(ctx, &job, "SELECT * FROM jobs WHERE id = ?", id)
	if err != nil {
		return nil, nil // Not found
	}
	return &job, nil
}

// UpsertJob inserts or updates a job.
func (r *JobRepo) UpsertJob(ctx context.Context, job *domain.Job) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO jobs (id, external_id, title, description, company, company_slug, location,
		                   salary_min, salary_max, salary_currency, posted_at, expires_at,
		                   source, source_url, skills, is_remote, employment_type, experience_level)
		VALUES (:id, :external_id, :title, :description, :company, :company_slug, :location,
		        :salary_min, :salary_max, :salary_currency, :posted_at, :expires_at,
		        :source, :source_url, :skills, :is_remote, :employment_type, :experience_level)
		ON CONFLICT(id) DO UPDATE SET
		    title = excluded.title,
		    description = excluded.description,
		    company = excluded.company,
		    company_slug = excluded.company_slug,
		    location = excluded.location,
		    salary_min = excluded.salary_min,
		    salary_max = excluded.salary_max,
		    salary_currency = excluded.salary_currency,
		    posted_at = excluded.posted_at,
		    expires_at = excluded.expires_at,
		    source = excluded.source,
		    source_url = excluded.source_url,
		    skills = excluded.skills,
		    is_remote = excluded.is_remote,
		    employment_type = excluded.employment_type,
		    experience_level = excluded.experience_level,
		    updated_at = CURRENT_TIMESTAMP
	`
	if _, err := tx.NamedExecContext(ctx, query, job); err != nil {
		return fmt.Errorf("failed to upsert job: %w", err)
	}

	// Auto-create company if it doesn't exist
	companyQuery := `
		INSERT OR IGNORE INTO companies (slug, name, description, logo_url)
		VALUES (?, ?, ?, ?)
	`
	description := "Hiring on " + job.Source
	if _, err := tx.ExecContext(ctx, companyQuery, job.CompanySlug, job.Company, description, ""); err != nil {
		return fmt.Errorf("failed to auto-create company: %w", err)
	}

	return tx.Commit()
}

// UpsertJobs batch inserts or updates jobs in a transaction.
func (r *JobRepo) UpsertJobs(ctx context.Context, jobs []domain.Job) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO jobs (id, external_id, title, description, company, company_slug, location,
		                   salary_min, salary_max, salary_currency, posted_at, expires_at,
		                   source, source_url, skills, is_remote, employment_type, experience_level)
		VALUES (:id, :external_id, :title, :description, :company, :company_slug, :location,
		        :salary_min, :salary_max, :salary_currency, :posted_at, :expires_at,
		        :source, :source_url, :skills, :is_remote, :employment_type, :experience_level)
		ON CONFLICT(id) DO UPDATE SET
		    title = excluded.title,
		    description = excluded.description,
		    company = excluded.company,
		    company_slug = excluded.company_slug,
		    location = excluded.location,
		    salary_min = excluded.salary_min,
		    salary_max = excluded.salary_max,
		    salary_currency = excluded.salary_currency,
		    posted_at = excluded.posted_at,
		    expires_at = excluded.expires_at,
		    source = excluded.source,
		    source_url = excluded.source_url,
		    skills = excluded.skills,
		    is_remote = excluded.is_remote,
		    employment_type = excluded.employment_type,
		    experience_level = excluded.experience_level,
		    updated_at = CURRENT_TIMESTAMP
	`

	for i := range jobs {
		if _, err := tx.NamedExecContext(ctx, query, &jobs[i]); err != nil {
			return fmt.Errorf("failed to upsert job %s: %w", jobs[i].ID, err)
		}

		// Auto-create company if it doesn't exist
		companyQuery := `
			INSERT OR IGNORE INTO companies (slug, name, description, logo_url)
			VALUES (?, ?, ?, ?)
		`
		description := "Hiring on " + jobs[i].Source
		if _, err := tx.ExecContext(ctx, companyQuery, jobs[i].CompanySlug, jobs[i].Company, description, ""); err != nil {
			return fmt.Errorf("failed to auto-create company for job %s: %w", jobs[i].ID, err)
		}
	}

	return tx.Commit()
}

// ListCompanies returns companies, optionally filtered by name.
func (r *JobRepo) ListCompanies(ctx context.Context, query string) ([]domain.Company, error) {
	var companies []domain.Company
	if query != "" {
		err := r.db.SelectContext(ctx, &companies,
			"SELECT * FROM companies WHERE LOWER(name) LIKE ? ORDER BY name",
			"%"+strings.ToLower(query)+"%")
		if err != nil {
			return nil, err
		}
	} else {
		err := r.db.SelectContext(ctx, &companies, "SELECT * FROM companies ORDER BY name")
		if err != nil {
			return nil, err
		}
	}
	if companies == nil {
		companies = []domain.Company{}
	}
	return companies, nil
}

// GetCompany returns a company by slug.
func (r *JobRepo) GetCompany(ctx context.Context, slug string) (*domain.Company, error) {
	var company domain.Company
	err := r.db.GetContext(ctx, &company, "SELECT * FROM companies WHERE slug = ?", slug)
	if err != nil {
		return nil, nil
	}
	return &company, nil
}

// UpsertCompany inserts or updates a company.
func (r *JobRepo) UpsertCompany(ctx context.Context, company *domain.Company) error {
	query := `
		INSERT INTO companies (slug, name, industry, description, website, logo_url, job_count)
		VALUES (:slug, :name, :industry, :description, :website, :logo_url, :job_count)
		ON CONFLICT(slug) DO UPDATE SET
		    name = excluded.name,
		    industry = excluded.industry,
		    description = excluded.description,
		    website = excluded.website,
		    logo_url = excluded.logo_url,
		    job_count = excluded.job_count
	`
	_, err := r.db.NamedExecContext(ctx, query, company)
	return err
}

// GetCompanyJobs returns job summaries for a specific company, matching by slug or name.
func (r *JobRepo) GetCompanyJobs(ctx context.Context, slug string, name string) ([]domain.JobSummary, error) {
	var jobs []domain.JobSummary
	err := r.db.SelectContext(ctx, &jobs, `
		SELECT id, title, company, company_slug, location,
		       salary_min, salary_max, salary_currency,
		       posted_at, source, source_url, skills, is_remote, experience_level
		FROM jobs 
		WHERE company_slug = ? OR LOWER(company) = LOWER(?)
		ORDER BY posted_at DESC
	`, slug, name)
	if err != nil {
		return nil, err
	}
	if jobs == nil {
		jobs = []domain.JobSummary{}
	}
	return jobs, nil
}

// GetFilterOptions returns available filter values aggregated from jobs.
func (r *JobRepo) GetFilterOptions(ctx context.Context) (domain.FilterOptions, error) {
	opts := domain.FilterOptions{
		ExperienceLevels: []string{},
	}

	// Distinct locations
	if err := r.db.SelectContext(ctx, &opts.Locations,
		"SELECT DISTINCT location FROM jobs WHERE location != '' ORDER BY location"); err != nil {
		return opts, err
	}

	// Distinct sources
	if err := r.db.SelectContext(ctx, &opts.Sources,
		"SELECT DISTINCT source FROM jobs WHERE source != '' ORDER BY source"); err != nil {
		return opts, err
	}

	// Skills — need to parse JSON arrays from the skills column
	var skillsJSON []string
	if err := r.db.SelectContext(ctx, &skillsJSON,
		"SELECT DISTINCT skills FROM jobs WHERE skills != '[]'"); err != nil {
		return opts, err
	}
	// Deduplicate skills across all jobs
	skillSet := make(map[string]bool)
	for _, raw := range skillsJSON {
		var parsed domain.StringSlice
		if err := parsed.Scan(raw); err == nil {
			for _, s := range parsed {
				skillSet[s] = true
			}
		}
	}
	opts.Skills = make([]string, 0, len(skillSet))
	for s := range skillSet {
		opts.Skills = append(opts.Skills, s)
	}

	if opts.Locations == nil {
		opts.Locations = []string{}
	}
	if opts.Sources == nil {
		opts.Sources = []string{}
	}
	if opts.Skills == nil {
		opts.Skills = []string{}
	}

	return opts, nil
}

// GetTopSkills returns the most common skills across all jobs.
func (r *JobRepo) GetTopSkills(ctx context.Context, limit int) ([]domain.SkillCount, error) {
	// Fetch all skills JSON arrays
	var skillsJSON []string
	if err := r.db.SelectContext(ctx, &skillsJSON,
		"SELECT skills FROM jobs WHERE skills != '[]'"); err != nil {
		return nil, err
	}

	// Count each skill
	counts := make(map[string]int)
	for _, raw := range skillsJSON {
		var parsed domain.StringSlice
		if err := parsed.Scan(raw); err == nil {
			for _, s := range parsed {
				counts[s]++
			}
		}
	}

	// Convert to sorted slice
	skills := make([]domain.SkillCount, 0, len(counts))
	for name, count := range counts {
		skills = append(skills, domain.SkillCount{Name: name, Count: count})
	}

	// Sort by count descending
	for i := 0; i < len(skills); i++ {
		for j := i + 1; j < len(skills); j++ {
			if skills[j].Count > skills[i].Count {
				skills[i], skills[j] = skills[j], skills[i]
			}
		}
	}

	if limit > len(skills) {
		limit = len(skills)
	}
	return skills[:limit], nil
}

// GetAnalyticsSummary computes high-level stats from the jobs table.
func (r *JobRepo) GetAnalyticsSummary(ctx context.Context) (domain.AnalyticsSummary, error) {
	var summary domain.AnalyticsSummary

	// Total jobs and companies
	r.db.GetContext(ctx, &summary.TotalJobs, "SELECT COUNT(*) FROM jobs")
	r.db.GetContext(ctx, &summary.TotalCompanies, "SELECT COUNT(*) FROM companies")

	// Jobs posted today and this week (ensuring UTC comparison)
	r.db.GetContext(ctx, &summary.JobsToday,
		"SELECT COUNT(*) FROM jobs WHERE DATE(posted_at) = DATE('now', 'utc')")
	r.db.GetContext(ctx, &summary.JobsThisWeek,
		"SELECT COUNT(*) FROM jobs WHERE posted_at >= DATE('now', '-7 days', 'utc')")

	// Remote jobs
	r.db.GetContext(ctx, &summary.RemoteJobsCount,
		"SELECT COUNT(*) FROM jobs WHERE is_remote = 1")

	// Average salary (Only calculate from jobs with salary_min > 0 OR salary_max > 0)
	// If the count of such jobs is too low, the frontend will handle the "Limited data" message,
	// but the backend should provide the most accurate average possible.
	r.db.GetContext(ctx, &summary.AverageSalary,
		`SELECT COALESCE(AVG(
			CASE 
				WHEN salary_max > 0 THEN salary_max
				WHEN salary_min > 0 THEN salary_min
				ELSE NULL 
			END
		), 0)
		FROM jobs 
		WHERE salary_max > 0 OR salary_min > 0`)

	return summary, nil
}

// GetJobCountBySource returns the total number of jobs currently in the database for a given source.
func (r *JobRepo) GetJobCountBySource(ctx context.Context, source string) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM jobs WHERE source = ?", source)
	return count, err
}
