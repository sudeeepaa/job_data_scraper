package domain

import "time"

// Job represents a complete job listing
type Job struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Company        string    `json:"company"`
	CompanySlug    string    `json:"companySlug"`
	Location       string    `json:"location"`
	Salary         *Salary   `json:"salary,omitempty"`
	PostedAt       time.Time `json:"postedAt"`
	ExpiresAt      time.Time `json:"expiresAt,omitempty"`
	Source         string    `json:"source"` // linkedin | indeed
	Skills         []string  `json:"skills"`
	IsRemote       bool      `json:"isRemote"`
	EmploymentType string    `json:"employmentType"` // full-time | part-time | contract
	ExperienceLevel string  `json:"experienceLevel"` // entry | mid | senior | lead
	URL            string    `json:"url"`
}

// JobSummary is a lighter version for list views
type JobSummary struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Company        string    `json:"company"`
	CompanySlug    string    `json:"companySlug"`
	Location       string    `json:"location"`
	Salary         *Salary   `json:"salary,omitempty"`
	PostedAt       time.Time `json:"postedAt"`
	Source         string    `json:"source"`
	Skills         []string  `json:"skills"`
	IsRemote       bool      `json:"isRemote"`
	ExperienceLevel string  `json:"experienceLevel"`
}

// Salary represents salary range information
type Salary struct {
	Min      int    `json:"min"`
	Max      int    `json:"max"`
	Currency string `json:"currency"`
}

// Company represents a hiring company
type Company struct {
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Industry    string `json:"industry"`
	Description string `json:"description"`
	Website     string `json:"website"`
	LogoURL     string `json:"logoUrl,omitempty"`
	JobCount    int    `json:"jobCount"`
}

// JobQueryParams holds filters for job searches
type JobQueryParams struct {
	Query           string
	Location        string
	ExperienceLevel string
	Source          string
	SalaryMin       *int
	IsRemote        *bool
	Sort            string // date_desc | date_asc | salary_desc | salary_asc
}

// Pagination holds pagination parameters
type Pagination struct {
	Page  int
	Limit int
}

// NewPagination creates pagination with defaults
func NewPagination(page, limit int) Pagination {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return Pagination{Page: page, Limit: limit}
}

// Offset returns the offset for database queries
func (p Pagination) Offset() int {
	return (p.Page - 1) * p.Limit
}

// PaginationMeta is returned in API responses
type PaginationMeta struct {
	Page       int  `json:"page"`
	Limit      int  `json:"limit"`
	TotalItems int  `json:"totalItems"`
	TotalPages int  `json:"totalPages"`
	HasMore    bool `json:"hasMore"`
}

// NewPaginationMeta creates pagination metadata
func NewPaginationMeta(page, limit, total int) PaginationMeta {
	totalPages := (total + limit - 1) / limit
	return PaginationMeta{
		Page:       page,
		Limit:      limit,
		TotalItems: total,
		TotalPages: totalPages,
		HasMore:    page < totalPages,
	}
}

// FilterOptions represents available filter values
type FilterOptions struct {
	Locations        []string `json:"locations"`
	ExperienceLevels []string `json:"experienceLevels"`
	Sources          []string `json:"sources"`
	Skills           []string `json:"skills"`
}
