package adzuna

import "time"

// searchResponse is the top-level Adzuna API response.
type searchResponse struct {
	Results []jobResult `json:"results"`
	Count   int         `json:"count"`
	Mean    float64     `json:"mean"`
}

// jobResult represents a single job from Adzuna.
type jobResult struct {
	ID                int          `json:"id"`
	Title             string       `json:"title"`
	Description       string       `json:"description"`
	Company           companyInfo  `json:"company"`
	Location          locationInfo `json:"location"`
	SalaryMin         *float64     `json:"salary_min"`
	SalaryMax         *float64     `json:"salary_max"`
	SalaryIsPredicted int          `json:"salary_is_predicted"`
	ContractType      string       `json:"contract_type"`
	ContractTime      string       `json:"contract_time"`
	Category          categoryInfo `json:"category"`
	Created           string       `json:"created"`
	RedirectURL       string       `json:"redirect_url"`
	Latitude          float64      `json:"latitude"`
	Longitude         float64      `json:"longitude"`
}

type companyInfo struct {
	DisplayName string `json:"display_name"`
}

type locationInfo struct {
	DisplayName string   `json:"display_name"`
	Area        []string `json:"area"`
}

type categoryInfo struct {
	Label string `json:"label"`
	Tag   string `json:"tag"`
}

// postedAt parses the Adzuna created timestamp.
func (jr *jobResult) postedAt() time.Time {
	if jr.Created == "" {
		return time.Now()
	}
	t, err := time.Parse(time.RFC3339, jr.Created)
	if err != nil {
		t, err = time.Parse("2006-01-02T15:04:05Z", jr.Created)
		if err != nil {
			return time.Now()
		}
	}
	return t
}
