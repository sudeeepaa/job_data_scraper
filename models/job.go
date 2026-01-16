package models

import "time"

// Job is the normalized canonical job model
type Job struct {
    ID          string    `json:"id"`
    Title       string    `json:"title"`
    Company     string    `json:"company"`
    Location    string    `json:"location"`
    Skills      []string  `json:"skills"`
    Experience  int       `json:"experience"`
    SalaryMin   int       `json:"salary_min"`
    SalaryMax   int       `json:"salary_max"`
    JobType     string    `json:"job_type"`
    Source      string    `json:"source"`
    URL         string    `json:"url"`
    PostedDate  time.Time `json:"posted_date"`
}
