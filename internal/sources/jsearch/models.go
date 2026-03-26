package jsearch

import "time"

// searchResponse is the top-level JSearch API response.
type searchResponse struct {
	Status    string      `json:"status"`
	RequestID string      `json:"request_id"`
	Data      []jobResult `json:"data"`
}

// jobResult represents a single job from JSearch.
type jobResult struct {
	JobID              string   `json:"job_id"`
	EmployerName       string   `json:"employer_name"`
	EmployerLogo       string   `json:"employer_logo"`
	EmployerWebsite    string   `json:"employer_website"`
	JobPublisher       string   `json:"job_publisher"`
	JobEmploymentType  string   `json:"job_employment_type"`
	JobTitle           string   `json:"job_title"`
	JobApplyLink       string   `json:"job_apply_link"`
	JobDescription     string   `json:"job_description"`
	JobCity            string   `json:"job_city"`
	JobState           string   `json:"job_state"`
	JobCountry         string   `json:"job_country"`
	JobIsRemote        bool     `json:"job_is_remote"`
	JobPostedAtStr     string   `json:"job_posted_at_datetime_utc"`
	JobMinSalary       *float64 `json:"job_min_salary"`
	JobMaxSalary       *float64 `json:"job_max_salary"`
	JobSalaryCurrency  string   `json:"job_salary_currency"`
	JobSalaryPeriod    string   `json:"job_salary_period"`
	JobRequiredSkills  []string `json:"job_required_skills"`
	JobExperienceLevel string   `json:"job_required_experience,omitempty"`
	ApplyOptions       []struct {
		Publisher string `json:"publisher"`
		ApplyLink string `json:"apply_link"`
	} `json:"apply_options"`
}

// postedAt parses the job posting timestamp.
func (jr *jobResult) postedAt() time.Time {
	if jr.JobPostedAtStr == "" {
		return time.Now()
	}
	t, err := time.Parse(time.RFC3339, jr.JobPostedAtStr)
	if err != nil {
		// Try alternative format
		t, err = time.Parse("2006-01-02T15:04:05.000Z", jr.JobPostedAtStr)
		if err != nil {
			return time.Now()
		}
	}
	return t
}
