package models

import "time"

// ScrapeLog tracks scraping activity
type ScrapeLog struct {
    Source      string    `json:"source"`
    JobsFetched int       `json:"jobs_fetched"`
    Status      string    `json:"status"`
    Timestamp   time.Time `json:"timestamp"`
}
