package repository

import (
	"context"
	"strings"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// JobRepository provides access to job data
type JobRepository struct {
	jobs      []domain.Job
	companies []domain.Company
}

// NewJobRepository creates a repository with mock data
func NewJobRepository() *JobRepository {
	now := time.Now()

	jobs := []domain.Job{
		{
			ID:              "1",
			Title:           "Senior Go Backend Engineer",
			Description:     "We're looking for an experienced Go developer to build scalable microservices. You'll work on high-traffic APIs serving millions of requests daily. Requirements include 5+ years of Go experience, familiarity with PostgreSQL, Redis, and Kubernetes.",
			Company:         "TechCorp",
			CompanySlug:     "techcorp",
			Location:        "San Francisco, CA",
			Salary:          &domain.Salary{Min: 150000, Max: 200000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -2),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "linkedin",
			Skills:          []string{"Go", "PostgreSQL", "Redis", "Kubernetes", "gRPC"},
			IsRemote:        true,
			EmploymentType:  "full-time",
			ExperienceLevel: "senior",
			URL:             "https://linkedin.com/jobs/1",
		},
		{
			ID:              "2",
			Title:           "Full Stack Developer",
			Description:     "Join our team to build modern web applications using React and Node.js. You'll be responsible for both frontend and backend development, working closely with designers and product managers.",
			Company:         "StartupXYZ",
			CompanySlug:     "startupxyz",
			Location:        "New York, NY",
			Salary:          &domain.Salary{Min: 120000, Max: 160000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -1),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "indeed",
			Skills:          []string{"React", "Node.js", "TypeScript", "PostgreSQL", "AWS"},
			IsRemote:        false,
			EmploymentType:  "full-time",
			ExperienceLevel: "mid",
			URL:             "https://indeed.com/jobs/2",
		},
		{
			ID:              "3",
			Title:           "DevOps Engineer",
			Description:     "We need a DevOps expert to manage our cloud infrastructure on AWS. You'll implement CI/CD pipelines, manage Kubernetes clusters, and ensure 99.99% uptime for our services.",
			Company:         "CloudSys",
			CompanySlug:     "cloudsys",
			Location:        "Austin, TX",
			Salary:          &domain.Salary{Min: 140000, Max: 180000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -3),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "linkedin",
			Skills:          []string{"AWS", "Kubernetes", "Terraform", "Docker", "Python"},
			IsRemote:        true,
			EmploymentType:  "full-time",
			ExperienceLevel: "senior",
			URL:             "https://linkedin.com/jobs/3",
		},
		{
			ID:              "4",
			Title:           "Junior Frontend Developer",
			Description:     "Great opportunity for a developer starting their career. You'll learn from senior engineers while contributing to real projects using Vue.js and modern CSS frameworks.",
			Company:         "WebDev Inc",
			CompanySlug:     "webdev-inc",
			Location:        "Boston, MA",
			Salary:          &domain.Salary{Min: 70000, Max: 90000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -5),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "indeed",
			Skills:          []string{"Vue.js", "JavaScript", "CSS", "HTML", "Git"},
			IsRemote:        false,
			EmploymentType:  "full-time",
			ExperienceLevel: "entry",
			URL:             "https://indeed.com/jobs/4",
		},
		{
			ID:              "5",
			Title:           "Data Engineer",
			Description:     "Build and maintain data pipelines processing terabytes of data daily. Experience with Spark, Airflow, and data warehousing solutions required.",
			Company:         "DataFlow",
			CompanySlug:     "dataflow",
			Location:        "Seattle, WA",
			Salary:          &domain.Salary{Min: 130000, Max: 170000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -1),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "linkedin",
			Skills:          []string{"Python", "Spark", "Airflow", "SQL", "AWS"},
			IsRemote:        true,
			EmploymentType:  "full-time",
			ExperienceLevel: "mid",
			URL:             "https://linkedin.com/jobs/5",
		},
		{
			ID:              "6",
			Title:           "Backend Developer (Python)",
			Description:     "Work on financial technology solutions using Python and Django. Strong understanding of API design and security best practices required.",
			Company:         "FinTech Pro",
			CompanySlug:     "fintech-pro",
			Location:        "Chicago, IL",
			Salary:          &domain.Salary{Min: 125000, Max: 155000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -4),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "indeed",
			Skills:          []string{"Python", "Django", "PostgreSQL", "Redis", "Docker"},
			IsRemote:        false,
			EmploymentType:  "full-time",
			ExperienceLevel: "mid",
			URL:             "https://indeed.com/jobs/6",
		},
		{
			ID:              "7",
			Title:           "Lead Software Architect",
			Description:     "Lead the technical vision for our platform. You'll design systems, mentor engineers, and drive architectural decisions across multiple teams.",
			Company:         "MegaTech",
			CompanySlug:     "megatech",
			Location:        "Remote",
			Salary:          &domain.Salary{Min: 180000, Max: 250000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -1),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "linkedin",
			Skills:          []string{"System Design", "Go", "Java", "Microservices", "Leadership"},
			IsRemote:        true,
			EmploymentType:  "full-time",
			ExperienceLevel: "lead",
			URL:             "https://linkedin.com/jobs/7",
		},
		{
			ID:              "8",
			Title:           "Mobile Developer (iOS)",
			Description:     "Build beautiful iOS applications using Swift and SwiftUI. Join a small team with big impact, shipping features to millions of users.",
			Company:         "AppWorks",
			CompanySlug:     "appworks",
			Location:        "Los Angeles, CA",
			Salary:          &domain.Salary{Min: 135000, Max: 175000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -2),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "linkedin",
			Skills:          []string{"Swift", "SwiftUI", "iOS", "Xcode", "Core Data"},
			IsRemote:        false,
			EmploymentType:  "full-time",
			ExperienceLevel: "mid",
			URL:             "https://linkedin.com/jobs/8",
		},
		{
			ID:              "9",
			Title:           "Machine Learning Engineer",
			Description:     "Develop ML models for our recommendation engine. Experience with PyTorch, TensorFlow, and deploying models at scale required.",
			Company:         "AI Labs",
			CompanySlug:     "ai-labs",
			Location:        "San Francisco, CA",
			Salary:          &domain.Salary{Min: 160000, Max: 220000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -3),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "indeed",
			Skills:          []string{"Python", "PyTorch", "TensorFlow", "MLOps", "AWS"},
			IsRemote:        true,
			EmploymentType:  "full-time",
			ExperienceLevel: "senior",
			URL:             "https://indeed.com/jobs/9",
		},
		{
			ID:              "10",
			Title:           "Site Reliability Engineer",
			Description:     "Ensure our systems are reliable, scalable, and efficient. You'll work on monitoring, incident response, and infrastructure automation.",
			Company:         "CloudSys",
			CompanySlug:     "cloudsys",
			Location:        "Denver, CO",
			Salary:          &domain.Salary{Min: 145000, Max: 185000, Currency: "USD"},
			PostedAt:        now.AddDate(0, 0, -1),
			ExpiresAt:       now.AddDate(0, 1, 0),
			Source:          "linkedin",
			Skills:          []string{"Kubernetes", "Prometheus", "Go", "Python", "Terraform"},
			IsRemote:        true,
			EmploymentType:  "full-time",
			ExperienceLevel: "senior",
			URL:             "https://linkedin.com/jobs/10",
		},
	}

	companies := []domain.Company{
		{Slug: "techcorp", Name: "TechCorp", Industry: "Technology", Description: "Leading enterprise software company", Website: "https://techcorp.example.com", JobCount: 1},
		{Slug: "startupxyz", Name: "StartupXYZ", Industry: "Technology", Description: "Fast-growing startup disrupting the market", Website: "https://startupxyz.example.com", JobCount: 1},
		{Slug: "cloudsys", Name: "CloudSys", Industry: "Cloud Computing", Description: "Cloud infrastructure solutions provider", Website: "https://cloudsys.example.com", JobCount: 2},
		{Slug: "webdev-inc", Name: "WebDev Inc", Industry: "Web Development", Description: "Web development agency", Website: "https://webdev-inc.example.com", JobCount: 1},
		{Slug: "dataflow", Name: "DataFlow", Industry: "Data Analytics", Description: "Big data and analytics company", Website: "https://dataflow.example.com", JobCount: 1},
		{Slug: "fintech-pro", Name: "FinTech Pro", Industry: "Financial Services", Description: "Financial technology solutions", Website: "https://fintech-pro.example.com", JobCount: 1},
		{Slug: "megatech", Name: "MegaTech", Industry: "Technology", Description: "Global technology corporation", Website: "https://megatech.example.com", JobCount: 1},
		{Slug: "appworks", Name: "AppWorks", Industry: "Mobile Development", Description: "Mobile app development studio", Website: "https://appworks.example.com", JobCount: 1},
		{Slug: "ai-labs", Name: "AI Labs", Industry: "Artificial Intelligence", Description: "AI research and applications", Website: "https://ai-labs.example.com", JobCount: 1},
	}

	return &JobRepository{
		jobs:      jobs,
		companies: companies,
	}
}

// ListJobs returns filtered and paginated jobs
func (r *JobRepository) ListJobs(ctx context.Context, params domain.JobQueryParams, pag domain.Pagination) ([]domain.JobSummary, int, error) {
	filtered := r.filterJobs(params)

	total := len(filtered)

	// Apply pagination
	start := pag.Offset()
	end := start + pag.Limit
	if start > total {
		return []domain.JobSummary{}, total, nil
	}
	if end > total {
		end = total
	}

	// Convert to summaries
	summaries := make([]domain.JobSummary, 0, end-start)
	for _, job := range filtered[start:end] {
		summaries = append(summaries, domain.JobSummary{
			ID:              job.ID,
			Title:           job.Title,
			Company:         job.Company,
			CompanySlug:     job.CompanySlug,
			Location:        job.Location,
			Salary:          job.Salary,
			PostedAt:        job.PostedAt,
			Source:          job.Source,
			Skills:          job.Skills,
			IsRemote:        job.IsRemote,
			ExperienceLevel: job.ExperienceLevel,
		})
	}

	return summaries, total, nil
}

// GetJob returns a single job by ID
func (r *JobRepository) GetJob(ctx context.Context, id string) (*domain.Job, error) {
	for _, job := range r.jobs {
		if job.ID == id {
			return &job, nil
		}
	}
	return nil, nil
}

// ListCompanies returns all companies
func (r *JobRepository) ListCompanies(ctx context.Context, query string) ([]domain.Company, error) {
	if query == "" {
		return r.companies, nil
	}

	q := strings.ToLower(query)
	var results []domain.Company
	for _, c := range r.companies {
		if strings.Contains(strings.ToLower(c.Name), q) {
			results = append(results, c)
		}
	}
	return results, nil
}

// GetCompany returns a company by slug
func (r *JobRepository) GetCompany(ctx context.Context, slug string) (*domain.Company, error) {
	for _, c := range r.companies {
		if c.Slug == slug {
			return &c, nil
		}
	}
	return nil, nil
}

// GetCompanyJobs returns jobs for a specific company
func (r *JobRepository) GetCompanyJobs(ctx context.Context, slug string) ([]domain.JobSummary, error) {
	var jobs []domain.JobSummary
	for _, job := range r.jobs {
		if job.CompanySlug == slug {
			jobs = append(jobs, domain.JobSummary{
				ID:              job.ID,
				Title:           job.Title,
				Company:         job.Company,
				CompanySlug:     job.CompanySlug,
				Location:        job.Location,
				Salary:          job.Salary,
				PostedAt:        job.PostedAt,
				Source:          job.Source,
				Skills:          job.Skills,
				IsRemote:        job.IsRemote,
				ExperienceLevel: job.ExperienceLevel,
			})
		}
	}
	return jobs, nil
}

// GetFilterOptions returns available filter values
func (r *JobRepository) GetFilterOptions(ctx context.Context) domain.FilterOptions {
	locationSet := make(map[string]bool)
	skillSet := make(map[string]bool)

	for _, job := range r.jobs {
		locationSet[job.Location] = true
		for _, skill := range job.Skills {
			skillSet[skill] = true
		}
	}

	locations := make([]string, 0, len(locationSet))
	for loc := range locationSet {
		locations = append(locations, loc)
	}

	skills := make([]string, 0, len(skillSet))
	for skill := range skillSet {
		skills = append(skills, skill)
	}

	return domain.FilterOptions{
		Locations:        locations,
		ExperienceLevels: []string{"entry", "mid", "senior", "lead"},
		Sources:          []string{"linkedin", "indeed"},
		Skills:           skills,
	}
}

// GetTopSkills returns skill frequency counts
func (r *JobRepository) GetTopSkills(ctx context.Context, limit int) []domain.SkillCount {
	skillCounts := make(map[string]int)
	for _, job := range r.jobs {
		for _, skill := range job.Skills {
			skillCounts[skill]++
		}
	}

	// Convert to slice and sort by count
	skills := make([]domain.SkillCount, 0, len(skillCounts))
	for name, count := range skillCounts {
		skills = append(skills, domain.SkillCount{Name: name, Count: count})
	}

	// Simple bubble sort for small dataset
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
	return skills[:limit]
}

// GetAnalyticsSummary returns high-level stats
func (r *JobRepository) GetAnalyticsSummary(ctx context.Context) domain.AnalyticsSummary {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	weekAgo := today.AddDate(0, 0, -7)

	var jobsToday, jobsThisWeek, remoteCount, salarySum, salaryCount int

	for _, job := range r.jobs {
		if job.PostedAt.After(today) {
			jobsToday++
		}
		if job.PostedAt.After(weekAgo) {
			jobsThisWeek++
		}
		if job.IsRemote {
			remoteCount++
		}
		if job.Salary != nil {
			salarySum += (job.Salary.Min + job.Salary.Max) / 2
			salaryCount++
		}
	}

	avgSalary := 0
	if salaryCount > 0 {
		avgSalary = salarySum / salaryCount
	}

	return domain.AnalyticsSummary{
		TotalJobs:       len(r.jobs),
		TotalCompanies:  len(r.companies),
		JobsToday:       jobsToday,
		JobsThisWeek:    jobsThisWeek,
		AverageSalary:   avgSalary,
		RemoteJobsCount: remoteCount,
	}
}

// filterJobs applies query parameters to filter jobs
func (r *JobRepository) filterJobs(params domain.JobQueryParams) []domain.Job {
	results := make([]domain.Job, 0)

	for _, job := range r.jobs {
		// Text search
		if params.Query != "" {
			q := strings.ToLower(params.Query)
			if !strings.Contains(strings.ToLower(job.Title), q) &&
				!strings.Contains(strings.ToLower(job.Company), q) &&
				!containsSkill(job.Skills, q) {
				continue
			}
		}

		// Location filter
		if params.Location != "" && !strings.Contains(strings.ToLower(job.Location), strings.ToLower(params.Location)) {
			continue
		}

		// Experience level filter
		if params.ExperienceLevel != "" && job.ExperienceLevel != params.ExperienceLevel {
			continue
		}

		// Source filter
		if params.Source != "" && job.Source != params.Source {
			continue
		}

		// Salary filter
		if params.SalaryMin != nil && job.Salary != nil && job.Salary.Max < *params.SalaryMin {
			continue
		}

		// Remote filter
		if params.IsRemote != nil && job.IsRemote != *params.IsRemote {
			continue
		}

		results = append(results, job)
	}

	return results
}

func containsSkill(skills []string, query string) bool {
	for _, skill := range skills {
		if strings.Contains(strings.ToLower(skill), query) {
			return true
		}
	}
	return false
}
