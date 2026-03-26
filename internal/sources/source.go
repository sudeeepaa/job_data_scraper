package sources

import (
	"context"

	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// JobSource is the interface that all job API clients must implement.
type JobSource interface {
	// Name returns a unique identifier for this source (e.g. "jsearch", "adzuna").
	Name() string

	// Search fetches jobs matching the query and location.
	Search(ctx context.Context, query, location string, page int) ([]domain.Job, error)
}
