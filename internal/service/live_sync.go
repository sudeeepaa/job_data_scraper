package service

import (
	"context"
	"log"
	"time"
)

// LiveSyncWorker periodically warms live API results into the local database.
type LiveSyncWorker struct {
	jobService *JobService
	queries    []string
	locations  []string
	interval   time.Duration
}

// NewLiveSyncWorker creates a worker that periodically ingests live job data.
func NewLiveSyncWorker(jobService *JobService, queries, locations []string, interval time.Duration) *LiveSyncWorker {
	if len(locations) == 0 {
		locations = []string{""}
	}

	return &LiveSyncWorker{
		jobService: jobService,
		queries:    queries,
		locations:  locations,
		interval:   interval,
	}
}

// Start launches the background sync loop.
func (w *LiveSyncWorker) Start(ctx context.Context, syncOnStart bool) {
	if w == nil || w.jobService == nil || !w.jobService.HasAggregator() || len(w.queries) == 0 || w.interval <= 0 {
		return
	}

	go func() {
		if syncOnStart {
			w.syncOnce(ctx)
		}

		ticker := time.NewTicker(w.interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				w.syncOnce(ctx)
			}
		}
	}()
}

func (w *LiveSyncWorker) syncOnce(ctx context.Context) {
	log.Printf("🔄 Live sync starting for %d querie(s)", len(w.queries))

	for _, query := range w.queries {
		for _, location := range w.locations {
			syncCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
			_, err := w.jobService.RefreshJobs(syncCtx, query, location, 1)
			cancel()

			if err != nil {
				if location == "" {
					log.Printf("⚠️  Live sync failed for query=%q: %v", query, err)
				} else {
					log.Printf("⚠️  Live sync failed for query=%q location=%q: %v", query, location, err)
				}
				continue
			}

			if location == "" {
				log.Printf("✅ Live sync finished for query=%q", query)
			} else {
				log.Printf("✅ Live sync finished for query=%q location=%q", query, location)
			}
		}
	}

	if err := w.jobService.RefreshTrends(ctx); err != nil {
		log.Printf("⚠️  Live sync completed, but analytics refresh failed: %v", err)
	}
}
