package models

type CandidateProfile struct {
    ID                  string   `json:"id"`
    Name                string   `json:"name"`
    Skills              []string `json:"skills"`
    ExperienceYears     int      `json:"experience_years"`
    PreferredRoles      []string `json:"preferred_roles"`
    PreferredLocations  []string `json:"preferred_locations"`
    SalaryMin           int      `json:"salary_min"`
    JobTypes            []string `json:"job_types"`
}
