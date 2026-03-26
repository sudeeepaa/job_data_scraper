package scrapebridge

import "time"

type searchRequest struct {
	Query    string   `json:"query"`
	Location string   `json:"location"`
	Page     int      `json:"page"`
	Sources  []string `json:"sources,omitempty"`
}

type searchResponse struct {
	Jobs []bridgeJob `json:"jobs"`
}

type bridgeJob struct {
	ExternalID      string    `json:"external_id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Company         string    `json:"company"`
	Location        string    `json:"location"`
	SalaryMin       *int      `json:"salary_min"`
	SalaryMax       *int      `json:"salary_max"`
	SalaryCurrency  string    `json:"salary_currency"`
	PostedAt        time.Time `json:"posted_at"`
	Source          string    `json:"source"`
	SourceURL       string    `json:"source_url"`
	Skills          []string  `json:"skills"`
	IsRemote        bool      `json:"is_remote"`
	EmploymentType  string    `json:"employment_type"`
	ExperienceLevel string    `json:"experience_level"`
}
