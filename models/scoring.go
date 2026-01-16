package models

// ScoreWeights allows tuning scoring without code changes
type ScoreWeights struct {
    SkillWeight      float64 `json:"skill_weight"`
    ExperienceWeight float64 `json:"experience_weight"`
    RoleWeight       float64 `json:"role_weight"`
    LocationWeight   float64 `json:"location_weight"`
    SalaryWeight     float64 `json:"salary_weight"`
}
