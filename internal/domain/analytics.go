package domain

import "time"

// SkillCount represents a skill and its frequency
type SkillCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// TrendPoint represents a data point in a time series
type TrendPoint struct {
	Date  time.Time `json:"date"`
	Count int       `json:"count"`
}

// AnalyticsSummary provides high-level stats
type AnalyticsSummary struct {
	TotalJobs       int `json:"totalJobs"`
	TotalCompanies  int `json:"totalCompanies"`
	JobsToday       int `json:"jobsToday"`
	JobsThisWeek    int `json:"jobsThisWeek"`
	AverageSalary   int `json:"averageSalary"`
	RemoteJobsCount int `json:"remoteJobsCount"`
}

// SourceDistribution shows job count per source
type SourceDistribution struct {
	Source string `json:"source"`
	Count  int    `json:"count"`
}

// SourceHealth provides the latest ingestion status for a configured source.
type SourceHealth struct {
	Name          string     `json:"name"`
	Healthy       bool       `json:"healthy"`
	ResultCount   int        `json:"resultCount"`
	LastQuery     string     `json:"lastQuery,omitempty"`
	LastError     string     `json:"lastError,omitempty"`
	LastAttemptAt *time.Time `json:"lastAttemptAt,omitempty"`
	LastSuccessAt *time.Time `json:"lastSuccessAt,omitempty"`
	LastDuration  string     `json:"lastDuration,omitempty"`
}

// SalaryStats provides aggregate salary statistics across all jobs.
type SalaryStats struct {
	MinSalary       int `json:"minSalary" db:"min_salary"`
	MaxSalary       int `json:"maxSalary" db:"max_salary"`
	AvgMin          int `json:"avgMin" db:"avg_min"`
	AvgMax          int `json:"avgMax" db:"avg_max"`
	MedianSalary    int `json:"medianSalary" db:"-"`
	TotalWithSalary int `json:"totalWithSalary" db:"total_with_salary"`
}
