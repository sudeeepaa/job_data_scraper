package models

// JobMatch represents a scored job for a candidate
type JobMatch struct {
    Job           Job     `json:"job"`
    Score         float64 `json:"score"`
    SkillMatch    float64 `json:"skill_match"`
    ExperienceFit float64 `json:"experience_fit"`
    LocationFit   float64 `json:"location_fit"`
    SalaryFit     float64 `json:"salary_fit"`
}
