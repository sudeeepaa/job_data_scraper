package repository

import (
	"context"
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/samuelshine/job-data-scraper/internal/database"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// testDB creates an in-memory SQLite database with migrations applied.
func testDB(t *testing.T) *sqlx.DB {
	t.Helper()
	db, err := database.NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("failed to create test database: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

// seedTestJobs inserts a set of test jobs for consistent test fixtures.
func seedTestJobs(t *testing.T, repo *JobRepo) {
	t.Helper()
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
		{
			ID: "j4", Title: "Junior Python Developer", Description: "Learn and grow with Python and Django",
			Company: "EduCo", CompanySlug: "educo", Location: "Boston, MA",
			SalaryMin: intPtr(70000), SalaryMax: intPtr(90000), SalaryCurrency: "USD",
			PostedAt: now.Add(-96 * time.Hour), Source: "indeed", SourceURL: "https://indeed.com/j4",
			Skills:   domain.StringSlice{"Python", "Django", "SQL"},
			IsRemote: false, EmploymentType: "full-time", ExperienceLevel: "entry",
		},
		{
			ID: "j5", Title: "ML Engineer", Description: "Build ML pipelines with Python",
			Company: "AIco", CompanySlug: "aico", Location: "San Francisco, CA",
			SalaryMin: intPtr(160000), SalaryMax: intPtr(220000), SalaryCurrency: "USD",
			PostedAt: now, Source: "linkedin", SourceURL: "https://linkedin.com/j5",
			Skills:   domain.StringSlice{"Python", "PyTorch", "Docker"},
			IsRemote: true, EmploymentType: "full-time", ExperienceLevel: "senior",
		},
	}

	for i := range jobs {
		if err := repo.UpsertJob(ctx, &jobs[i]); err != nil {
			t.Fatalf("failed to seed job %s: %v", jobs[i].ID, err)
		}
	}
}

func boolPtr(v bool) *bool { return &v }

func TestJobRepo_UpsertAndGetByID(t *testing.T) {
	db := testDB(t)
	repo := NewJobRepo(db)
	ctx := context.Background()
	intPtr := func(v int) *int { return &v }

	job := &domain.Job{
		ID: "test-1", Title: "Test Engineer", Description: "Testing things",
		Company: "TestCo", CompanySlug: "testco", Location: "Remote",
		SalaryMin: intPtr(100000), SalaryMax: intPtr(150000), SalaryCurrency: "USD",
		PostedAt: time.Now(), Source: "linkedin", SourceURL: "https://linkedin.com/test-1",
		Skills: domain.StringSlice{"Go", "Testing"}, IsRemote: true,
		EmploymentType: "full-time", ExperienceLevel: "mid",
	}

	if err := repo.UpsertJob(ctx, job); err != nil {
		t.Fatalf("UpsertJob failed: %v", err)
	}

	got, err := repo.GetJob(ctx, "test-1")
	if err != nil {
		t.Fatalf("GetJob failed: %v", err)
	}
	if got == nil {
		t.Fatal("GetJob returned nil")
	}
	if got.Title != "Test Engineer" {
		t.Errorf("Title = %q, want %q", got.Title, "Test Engineer")
	}
	if got.Company != "TestCo" {
		t.Errorf("Company = %q, want %q", got.Company, "TestCo")
	}
	if !got.IsRemote {
		t.Error("IsRemote = false, want true")
	}
	if len(got.Skills) != 2 {
		t.Errorf("Skills length = %d, want 2", len(got.Skills))
	}
}

func TestJobRepo_Search_Filters(t *testing.T) {
	db := testDB(t)
	repo := NewJobRepo(db)
	seedTestJobs(t, repo)
	ctx := context.Background()

	tests := []struct {
		name    string
		params  domain.JobQueryParams
		wantMin int
		wantMax int
	}{
		{
			name:    "filter by location",
			params:  domain.JobQueryParams{Location: "San Francisco"},
			wantMin: 2, wantMax: 2,
		},
		{
			name:    "filter by source linkedin",
			params:  domain.JobQueryParams{Source: "linkedin"},
			wantMin: 3, wantMax: 3,
		},
		{
			name:    "filter by experience senior",
			params:  domain.JobQueryParams{ExperienceLevel: "senior"},
			wantMin: 3, wantMax: 3,
		},
		{
			name:    "filter by remote",
			params:  domain.JobQueryParams{IsRemote: boolPtr(true)},
			wantMin: 3, wantMax: 3,
		},
		{
			name:    "filter by employment type contract",
			params:  domain.JobQueryParams{EmploymentType: "contract"},
			wantMin: 1, wantMax: 1,
		},
		{
			name:    "text search Python",
			params:  domain.JobQueryParams{Query: "Python"},
			wantMin: 2, wantMax: 2,
		},
	}

	pag := domain.NewPagination(1, 20)
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, total, err := repo.ListJobs(ctx, tt.params, pag)
			if err != nil {
				t.Fatalf("ListJobs failed: %v", err)
			}
			if total < tt.wantMin || total > tt.wantMax {
				t.Errorf("total = %d, want between %d and %d", total, tt.wantMin, tt.wantMax)
			}
		})
	}
}

