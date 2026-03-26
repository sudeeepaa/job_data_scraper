package repository

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// UserRepo provides database-backed access to user data.
type UserRepo struct {
	db *sqlx.DB
}

// NewUserRepo creates a new user repository.
func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{db: db}
}

// CreateUser inserts a new user.
func (r *UserRepo) CreateUser(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
		VALUES (:id, :email, :password_hash, :name, :created_at, :updated_at)
	`
	_, err := r.db.NamedExecContext(ctx, query, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// GetUserByEmail retrieves a user by their email address.
func (r *UserRepo) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	err := r.db.GetContext(ctx, &user, "SELECT * FROM users WHERE email = ?", email)
	if err != nil {
		return nil, nil // Not found
	}
	return &user, nil
}

// GetUserByID retrieves a user by their ID.
func (r *UserRepo) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User
	err := r.db.GetContext(ctx, &user, "SELECT * FROM users WHERE id = ?", id)
	if err != nil {
		return nil, nil // Not found
	}
	return &user, nil
}

// SaveJob creates a bookmark for a user.
func (r *UserRepo) SaveJob(ctx context.Context, userID, jobID string) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT OR IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)",
		userID, jobID)
	return err
}

// UnsaveJob removes a bookmark for a user.
func (r *UserRepo) UnsaveJob(ctx context.Context, userID, jobID string) error {
	_, err := r.db.ExecContext(ctx,
		"DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?",
		userID, jobID)
	return err
}

// GetSavedJobs returns all saved job IDs for a user.
func (r *UserRepo) GetSavedJobs(ctx context.Context, userID string) ([]domain.JobSummary, error) {
	var jobs []domain.JobSummary
	err := r.db.SelectContext(ctx, &jobs, `
		SELECT j.id, j.title, j.company, j.company_slug, j.location,
		       j.salary_min, j.salary_max, j.salary_currency,
		       j.posted_at, j.source, j.source_url, j.skills, j.is_remote, j.experience_level
		FROM saved_jobs sj
		JOIN jobs j ON sj.job_id = j.id
		WHERE sj.user_id = ?
		ORDER BY sj.saved_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	if jobs == nil {
		jobs = []domain.JobSummary{}
	}
	return jobs, nil
}

// IsJobSaved checks if a specific job is bookmarked by a user.
func (r *UserRepo) IsJobSaved(ctx context.Context, userID, jobID string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count,
		"SELECT COUNT(*) FROM saved_jobs WHERE user_id = ? AND job_id = ?",
		userID, jobID)
	return count > 0, err
}

// GetSavedJobIDs returns just the IDs of saved jobs for a user (for batch checking).
func (r *UserRepo) GetSavedJobIDs(ctx context.Context, userID string) (map[string]bool, error) {
	var ids []string
	err := r.db.SelectContext(ctx, &ids,
		"SELECT job_id FROM saved_jobs WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	result := make(map[string]bool, len(ids))
	for _, id := range ids {
		result[id] = true
	}
	return result, nil
}
