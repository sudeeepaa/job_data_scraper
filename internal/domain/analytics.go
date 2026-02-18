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
