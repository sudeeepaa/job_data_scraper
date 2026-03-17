package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

// CompanyHandler handles HTTP requests for company endpoints.
type CompanyHandler struct {
	svc *service.JobService
}

// NewCompanyHandler creates a new CompanyHandler.
func NewCompanyHandler(svc *service.JobService) *CompanyHandler {
	return &CompanyHandler{svc: svc}
}

// ListCompanies returns all companies.
func (h *CompanyHandler) ListCompanies(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	companies, err := h.svc.ListCompanies(r.Context(), query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list companies")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=600")
	writeJSON(w, http.StatusOK, map[string]interface{}{"data": companies})
}

// GetCompany returns a company by slug with its jobs.
func (h *CompanyHandler) GetCompany(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	company, err := h.svc.GetCompany(r.Context(), slug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get company")
		return
	}
	if company == nil {
		writeError(w, http.StatusNotFound, "company not found")
		return
	}

	jobs, err := h.svc.GetCompanyJobs(r.Context(), slug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get company jobs")
		return
	}

	skills, err := h.svc.GetCompanySkills(r.Context(), slug)
	if err != nil {
		skills = []string{}
	}

	// Update job count dynamically in the response
	company.JobCount = len(jobs)

	w.Header().Set("Cache-Control", "public, max-age=600")
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"company":    company,
		"jobs":       jobs,
		"realSkills": skills,
	})
}
