package repository

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

type ApplicationRepo struct {
	db *sqlx.DB
}

func NewApplicationRepo(db *sqlx.DB) *ApplicationRepo {
	return &ApplicationRepo{db: db}
}

func (r *ApplicationRepo) List(ctx context.Context, userID string) ([]domain.Application, error) {
	var apps []domain.Application
	err := r.db.SelectContext(ctx, &apps, "SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC", userID)
	if err != nil {
		return nil, err
	}
	if apps == nil {
		apps = []domain.Application{}
	}
	return apps, nil
}

func (r *ApplicationRepo) GetByID(ctx context.Context, id string) (*domain.Application, error) {
	var app domain.Application
	err := r.db.GetContext(ctx, &app, "SELECT * FROM applications WHERE id = ?", id)
	if err != nil {
		return nil, nil // Not found
	}
	return &app, nil
}

func (r *ApplicationRepo) Create(ctx context.Context, app *domain.Application) error {
	query := `
		INSERT INTO applications (id, user_id, job_id, title, company, status, notes, applied_at)
		VALUES (:id, :user_id, :job_id, :title, :company, :status, :notes, :applied_at)
	`
	_, err := r.db.NamedExecContext(ctx, query, app)
	return err
}

func (r *ApplicationRepo) Update(ctx context.Context, app *domain.Application) error {
	query := `
		UPDATE applications 
		SET status = :status, notes = :notes, applied_at = :applied_at, updated_at = CURRENT_TIMESTAMP
		WHERE id = :id AND user_id = :user_id
	`
	_, err := r.db.NamedExecContext(ctx, query, app)
	return err
}

func (r *ApplicationRepo) Delete(ctx context.Context, id, userID string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM applications WHERE id = ? AND user_id = ?", id, userID)
	return err
}
