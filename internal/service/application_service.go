package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/repository"
)

type ApplicationService struct {
	repo *repository.ApplicationRepo
}

func NewApplicationService(repo *repository.ApplicationRepo) *ApplicationService {
	return &ApplicationService{repo: repo}
}

func (s *ApplicationService) ListApplications(ctx context.Context, userID string) ([]domain.Application, error) {
	return s.repo.List(ctx, userID)
}

func (s *ApplicationService) CreateApplication(ctx context.Context, userID string, req domain.ApplicationCreate) (*domain.Application, error) {
	now := time.Now()
	app := &domain.Application{
		ID:        uuid.New().String(),
		UserID:    userID,
		JobID:     req.JobID,
		Title:     req.Title,
		Company:   req.Company,
		Status:    req.Status,
		Notes:     req.Notes,
		AppliedAt: req.AppliedAt,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.repo.Create(ctx, app); err != nil {
		return nil, err
	}
	return app, nil
}

func (s *ApplicationService) UpdateApplication(ctx context.Context, id, userID string, req domain.ApplicationUpdate) (*domain.Application, error) {
	app, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if app == nil || app.UserID != userID {
		return nil, nil // Not found or not owned
	}

	if req.Status != nil {
		app.Status = *req.Status
	}
	if req.Notes != nil {
		app.Notes = *req.Notes
	}
	if req.AppliedAt != nil {
		app.AppliedAt = req.AppliedAt
	}

	if err := s.repo.Update(ctx, app); err != nil {
		return nil, err
	}
	return app, nil
}

func (s *ApplicationService) DeleteApplication(ctx context.Context, id, userID string) error {
	return s.repo.Delete(ctx, id, userID)
}
