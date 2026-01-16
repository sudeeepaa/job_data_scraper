package models

// RawJob represents unnormalized scraped data
type RawJob struct {
    Title       string `json:"title"`
    Company     string `json:"company"`
    Location    string `json:"location"`
    Salary      string `json:"salary"`
    Description string `json:"description"`
    URL         string `json:"url"`
    Source      string `json:"source"`
}
