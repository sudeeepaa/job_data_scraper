package repository

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// CacheRepo provides database-backed access to search cache data.
type CacheRepo struct {
	db *sqlx.DB
}

// NewCacheRepo creates a new cache repository.
func NewCacheRepo(db *sqlx.DB) *CacheRepo {
	return &CacheRepo{db: db}
}

// GetCacheEntry retrieves a cache entry by query hash.
func (r *CacheRepo) GetCacheEntry(ctx context.Context, queryHash string) (*domain.SearchCacheEntry, error) {
	var entry domain.SearchCacheEntry
	err := r.db.GetContext(ctx, &entry,
		"SELECT * FROM search_cache WHERE query_hash = ?", queryHash)
	if err != nil {
		return nil, nil // Not found
	}
	return &entry, nil
}

// SetCacheEntry creates or updates a cache entry.
func (r *CacheRepo) SetCacheEntry(ctx context.Context, entry *domain.SearchCacheEntry) error {
	if entry.FetchedAt.IsZero() {
		entry.FetchedAt = time.Now()
	}

	query := `
		INSERT INTO search_cache (query_hash, query_text, filters, result_count, fetched_at)
		VALUES (:query_hash, :query_text, :filters, :result_count, :fetched_at)
		ON CONFLICT(query_hash) DO UPDATE SET
		    query_text = excluded.query_text,
		    filters = excluded.filters,
		    result_count = excluded.result_count,
		    fetched_at = excluded.fetched_at
	`
	_, err := r.db.NamedExecContext(ctx, query, entry)
	return err
}

// IsCacheFresh checks if a cached search is within the TTL.
func (r *CacheRepo) IsCacheFresh(ctx context.Context, queryHash string, ttl time.Duration) (bool, error) {
	entry, err := r.GetCacheEntry(ctx, queryHash)
	if err != nil {
		return false, err
	}
	if entry == nil {
		return false, nil
	}
	return entry.IsFresh(ttl), nil
}

// DeleteStaleCaches removes cache entries older than the given TTL.
func (r *CacheRepo) DeleteStaleCaches(ctx context.Context, ttl time.Duration) error {
	cutoff := time.Now().Add(-ttl)
	_, err := r.db.ExecContext(ctx,
		"DELETE FROM search_cache WHERE fetched_at < ?", cutoff)
	return err
}
