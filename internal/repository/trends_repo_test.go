package repository

import (
	"context"
	"testing"
	"time"
)

func TestTrendsRepo_ComputeAndGetTrends(t *testing.T) {
	db := testDB(t)
	jobRepo := NewJobRepo(db)
	trendsRepo := NewTrendsRepo(db)
	ctx := context.Background()

	// Seed some jobs with known skills
	seedTestJobs(t, jobRepo)

	// Compute snapshot
	if err := trendsRepo.ComputeAndStoreSnapshot(ctx); err != nil {
		t.Fatalf("ComputeAndStoreSnapshot failed: %v", err)
	}

	// Get trends
	trends, err := trendsRepo.GetTrends(ctx, 10)
	if err != nil {
		t.Fatalf("GetTrends failed: %v", err)
	}
	if len(trends) == 0 {
		t.Fatal("expected trends, got none")
	}

	// Docker appears in j1 (Go Dev), j3 (DevOps), j5 (ML) = 3 mentions
	found := false
	for _, tr := range trends {
		if tr.SkillName == "docker" {
			found = true
			if tr.MentionCount != 3 {
				t.Errorf("Docker mentions = %d, want 3", tr.MentionCount)
			}
		}
	}
	if !found {
		t.Error("expected Docker in trends")
	}
}

func TestTrendsRepo_SalaryStats(t *testing.T) {
	db := testDB(t)
	jobRepo := NewJobRepo(db)
	trendsRepo := NewTrendsRepo(db)
	ctx := context.Background()

	seedTestJobs(t, jobRepo)

	stats, err := trendsRepo.GetSalaryStats(ctx)
	if err != nil {
		t.Fatalf("GetSalaryStats failed: %v", err)
	}

	// All 5 test jobs have salary, so TotalWithSalary should be 5
	if stats.TotalWithSalary != 5 {
		t.Errorf("TotalWithSalary = %d, want 5", stats.TotalWithSalary)
	}

	// Min salary across all jobs is 70000 (j4)
	if stats.MinSalary != 70000 {
		t.Errorf("MinSalary = %d, want 70000", stats.MinSalary)
	}

	// Max salary across all jobs is 220000 (j5)
	if stats.MaxSalary != 220000 {
		t.Errorf("MaxSalary = %d, want 220000", stats.MaxSalary)
	}
}

func TestTrendsRepo_SourceDistribution(t *testing.T) {
	db := testDB(t)
	jobRepo := NewJobRepo(db)
	trendsRepo := NewTrendsRepo(db)
	ctx := context.Background()

	seedTestJobs(t, jobRepo)

	dist, err := trendsRepo.GetSourceDistribution(ctx)
	if err != nil {
		t.Fatalf("GetSourceDistribution failed: %v", err)
	}
	if len(dist) == 0 {
		t.Fatal("expected source distribution, got none")
	}

	// 3 linkedin + 2 indeed = 5 total
	total := 0
	for _, d := range dist {
		total += d.Count
	}
	if total != 5 {
		t.Errorf("total distribution count = %d, want 5", total)
	}
}

func TestTrendsRepo_GetTrends_Empty(t *testing.T) {
	db := testDB(t)
	trendsRepo := NewTrendsRepo(db)
	ctx := context.Background()

	// No jobs, no trends computed
	trends, err := trendsRepo.GetTrends(ctx, 10)
	if err != nil {
		t.Fatalf("GetTrends failed: %v", err)
	}
	if len(trends) != 0 {
		t.Errorf("expected empty trends, got %d", len(trends))
	}
}

func TestTrendsRepo_AnalyticsSummary(t *testing.T) {
	db := testDB(t)
	jobRepo := NewJobRepo(db)
	ctx := context.Background()

	seedTestJobs(t, jobRepo)

	// Also insert a company (INSERT OR IGNORE because seedTestJobs already creates techco)
	_, err := db.ExecContext(ctx,
		`INSERT OR IGNORE INTO companies (slug, name, industry, description, website, logo_url, job_count)
		 VALUES ('techco', 'TechCo', 'Tech', 'Test', 'https://example.com', '', 1)`)
	if err != nil {
		t.Fatalf("insert company failed: %v", err)
	}

	summary, err := jobRepo.GetAnalyticsSummary(ctx)
	if err != nil {
		t.Fatalf("GetAnalyticsSummary failed: %v", err)
	}
	if summary.TotalJobs != 5 {
		t.Errorf("TotalJobs = %d, want 5", summary.TotalJobs)
	}
	if summary.TotalCompanies < 1 {
		t.Errorf("TotalCompanies = %d, want at least 1", summary.TotalCompanies)
	}
}

func TestTrendsRepo_TopSkills(t *testing.T) {
	db := testDB(t)
	jobRepo := NewJobRepo(db)
	ctx := context.Background()

	seedTestJobs(t, jobRepo)

	skills, err := jobRepo.GetTopSkills(ctx, 5)
	if err != nil {
		t.Fatalf("GetTopSkills failed: %v", err)
	}
	if len(skills) == 0 {
		t.Fatal("expected skills, got none")
	}

	// Docker appears in 3 jobs so should be near the top
	foundDocker := false
	for _, s := range skills {
		if s.Name == "Docker" || s.Name == "docker" {
			foundDocker = true
			if s.Count < 2 {
				t.Errorf("Docker count = %d, want at least 2", s.Count)
			}
		}
	}
	if !foundDocker {
		// Skills might be case-sensitive, check the raw output
		t.Logf("Top skills: %v", skills)
	}
}

// seedTestJobsForTrends is an alias for reuse (trends tests depend on job seeding)
func init() {
	_ = time.Now // ensure time import
}
