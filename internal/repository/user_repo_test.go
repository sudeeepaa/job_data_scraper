package repository

import (
	"context"
	"testing"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/domain"
)

func TestUserRepo_CreateAndGetByEmail(t *testing.T) {
	db := testDB(t)
	repo := NewUserRepo(db)
	ctx := context.Background()

	user := &domain.User{
		ID:           "u1",
		Email:        "test@example.com",
		PasswordHash: "$2a$12$fakehashfortest",
		Name:         "Test User",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := repo.CreateUser(ctx, user); err != nil {
		t.Fatalf("CreateUser failed: %v", err)
	}

	got, err := repo.GetUserByEmail(ctx, "test@example.com")
	if err != nil {
		t.Fatalf("GetUserByEmail failed: %v", err)
	}
	if got == nil {
		t.Fatal("GetUserByEmail returned nil")
	}
	if got.Name != "Test User" {
		t.Errorf("Name = %q, want %q", got.Name, "Test User")
	}
	if got.ID != "u1" {
		t.Errorf("ID = %q, want %q", got.ID, "u1")
	}
}

func TestUserRepo_GetByEmail_NotFound(t *testing.T) {
	db := testDB(t)
	repo := NewUserRepo(db)
	ctx := context.Background()

	got, err := repo.GetUserByEmail(ctx, "nonexistent@example.com")
	if err != nil {
		t.Fatalf("GetUserByEmail failed: %v", err)
	}
	if got != nil {
		t.Error("expected nil for nonexistent user")
	}
}

func TestUserRepo_SavedJobs(t *testing.T) {
	db := testDB(t)
	userRepo := NewUserRepo(db)
	jobRepo := NewJobRepo(db)
	ctx := context.Background()

	// Create user
	user := &domain.User{
		ID: "u1", Email: "test@example.com", PasswordHash: "hash",
		Name: "Test", CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}
	if err := userRepo.CreateUser(ctx, user); err != nil {
		t.Fatalf("CreateUser failed: %v", err)
	}

	// Create a job to save
	intPtr := func(v int) *int { return &v }
	job := &domain.Job{
		ID: "j1", Title: "Go Dev", Description: "Go development",
		Company: "Co", CompanySlug: "co", Location: "NYC",
		SalaryMin: intPtr(100000), SalaryMax: intPtr(150000), SalaryCurrency: "USD",
		PostedAt: time.Now(), Source: "linkedin", SourceURL: "https://linkedin.com/j1",
		Skills: domain.StringSlice{"Go"}, IsRemote: true,
		EmploymentType: "full-time", ExperienceLevel: "mid",
	}
	if err := jobRepo.UpsertJob(ctx, job); err != nil {
		t.Fatalf("UpsertJob failed: %v", err)
	}

	// Save job
	if err := userRepo.SaveJob(ctx, "u1", "j1"); err != nil {
		t.Fatalf("SaveJob failed: %v", err)
	}

	// Check saved
	saved, err := userRepo.IsJobSaved(ctx, "u1", "j1")
	if err != nil {
		t.Fatalf("IsJobSaved failed: %v", err)
	}
	if !saved {
		t.Error("expected job to be saved")
	}

	// List saved jobs
	savedJobs, err := userRepo.GetSavedJobs(ctx, "u1")
	if err != nil {
		t.Fatalf("GetSavedJobs failed: %v", err)
	}
	if len(savedJobs) != 1 {
		t.Fatalf("savedJobs length = %d, want 1", len(savedJobs))
	}
	if savedJobs[0].ID != "j1" {
		t.Errorf("saved job ID = %q, want %q", savedJobs[0].ID, "j1")
	}

	// Unsave
	if err := userRepo.UnsaveJob(ctx, "u1", "j1"); err != nil {
		t.Fatalf("UnsaveJob failed: %v", err)
	}
	saved2, _ := userRepo.IsJobSaved(ctx, "u1", "j1")
	if saved2 {
		t.Error("expected job to be unsaved")
	}
}

func TestUserRepo_GetSavedJobIDs(t *testing.T) {
	db := testDB(t)
	userRepo := NewUserRepo(db)
	jobRepo := NewJobRepo(db)
	ctx := context.Background()

	user := &domain.User{
		ID: "u1", Email: "test@example.com", PasswordHash: "hash",
		Name: "Test", CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}
	userRepo.CreateUser(ctx, user)

	intPtr := func(v int) *int { return &v }
	for _, id := range []string{"j1", "j2"} {
		job := &domain.Job{
			ID: id, Title: "Job", Description: "Desc",
			Company: "Co", CompanySlug: "co", Location: "NYC",
			SalaryMin: intPtr(100000), SalaryMax: intPtr(150000), SalaryCurrency: "USD",
			PostedAt: time.Now(), Source: "linkedin", SourceURL: "https://example.com/" + id,
			Skills: domain.StringSlice{"Go"}, IsRemote: false,
			EmploymentType: "full-time", ExperienceLevel: "mid",
		}
		jobRepo.UpsertJob(ctx, job)
		userRepo.SaveJob(ctx, "u1", id)
	}

	ids, err := userRepo.GetSavedJobIDs(ctx, "u1")
	if err != nil {
		t.Fatalf("GetSavedJobIDs failed: %v", err)
	}
	if len(ids) != 2 {
		t.Errorf("IDs length = %d, want 2", len(ids))
	}
	if !ids["j1"] || !ids["j2"] {
		t.Error("expected both j1 and j2 to be saved")
	}
}
