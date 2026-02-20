package domain

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// StringSlice is a custom type for storing []string as JSON in SQLite TEXT columns.
type StringSlice []string

// Scan implements sql.Scanner for reading JSON text from the database.
func (s *StringSlice) Scan(src interface{}) error {
	if src == nil {
		*s = StringSlice{}
		return nil
	}

	var data []byte
	switch v := src.(type) {
	case string:
		data = []byte(v)
	case []byte:
		data = v
	default:
		return fmt.Errorf("unsupported type for StringSlice: %T", src)
	}

	return json.Unmarshal(data, s)
}

// Value implements driver.Valuer for writing JSON text to the database.
func (s StringSlice) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

// Job represents a complete job listing (database-backed).
type Job struct {
	ID              string      `json:"id" db:"id"`
	ExternalID      string      `json:"externalId,omitempty" db:"external_id"`
	Title           string      `json:"title" db:"title"`
	Description     string      `json:"description" db:"description"`
	Company         string      `json:"company" db:"company"`
	CompanySlug     string      `json:"companySlug" db:"company_slug"`
	Location        string      `json:"location" db:"location"`
	SalaryMin       *int        `json:"salaryMin,omitempty" db:"salary_min"`
	SalaryMax       *int        `json:"salaryMax,omitempty" db:"salary_max"`
	SalaryCurrency  string      `json:"salaryCurrency,omitempty" db:"salary_currency"`
	PostedAt        time.Time   `json:"postedAt" db:"posted_at"`
	ExpiresAt       *time.Time  `json:"expiresAt,omitempty" db:"expires_at"`
	Source          string      `json:"source" db:"source"`
	SourceURL       string      `json:"sourceUrl" db:"source_url"`
	Skills          StringSlice `json:"skills" db:"skills"`
	IsRemote        bool        `json:"isRemote" db:"is_remote"`
	EmploymentType  string      `json:"employmentType" db:"employment_type"`
	ExperienceLevel string      `json:"experienceLevel" db:"experience_level"`
	CreatedAt       time.Time   `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time   `json:"updatedAt" db:"updated_at"`
}

// Salary returns a Salary struct from the flat fields (for JSON backward compatibility).
func (j *Job) Salary() *Salary {
	if j.SalaryMin == nil && j.SalaryMax == nil {
		return nil
	}
	s := &Salary{Currency: j.SalaryCurrency}
	if j.SalaryMin != nil {
		s.Min = *j.SalaryMin
	}
	if j.SalaryMax != nil {
		s.Max = *j.SalaryMax
	}
	return s
}

// JobSummary is a lighter version for list views.
type JobSummary struct {
	ID              string      `json:"id" db:"id"`
	Title           string      `json:"title" db:"title"`
	Company         string      `json:"company" db:"company"`
	CompanySlug     string      `json:"companySlug" db:"company_slug"`
	Location        string      `json:"location" db:"location"`
	SalaryMin       *int        `json:"salaryMin,omitempty" db:"salary_min"`
	SalaryMax       *int        `json:"salaryMax,omitempty" db:"salary_max"`
	SalaryCurrency  string      `json:"salaryCurrency,omitempty" db:"salary_currency"`
	PostedAt        time.Time   `json:"postedAt" db:"posted_at"`
	Source          string      `json:"source" db:"source"`
	SourceURL       string      `json:"sourceUrl" db:"source_url"`
	Skills          StringSlice `json:"skills" db:"skills"`
	IsRemote        bool        `json:"isRemote" db:"is_remote"`
	ExperienceLevel string      `json:"experienceLevel" db:"experience_level"`
	IsSaved         bool        `json:"isSaved,omitempty" db:"-"`
}

// Salary returns a Salary struct for backward compatibility.
func (j *JobSummary) SalaryInfo() *Salary {
	if j.SalaryMin == nil && j.SalaryMax == nil {
		return nil
	}
	s := &Salary{Currency: j.SalaryCurrency}
	if j.SalaryMin != nil {
		s.Min = *j.SalaryMin
	}
	if j.SalaryMax != nil {
		s.Max = *j.SalaryMax
	}
	return s
}

// Salary represents salary range information.
type Salary struct {
	Min      int    `json:"min"`
	Max      int    `json:"max"`
	Currency string `json:"currency"`
}

// Company represents a hiring company.
type Company struct {
	Slug        string    `json:"slug" db:"slug"`
	Name        string    `json:"name" db:"name"`
	Industry    string    `json:"industry" db:"industry"`
	Description string    `json:"description" db:"description"`
	Website     string    `json:"website" db:"website"`
	LogoURL     string    `json:"logoUrl,omitempty" db:"logo_url"`
	JobCount    int       `json:"jobCount" db:"job_count"`
	CreatedAt   time.Time `json:"createdAt,omitempty" db:"created_at"`
}

// JobQueryParams holds filters for job searches.
type JobQueryParams struct {
	Query           string
	Location        string
	ExperienceLevel string
	Source          string
	SalaryMin       *int
	IsRemote        *bool
	Sort            string // date_desc | date_asc | salary_desc | salary_asc
	EmploymentType  string // full-time | part-time | contract | internship
}

// Pagination holds pagination parameters.
type Pagination struct {
	Page  int
	Limit int
}

// NewPagination creates pagination with defaults.
func NewPagination(page, limit int) Pagination {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return Pagination{Page: page, Limit: limit}
}

// Offset returns the offset for database queries.
func (p Pagination) Offset() int {
	return (p.Page - 1) * p.Limit
}

// PaginationMeta is returned in API responses.
type PaginationMeta struct {
	Page       int  `json:"page"`
	Limit      int  `json:"limit"`
	TotalItems int  `json:"totalItems"`
	TotalPages int  `json:"totalPages"`
	HasMore    bool `json:"hasMore"`
}

// NewPaginationMeta creates pagination metadata.
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

// FilterOptions represents available filter values.
type FilterOptions struct {
	Locations        []string `json:"locations"`
	ExperienceLevels []string `json:"experienceLevels"`
	Sources          []string `json:"sources"`
	Skills           []string `json:"skills"`
}
