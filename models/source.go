package models

// JobSource defines metadata about a job provider
type JobSource struct {
    Name       string `json:"name"`
    BaseURL    string `json:"base_url"`
    IsAPIBased bool   `json:"is_api_based"`
    RateLimit  int    `json:"rate_limit"`
}
