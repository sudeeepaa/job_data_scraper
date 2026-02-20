package repository

import (
	"context"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// SeedDatabase populates the database with mock data if it's empty.
// This preserves the original 10 jobs and 9 companies from the in-memory repo.
func SeedDatabase(ctx context.Context, db *sqlx.DB) error {
	// Check if already seeded
	var count int
	if err := db.GetContext(ctx, &count, "SELECT COUNT(*) FROM jobs"); err != nil {
		return err
	}
	if count > 0 {
		log.Printf("📋 Database already has %d jobs, skipping seed", count)
		return nil
	}

	log.Println("🌱 Seeding database with initial data...")

	now := time.Now()

	// Seed companies first (foreign key not enforced on slug, but logical order)
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

	for _, c := range companies {
		_, err := db.NamedExecContext(ctx, `
			INSERT INTO companies (slug, name, industry, description, website, logo_url, job_count)
			VALUES (:slug, :name, :industry, :description, :website, :logo_url, :job_count)
		`, &c)
		if err != nil {
			return err
		}
	}

	// Helper to create int pointers
	intPtr := func(v int) *int { return &v }

	// Seed jobs
	jobs := []domain.Job{
		{
			ID: "1", Title: "Senior Go Backend Engineer",
			Description: "We're looking for an experienced Go developer to build scalable microservices. You'll work on high-traffic APIs serving millions of requests daily. Requirements include 5+ years of Go experience, familiarity with PostgreSQL, Redis, and Kubernetes.",
			Company:     "TechCorp", CompanySlug: "techcorp", Location: "San Francisco, CA",
			SalaryMin: intPtr(150000), SalaryMax: intPtr(200000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -2), Source: "linkedin",
			SourceURL: "https://linkedin.com/jobs/1",
			Skills:    domain.StringSlice{"Go", "PostgreSQL", "Redis", "Kubernetes", "gRPC"},
			IsRemote:  true, EmploymentType: "full-time", ExperienceLevel: "senior",
		},
		{
			ID: "2", Title: "Full Stack Developer",
			Description: "Join our team to build modern web applications using React and Node.js. You'll be responsible for both frontend and backend development, working closely with designers and product managers.",
			Company:     "StartupXYZ", CompanySlug: "startupxyz", Location: "New York, NY",
			SalaryMin: intPtr(120000), SalaryMax: intPtr(160000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -1), Source: "indeed",
			SourceURL: "https://indeed.com/jobs/2",
			Skills:    domain.StringSlice{"React", "Node.js", "TypeScript", "PostgreSQL", "AWS"},
			IsRemote:  false, EmploymentType: "full-time", ExperienceLevel: "mid",
		},
		{
			ID: "3", Title: "DevOps Engineer",
			Description: "We need a DevOps expert to manage our cloud infrastructure on AWS. You'll implement CI/CD pipelines, manage Kubernetes clusters, and ensure 99.99% uptime for our services.",
			Company:     "CloudSys", CompanySlug: "cloudsys", Location: "Austin, TX",
			SalaryMin: intPtr(140000), SalaryMax: intPtr(180000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -3), Source: "linkedin",
			SourceURL: "https://linkedin.com/jobs/3",
			Skills:    domain.StringSlice{"AWS", "Kubernetes", "Terraform", "Docker", "Python"},
			IsRemote:  true, EmploymentType: "full-time", ExperienceLevel: "senior",
		},
		{
			ID: "4", Title: "Junior Frontend Developer",
			Description: "Great opportunity for a developer starting their career. You'll learn from senior engineers while contributing to real projects using Vue.js and modern CSS frameworks.",
			Company:     "WebDev Inc", CompanySlug: "webdev-inc", Location: "Boston, MA",
			SalaryMin: intPtr(70000), SalaryMax: intPtr(90000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -5), Source: "indeed",
			SourceURL: "https://indeed.com/jobs/4",
			Skills:    domain.StringSlice{"Vue.js", "JavaScript", "CSS", "HTML", "Git"},
			IsRemote:  false, EmploymentType: "full-time", ExperienceLevel: "entry",
		},
		{
			ID: "5", Title: "Data Engineer",
			Description: "Build and maintain data pipelines processing terabytes of data daily. Experience with Spark, Airflow, and data warehousing solutions required.",
			Company:     "DataFlow", CompanySlug: "dataflow", Location: "Seattle, WA",
			SalaryMin: intPtr(130000), SalaryMax: intPtr(170000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -1), Source: "linkedin",
			SourceURL: "https://linkedin.com/jobs/5",
			Skills:    domain.StringSlice{"Python", "Spark", "Airflow", "SQL", "AWS"},
			IsRemote:  true, EmploymentType: "full-time", ExperienceLevel: "mid",
		},
		{
			ID: "6", Title: "Backend Developer (Python)",
			Description: "Work on financial technology solutions using Python and Django. Strong understanding of API design and security best practices required.",
			Company:     "FinTech Pro", CompanySlug: "fintech-pro", Location: "Chicago, IL",
			SalaryMin: intPtr(125000), SalaryMax: intPtr(155000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -4), Source: "indeed",
			SourceURL: "https://indeed.com/jobs/6",
			Skills:    domain.StringSlice{"Python", "Django", "PostgreSQL", "Redis", "Docker"},
			IsRemote:  false, EmploymentType: "full-time", ExperienceLevel: "mid",
		},
		{
			ID: "7", Title: "Lead Software Architect",
			Description: "Lead the technical vision for our platform. You'll design systems, mentor engineers, and drive architectural decisions across multiple teams.",
			Company:     "MegaTech", CompanySlug: "megatech", Location: "Remote",
			SalaryMin: intPtr(180000), SalaryMax: intPtr(250000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -1), Source: "linkedin",
			SourceURL: "https://linkedin.com/jobs/7",
			Skills:    domain.StringSlice{"System Design", "Go", "Java", "Microservices", "Leadership"},
			IsRemote:  true, EmploymentType: "full-time", ExperienceLevel: "lead",
		},
		{
			ID: "8", Title: "Mobile Developer (iOS)",
			Description: "Build beautiful iOS applications using Swift and SwiftUI. Join a small team with big impact, shipping features to millions of users.",
			Company:     "AppWorks", CompanySlug: "appworks", Location: "Los Angeles, CA",
			SalaryMin: intPtr(135000), SalaryMax: intPtr(175000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -2), Source: "linkedin",
			SourceURL: "https://linkedin.com/jobs/8",
			Skills:    domain.StringSlice{"Swift", "SwiftUI", "iOS", "Xcode", "Core Data"},
			IsRemote:  false, EmploymentType: "full-time", ExperienceLevel: "mid",
		},
		{
			ID: "9", Title: "Machine Learning Engineer",
			Description: "Develop ML models for our recommendation engine. Experience with PyTorch, TensorFlow, and deploying models at scale required.",
			Company:     "AI Labs", CompanySlug: "ai-labs", Location: "San Francisco, CA",
			SalaryMin: intPtr(160000), SalaryMax: intPtr(220000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -3), Source: "indeed",
			SourceURL: "https://indeed.com/jobs/9",
			Skills:    domain.StringSlice{"Python", "PyTorch", "TensorFlow", "MLOps", "AWS"},
			IsRemote:  true, EmploymentType: "full-time", ExperienceLevel: "senior",
		},
		{
			ID: "10", Title: "Site Reliability Engineer",
			Description: "Ensure our systems are reliable, scalable, and efficient. You'll work on monitoring, incident response, and infrastructure automation.",
			Company:     "CloudSys", CompanySlug: "cloudsys", Location: "Denver, CO",
			SalaryMin: intPtr(145000), SalaryMax: intPtr(185000), SalaryCurrency: "USD",
			PostedAt: now.AddDate(0, 0, -1), Source: "linkedin",
			SourceURL: "https://linkedin.com/jobs/10",
			Skills:    domain.StringSlice{"Kubernetes", "Prometheus", "Go", "Python", "Terraform"},
			IsRemote:  true, EmploymentType: "full-time", ExperienceLevel: "senior",
		},
	}

	for _, j := range jobs {
		_, err := db.NamedExecContext(ctx, `
			INSERT INTO jobs (id, external_id, title, description, company, company_slug, location,
			                   salary_min, salary_max, salary_currency, posted_at,
			                   source, source_url, skills, is_remote, employment_type, experience_level)
			VALUES (:id, :external_id, :title, :description, :company, :company_slug, :location,
			        :salary_min, :salary_max, :salary_currency, :posted_at,
			        :source, :source_url, :skills, :is_remote, :employment_type, :experience_level)
		`, &j)
		if err != nil {
			return err
		}
	}

	log.Printf("🌱 Seeded %d jobs and %d companies", len(jobs), len(companies))
	return nil
}
