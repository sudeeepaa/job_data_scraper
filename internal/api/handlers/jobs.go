package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

// JobHandler handles job-related HTTP requests
type JobHandler struct {
	svc *service.JobService
}

// NewJobHandler creates a new job handler
func NewJobHandler(svc *service.JobService) *JobHandler {
	return &JobHandler{svc: svc}
}

// ListJobs handles GET /api/v1/jobs
func (h *JobHandler) ListJobs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query params
	params := domain.JobQueryParams{
		Query:           r.URL.Query().Get("q"),
		Location:        r.URL.Query().Get("location"),
		ExperienceLevel: r.URL.Query().Get("experience"),
		Source:          r.URL.Query().Get("source"),
	}

	if minStr := r.URL.Query().Get("salary_min"); minStr != "" {
		if min, err := strconv.Atoi(minStr); err == nil {
			params.SalaryMin = &min
		}
	}

	if remoteStr := r.URL.Query().Get("remote"); remoteStr != "" {
		remote := remoteStr == "true"
		params.IsRemote = &remote
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	pag := domain.NewPagination(page, limit)

	// Fetch data
	jobs, meta, err := h.svc.ListJobs(ctx, params, pag)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Set cache headers
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=300, stale-while-revalidate=60")

	json.NewEncoder(w).Encode(map[string]any{
		"data":       jobs,
		"pagination": meta,
	})
}

// GetJob handles GET /api/v1/jobs/{id}
func (h *JobHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	job, err := h.svc.GetJob(r.Context(), id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	if job == nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	json.NewEncoder(w).Encode(job)
}

// GetFilters handles GET /api/v1/filters
func (h *JobHandler) GetFilters(w http.ResponseWriter, r *http.Request) {
	filters := h.svc.GetFilterOptions(r.Context())

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=21600")

	json.NewEncoder(w).Encode(filters)
}
