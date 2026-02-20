package repository

import (
	"context"
	"testing"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/domain"
)

func TestCacheRepo_SetAndGet(t *testing.T) {
	db := testDB(t)
	repo := NewCacheRepo(db)
	ctx := context.Background()

	entry := &domain.SearchCacheEntry{
		QueryHash:   "abc123",
		QueryText:   "golang developer",
		Filters:     `{"location":"SF"}`,
		ResultCount: 42,
		FetchedAt:   time.Now(),
	}

	if err := repo.SetCacheEntry(ctx, entry); err != nil {
		t.Fatalf("SetCacheEntry failed: %v", err)
	}

	got, err := repo.GetCacheEntry(ctx, "abc123")
	if err != nil {
		t.Fatalf("GetCacheEntry failed: %v", err)
	}
	if got == nil {
		t.Fatal("GetCacheEntry returned nil")
	}
	if got.QueryText != "golang developer" {
		t.Errorf("QueryText = %q, want %q", got.QueryText, "golang developer")
	}
	if got.ResultCount != 42 {
		t.Errorf("ResultCount = %d, want 42", got.ResultCount)
	}
}

func TestCacheRepo_GetNotFound(t *testing.T) {
	db := testDB(t)
	repo := NewCacheRepo(db)
	ctx := context.Background()

	got, err := repo.GetCacheEntry(ctx, "nonexistent")
	if err != nil {
		t.Fatalf("GetCacheEntry failed: %v", err)
	}
	if got != nil {
		t.Error("expected nil for nonexistent cache entry")
	}
}

func TestCacheRepo_IsCacheFresh(t *testing.T) {
	db := testDB(t)
	repo := NewCacheRepo(db)
	ctx := context.Background()

	// Fresh entry
	entry := &domain.SearchCacheEntry{
		QueryHash:   "fresh1",
		QueryText:   "fresh query",
		Filters:     "{}",
		ResultCount: 10,
		FetchedAt:   time.Now(),
	}
	repo.SetCacheEntry(ctx, entry)

	fresh, err := repo.IsCacheFresh(ctx, "fresh1", 24*time.Hour)
	if err != nil {
		t.Fatalf("IsCacheFresh failed: %v", err)
	}
	if !fresh {
		t.Error("expected cache to be fresh")
	}

	// Stale entry
	staleEntry := &domain.SearchCacheEntry{
		QueryHash:   "stale1",
		QueryText:   "stale query",
		Filters:     "{}",
		ResultCount: 5,
		FetchedAt:   time.Now().Add(-48 * time.Hour),
	}
	repo.SetCacheEntry(ctx, staleEntry)

	fresh2, _ := repo.IsCacheFresh(ctx, "stale1", 24*time.Hour)
	if fresh2 {
		t.Error("expected cache to be stale")
	}

	// Nonexistent
	fresh3, _ := repo.IsCacheFresh(ctx, "nonexistent", 24*time.Hour)
	if fresh3 {
		t.Error("expected nonexistent to be not fresh")
	}
}

func TestCacheRepo_DeleteStaleCaches(t *testing.T) {
	db := testDB(t)
	repo := NewCacheRepo(db)
	ctx := context.Background()

	// Insert a stale entry
	stale := &domain.SearchCacheEntry{
		QueryHash: "old", QueryText: "old query", Filters: "{}",
		ResultCount: 1, FetchedAt: time.Now().Add(-72 * time.Hour),
	}
	repo.SetCacheEntry(ctx, stale)

	// Insert a fresh entry
	fresh := &domain.SearchCacheEntry{
		QueryHash: "new", QueryText: "new query", Filters: "{}",
		ResultCount: 1, FetchedAt: time.Now(),
	}
	repo.SetCacheEntry(ctx, fresh)

	// Delete stale (older than 24h)
	if err := repo.DeleteStaleCaches(ctx, 24*time.Hour); err != nil {
		t.Fatalf("DeleteStaleCaches failed: %v", err)
	}

	// Old should be gone
	got, _ := repo.GetCacheEntry(ctx, "old")
	if got != nil {
		t.Error("expected stale entry to be deleted")
	}

	// New should remain
	got2, _ := repo.GetCacheEntry(ctx, "new")
	if got2 == nil {
		t.Error("expected fresh entry to remain")
	}
}
