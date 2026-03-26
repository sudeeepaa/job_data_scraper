package domain

import "time"

// SearchCacheEntry tracks whether a search query has fresh cached results.
type SearchCacheEntry struct {
	QueryHash   string    `db:"query_hash"`
	QueryText   string    `db:"query_text"`
	Filters     string    `db:"filters"`
	ResultCount int       `db:"result_count"`
	FetchedAt   time.Time `db:"fetched_at"`
}

// IsFresh returns true if the cached data is within the given TTL.
func (e *SearchCacheEntry) IsFresh(ttl time.Duration) bool {
	return time.Since(e.FetchedAt) < ttl
}

// MarketTrend represents aggregated skill trend data.
type MarketTrend struct {
	ID           int       `json:"id" db:"id"`
	SkillName    string    `json:"skillName" db:"skill_name"`
	MentionCount int       `json:"mentionCount" db:"mention_count"`
	AvgSalaryMin *int      `json:"avgSalaryMin,omitempty" db:"avg_salary_min"`
	AvgSalaryMax *int      `json:"avgSalaryMax,omitempty" db:"avg_salary_max"`
	SnapshotDate string    `json:"snapshotDate" db:"snapshot_date"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
}
