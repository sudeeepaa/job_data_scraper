package domain

import "time"

// User represents a registered user.
type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Name         string    `json:"name" db:"name"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

// SavedJob represents a user's bookmarked job.
type SavedJob struct {
	UserID  string    `json:"userId" db:"user_id"`
	JobID   string    `json:"jobId" db:"job_id"`
	SavedAt time.Time `json:"savedAt" db:"saved_at"`
}

// RegisterRequest is the payload for user registration.
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

// LoginRequest is the payload for user login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse is returned after successful auth.
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
