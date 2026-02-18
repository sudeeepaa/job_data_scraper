package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

// CompanyHandler handles company-related HTTP requests
type CompanyHandler struct {
	svc *service.JobService
}

// NewCompanyHandler creates a new company handler
func NewCompanyHandler(svc *service.JobService) *CompanyHandler {
	return &CompanyHandler{svc: svc}
}

// ListCompanies handles GET /api/v1/companies
func (h *CompanyHandler) ListCompanies(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	companies, err := h.svc.ListCompanies(r.Context(), query)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	json.NewEncoder(w).Encode(map[string]any{
		"data": companies,
	})
}

// GetCompany handles GET /api/v1/companies/{slug}
func (h *CompanyHandler) GetCompany(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	company, jobs, err := h.svc.GetCompany(r.Context(), slug)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	if company == nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	json.NewEncoder(w).Encode(map[string]any{
		"company": company,
		"jobs":    jobs,
	})
}
