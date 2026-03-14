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

	// Map short sort aliases to internal sort values
	sort := q.Get("sort")
	switch sort {
	case "date":
		sort = "date_desc"
	case "salary":
		sort = "salary_desc"
	case "relevance":
		sort = "date_desc" // alias — true relevance ranking is out of scope
	}

	params := domain.JobQueryParams{
		Query:           q.Get("q"),
		ExperienceLevel: q.Get("experience"),
		Source:          q.Get("source"),
		Sort:            sort,
		EmploymentType:  q.Get("employment_type"),
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

	// User-driven searches should pull fresh data before reading from the local DB.
	// Use refresh=false to opt out when a caller explicitly wants cache-only results.
	shouldRefresh := params.Query != "" && q.Get("refresh") != "false"
	if shouldRefresh {
		_, _ = h.svc.RefreshJobs(r.Context(), params.Query, "", pag.Page)
		// Errors from live fetch are non-fatal — we still return cached/stored data below.
	}

	jobs, total, err := h.svc.ListJobs(r.Context(), params, pag)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list jobs")
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
		writeError(w, http.StatusInternalServerError, "failed to get job")
		return
	}
	if job == nil {
		writeError(w, http.StatusNotFound, "job not found")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=300")
	writeJSON(w, http.StatusOK, job)
}

// GetFilters returns available filter options.
func (h *JobHandler) GetFilters(w http.ResponseWriter, r *http.Request) {
	filters, err := h.svc.GetFilterOptions(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get filters")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=600")
	writeJSON(w, http.StatusOK, filters)
}
