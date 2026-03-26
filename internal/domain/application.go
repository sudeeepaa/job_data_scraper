package domain

import "time"

// ApplicationStatus represents the state of a job application.
type ApplicationStatus string

const (
	StatusWishlist    ApplicationStatus = "wishlist"
	StatusApplied     ApplicationStatus = "applied"
	StatusInterview   ApplicationStatus = "interviewing"
	StatusOffered     ApplicationStatus = "offered"
	StatusRejected    ApplicationStatus = "rejected"
)

// Application represents a user's tracked job application.
type Application struct {
	ID        string            `json:"id" db:"id"`
	UserID    string            `json:"userId" db:"user_id"`
	JobID     *string           `json:"jobId" db:"job_id"`
	Title     string            `json:"title" db:"title"`
	Company   string            `json:"company" db:"company"`
	Status    ApplicationStatus `json:"status" db:"status"`
	Notes     string            `json:"notes" db:"notes"`
	AppliedAt *time.Time        `json:"appliedAt" db:"applied_at"`
	CreatedAt time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time         `json:"updatedAt" db:"updated_at"`
}

// ApplicationCreate is used when creating a new application.
type ApplicationCreate struct {
	JobID     *string           `json:"jobId"`
	Title     string            `json:"title"`
	Company   string            `json:"company"`
	Status    ApplicationStatus `json:"status"`
	Notes     string            `json:"notes"`
	AppliedAt *time.Time        `json:"appliedAt"`
}

// ApplicationUpdate is used when updating an existing application.
type ApplicationUpdate struct {
	Status    *ApplicationStatus `json:"status"`
	Notes     *string            `json:"notes"`
	AppliedAt *time.Time         `json:"appliedAt"`
}
