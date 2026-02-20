package service

import (
	"context"

	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/repository"
)

// JobService handles business logic for jobs and analytics.
type JobService struct {
	jobRepo    *repository.JobRepo
	userRepo   *repository.UserRepo
	cacheRepo  *repository.CacheRepo
	aggregator *Aggregator
}

// NewJobService creates a new job service.
func NewJobService(jobRepo *repository.JobRepo, userRepo *repository.UserRepo, cacheRepo *repository.CacheRepo, aggregator *Aggregator) *JobService {
	return &JobService{
		jobRepo:    jobRepo,
		userRepo:   userRepo,
		cacheRepo:  cacheRepo,
		aggregator: aggregator,
	}
}

// SearchJobs triggers a live search via the aggregator (cache-aware).
// Returns nil if no aggregator is configured.
func (s *JobService) SearchJobs(ctx context.Context, query, location string, page int) ([]domain.Job, error) {
	if s.aggregator == nil {
		return nil, nil
	}
	return s.aggregator.SearchAndStore(ctx, query, location, page)
}

// HasAggregator returns whether live search is available.
func (s *JobService) HasAggregator() bool {
	return s.aggregator != nil
}

// ListJobs returns filtered and paginated job listings.
func (s *JobService) ListJobs(ctx context.Context, params domain.JobQueryParams, pag domain.Pagination) ([]domain.JobSummary, int, error) {
	return s.jobRepo.ListJobs(ctx, params, pag)
}

// GetJob returns a single job by ID.
func (s *JobService) GetJob(ctx context.Context, id string) (*domain.Job, error) {
	return s.jobRepo.GetJob(ctx, id)
}

// ListCompanies returns all companies, optionally filtered.
func (s *JobService) ListCompanies(ctx context.Context, query string) ([]domain.Company, error) {
	return s.jobRepo.ListCompanies(ctx, query)
}

// GetCompany returns a company by slug.
func (s *JobService) GetCompany(ctx context.Context, slug string) (*domain.Company, error) {
	return s.jobRepo.GetCompany(ctx, slug)
}

// GetCompanyJobs returns job summaries for a company.
func (s *JobService) GetCompanyJobs(ctx context.Context, slug string) ([]domain.JobSummary, error) {
	return s.jobRepo.GetCompanyJobs(ctx, slug)
}

// GetFilterOptions returns available filter values.
func (s *JobService) GetFilterOptions(ctx context.Context) (domain.FilterOptions, error) {
	return s.jobRepo.GetFilterOptions(ctx)
}

// GetTopSkills returns skill frequency counts.
func (s *JobService) GetTopSkills(ctx context.Context, limit int) ([]domain.SkillCount, error) {
	return s.jobRepo.GetTopSkills(ctx, limit)
}

// GetAnalyticsSummary returns high-level stats.
func (s *JobService) GetAnalyticsSummary(ctx context.Context) (domain.AnalyticsSummary, error) {
	return s.jobRepo.GetAnalyticsSummary(ctx)
}
