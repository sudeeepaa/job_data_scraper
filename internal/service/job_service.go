package service

import (
	"context"

	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/repository"
)

// JobService provides business logic for job operations
type JobService struct {
	repo *repository.JobRepository
}

// NewJobService creates a new job service
func NewJobService(repo *repository.JobRepository) *JobService {
	return &JobService{repo: repo}
}

// ListJobs returns filtered and paginated jobs
func (s *JobService) ListJobs(ctx context.Context, params domain.JobQueryParams, pag domain.Pagination) ([]domain.JobSummary, domain.PaginationMeta, error) {
	jobs, total, err := s.repo.ListJobs(ctx, params, pag)
	if err != nil {
		return nil, domain.PaginationMeta{}, err
	}

	meta := domain.NewPaginationMeta(pag.Page, pag.Limit, total)
	return jobs, meta, nil
}

// GetJob returns a single job by ID
func (s *JobService) GetJob(ctx context.Context, id string) (*domain.Job, error) {
	return s.repo.GetJob(ctx, id)
}

// ListCompanies returns all companies
func (s *JobService) ListCompanies(ctx context.Context, query string) ([]domain.Company, error) {
	return s.repo.ListCompanies(ctx, query)
}

// GetCompany returns a company with its jobs
func (s *JobService) GetCompany(ctx context.Context, slug string) (*domain.Company, []domain.JobSummary, error) {
	company, err := s.repo.GetCompany(ctx, slug)
	if err != nil {
		return nil, nil, err
	}
	if company == nil {
		return nil, nil, nil
	}

	jobs, err := s.repo.GetCompanyJobs(ctx, slug)
	if err != nil {
		return nil, nil, err
	}

	return company, jobs, nil
}

// GetFilterOptions returns available filter values
func (s *JobService) GetFilterOptions(ctx context.Context) domain.FilterOptions {
	return s.repo.GetFilterOptions(ctx)
}

// GetTopSkills returns skill frequency counts
func (s *JobService) GetTopSkills(ctx context.Context, limit int) []domain.SkillCount {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.GetTopSkills(ctx, limit)
}

// GetAnalyticsSummary returns high-level stats
func (s *JobService) GetAnalyticsSummary(ctx context.Context) domain.AnalyticsSummary {
	return s.repo.GetAnalyticsSummary(ctx)
}
