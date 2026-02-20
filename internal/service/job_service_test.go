package service

import (
	"context"
	"testing"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/database"
	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/repository"
)

func setupJobService(t *testing.T) *JobService {
	t.Helper()
	db, err := database.NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("failed to create test database: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	jobRepo := repository.NewJobRepo(db)
	userRepo := repository.NewUserRepo(db)
	cacheRepo := repository.NewCacheRepo(db)
	trendsRepo := repository.NewTrendsRepo(db)

	svc := NewJobService(jobRepo, userRepo, cacheRepo, trendsRepo, nil)

	// Seed test data
	ctx := context.Background()
	now := time.Now()
	intPtr := func(v int) *int { return &v }

	jobs := []domain.Job{
		{
			ID: "j1", Title: "Go Developer", Description: "Build Go services",
			Company: "TechCo", CompanySlug: "techco", Location: "San Francisco, CA",
			SalaryMin: intPtr(150000), SalaryMax: intPtr(200000), SalaryCurrency: "USD",
			PostedAt: now.Add(-24 * time.Hour), Source: "linkedin", SourceURL: "https://linkedin.com/j1",
			Skills:   domain.StringSlice{"Go", "PostgreSQL", "Docker"},
			IsRemote: true, EmploymentType: "full-time", ExperienceLevel: "senior",
		},
		{
			ID: "j2", Title: "React Developer", Description: "Frontend work",
			Company: "WebCo", CompanySlug: "webco", Location: "New York, NY",
			SalaryMin: intPtr(100000), SalaryMax: intPtr(140000), SalaryCurrency: "USD",
			PostedAt: now.Add(-48 * time.Hour), Source: "indeed", SourceURL: "https://indeed.com/j2",
			Skills:   domain.StringSlice{"React", "TypeScript", "CSS"},
			IsRemote: false, EmploymentType: "full-time", ExperienceLevel: "mid",
		},
		{
			ID: "j3", Title: "DevOps Engineer", Description: "Infrastructure automation",
			Company: "CloudCo", CompanySlug: "cloudco", Location: "Austin, TX",
			SalaryMin: intPtr(130000), SalaryMax: intPtr(170000), SalaryCurrency: "USD",
			PostedAt: now.Add(-72 * time.Hour), Source: "linkedin", SourceURL: "https://linkedin.com/j3",
			Skills:   domain.StringSlice{"AWS", "Kubernetes", "Terraform", "Docker"},
			IsRemote: true, EmploymentType: "contract", ExperienceLevel: "senior",
		},
	}

	for i := range jobs {
		if err := jobRepo.UpsertJob(ctx, &jobs[i]); err != nil {
			t.Fatalf("seed job %s: %v", jobs[i].ID, err)
		}
	}

	// Seed a company
	jobRepo.UpsertCompany(ctx, &domain.Company{
		Slug: "techco", Name: "TechCo", Industry: "Tech",
		Description: "Test company", Website: "https://techco.com", JobCount: 1,
	})

	return svc
}

func TestJobService_ListJobs(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	jobs, total, err := svc.ListJobs(ctx, domain.JobQueryParams{}, domain.NewPagination(1, 10))
	if err != nil {
		t.Fatalf("ListJobs failed: %v", err)
	}
	if total != 3 {
		t.Errorf("total = %d, want 3", total)
	}
	if len(jobs) != 3 {
		t.Errorf("jobs len = %d, want 3", len(jobs))
	}
}

func TestJobService_GetJob(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	job, err := svc.GetJob(ctx, "j1")
	if err != nil {
		t.Fatalf("GetJob failed: %v", err)
	}
	if job == nil {
		t.Fatal("GetJob returned nil")
	}
	if job.Title != "Go Developer" {
		t.Errorf("Title = %q, want %q", job.Title, "Go Developer")
	}
}

func TestJobService_GetJob_NotFound(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	job, err := svc.GetJob(ctx, "nonexistent")
	if err != nil {
		t.Fatalf("GetJob failed: %v", err)
	}
	if job != nil {
		t.Error("expected nil for nonexistent job")
	}
}

func TestJobService_GetFilterOptions(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	opts, err := svc.GetFilterOptions(ctx)
	if err != nil {
		t.Fatalf("GetFilterOptions failed: %v", err)
	}
	if len(opts.Locations) == 0 {
		t.Error("expected locations")
	}
	if len(opts.Sources) == 0 {
		t.Error("expected sources")
	}
}

func TestJobService_ListCompanies(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	companies, err := svc.ListCompanies(ctx, "")
	if err != nil {
		t.Fatalf("ListCompanies failed: %v", err)
	}
	if len(companies) == 0 {
		t.Error("expected companies")
	}
}

func TestJobService_GetCompany(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	co, err := svc.GetCompany(ctx, "techco")
	if err != nil {
		t.Fatalf("GetCompany failed: %v", err)
	}
	if co == nil {
		t.Fatal("GetCompany returned nil")
	}
	if co.Name != "TechCo" {
		t.Errorf("Name = %q, want %q", co.Name, "TechCo")
	}
}

func TestJobService_HasAggregator(t *testing.T) {
	svc := setupJobService(t)
	if svc.HasAggregator() {
		t.Error("expected HasAggregator = false when aggregator is nil")
	}
}

func TestJobService_RefreshTrends(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	if err := svc.RefreshTrends(ctx); err != nil {
		t.Fatalf("RefreshTrends failed: %v", err)
	}

	trends, err := svc.GetMarketTrends(ctx, 5)
	if err != nil {
		t.Fatalf("GetMarketTrends failed: %v", err)
	}
	if len(trends) == 0 {
		t.Error("expected trends after refresh")
	}
}

func TestJobService_SalaryStats(t *testing.T) {
	svc := setupJobService(t)
	ctx := context.Background()

	stats, err := svc.GetSalaryStats(ctx)
	if err != nil {
		t.Fatalf("GetSalaryStats failed: %v", err)
	}
	if stats.TotalWithSalary != 3 {
		t.Errorf("TotalWithSalary = %d, want 3", stats.TotalWithSalary)
	}
}
