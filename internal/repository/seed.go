package repository

import (
	"context"
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
)

// SeedDatabase now acts as a cleanup utility to purge fake/placeholder data.
func SeedDatabase(ctx context.Context, db *sqlx.DB) error {
	log.Println("🧹 Purging fake/placeholder data from database...")

	// 1. Delete fake jobs (source linkedin/indeed but not from jsearch/adzuna)
	res, err := db.ExecContext(ctx, `
		DELETE FROM jobs 
		WHERE source IN ('linkedin', 'indeed', 'seed')
		  AND id NOT LIKE '%jsearch%'
		  AND id NOT LIKE '%adzuna%'
		  AND id NOT LIKE '%hn%'
		  AND id NOT LIKE '%remoteok%'
		  AND id NOT LIKE '%weworkremotely%'
		  AND id NOT LIKE '%jobicy%'
	`)
	if err != nil {
		return fmt.Errorf("failed to purge fake jobs: %w", err)
	}
	jobsDeleted, _ := res.RowsAffected()

	// 2. Delete fake companies (example.com, placeholder, or generic names)
	res, err = db.ExecContext(ctx, `
		DELETE FROM companies 
		WHERE website LIKE '%example.com%'
		   OR website LIKE '%placeholder%'
		   OR slug IN ('techcorp', 'startupxyz', 'cloudsys', 'webdev-inc', 'dataflow', 'fintech-pro', 'megatech', 'appworks', 'ai-labs')
	`)
	if err != nil {
		return fmt.Errorf("failed to purge fake companies: %w", err)
	}
	companiesDeleted, _ := res.RowsAffected()

	// 3. Delete old trends
	res, err = db.ExecContext(ctx, "DELETE FROM market_trends WHERE snapshot_date < DATE('now', '-30 days')")
	if err != nil {
		log.Printf("⚠️ Failed to purge old trends: %v", err)
	}

	if jobsDeleted > 0 || companiesDeleted > 0 {
		log.Printf("✨ Purged %d fake jobs and %d fake companies", jobsDeleted, companiesDeleted)
	}

	return nil
}
