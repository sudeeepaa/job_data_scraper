package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

// JobHandler handles HTTP requests for job endpoints.
type JobHandler struct {
	svc *service.JobService
}

// NewJobHandler creates a new JobHandler.
func NewJobHandler(svc *service.JobService) *JobHandler {
	return &JobHandler{svc: svc}
}

// ListJobs returns filtered, paginated jobs.
func (h *JobHandler) ListJobs(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	page, _ := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))
	pag := domain.NewPagination(page, limit)

	params := domain.JobQueryParams{
		Query:           q.Get("q"),
		Location:        q.Get("location"),
		ExperienceLevel: q.Get("experience"),
		Source:          q.Get("source"),
		Sort:            q.Get("sort"),
	}

	if salaryStr := q.Get("salary_min"); salaryStr != "" {
		if salary, err := strconv.Atoi(salaryStr); err == nil {
			params.SalaryMin = &salary
		}
	}

	if remoteStr := q.Get("remote"); remoteStr != "" {
		remote := remoteStr == "true"
		params.IsRemote = &remote
	}

	jobs, total, err := h.svc.ListJobs(r.Context(), params, pag)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list jobs"})
		return
	}

	meta := domain.NewPaginationMeta(pag.Page, pag.Limit, total)

	w.Header().Set("Cache-Control", "public, max-age=300")
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"data":       jobs,
		"pagination": meta,
	})
}

// GetJob returns a single job by ID.
func (h *JobHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	job, err := h.svc.GetJob(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get job"})
		return
	}
	if job == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "job not found"})
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=300")
	writeJSON(w, http.StatusOK, job)
}

// GetFilters returns available filter options.
func (h *JobHandler) GetFilters(w http.ResponseWriter, r *http.Request) {
	filters, err := h.svc.GetFilterOptions(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get filters"})
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=600")
	writeJSON(w, http.StatusOK, filters)
}