func TestJobRepo_Search_Pagination(t *testing.T) {
	db := testDB(t)
	repo := NewJobRepo(db)
	seedTestJobs(t, repo)
	ctx := context.Background()

	// Page 1 with limit 2
	jobs, total, err := repo.ListJobs(ctx, domain.JobQueryParams{}, domain.NewPagination(1, 2))
	if err != nil {
		t.Fatalf("ListJobs page 1 failed: %v", err)
	}
	if total != 5 {
		t.Errorf("total = %d, want 5", total)
	}
	if len(jobs) != 2 {
		t.Errorf("page 1 len = %d, want 2", len(jobs))
	}

	// Page 3 should have 1 remaining
	jobs3, _, err := repo.ListJobs(ctx, domain.JobQueryParams{}, domain.NewPagination(3, 2))
	if err != nil {
		t.Fatalf("ListJobs page 3 failed: %v", err)
	}
	if len(jobs3) != 1 {
		t.Errorf("page 3 len = %d, want 1", len(jobs3))
	}
}

func TestJobRepo_Search_Sorting(t *testing.T) {
	db := testDB(t)
	repo := NewJobRepo(db)
	seedTestJobs(t, repo)
	ctx := context.Background()
	pag := domain.NewPagination(1, 10)

	// Salary desc
	jobs, _, err := repo.ListJobs(ctx, domain.JobQueryParams{Sort: "salary_desc"}, pag)
	if err != nil {
		t.Fatalf("salary_desc failed: %v", err)
	}
	if len(jobs) >= 2 && jobs[0].SalaryMax != nil && jobs[1].SalaryMax != nil {
		if *jobs[0].SalaryMax < *jobs[1].SalaryMax {
			t.Errorf("salary_desc: first %d < second %d", *jobs[0].SalaryMax, *jobs[1].SalaryMax)
		}
	}

	// Date desc
	jobs2, _, err := repo.ListJobs(ctx, domain.JobQueryParams{Sort: "date_desc"}, pag)
	if err != nil {
		t.Fatalf("date_desc failed: %v", err)
	}
	if len(jobs2) >= 2 && jobs2[0].PostedAt.Before(jobs2[1].PostedAt) {
		t.Error("date_desc: first job is older than second")
	}
}

func TestJobRepo_GetFilterOptions(t *testing.T) {
	db := testDB(t)
	repo := NewJobRepo(db)
	seedTestJobs(t, repo)
	ctx := context.Background()

	opts, err := repo.GetFilterOptions(ctx)
	if err != nil {
		t.Fatalf("GetFilterOptions failed: %v", err)
	}
	if len(opts.Locations) == 0 {
		t.Error("expected locations")
	}
	if len(opts.ExperienceLevels) == 0 {
		t.Error("expected experience levels")
	}
	if len(opts.Sources) == 0 {
		t.Error("expected sources")
	}
}
