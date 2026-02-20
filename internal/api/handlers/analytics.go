package handlers

import (
	"net/http"
	"strconv"

	"github.com/samuelshine/job-data-scraper/internal/service"
)

// AnalyticsHandler handles HTTP requests for analytics endpoints.
type AnalyticsHandler struct {
	svc *service.JobService
}

// NewAnalyticsHandler creates a new AnalyticsHandler.
func NewAnalyticsHandler(svc *service.JobService) *AnalyticsHandler {
	return &AnalyticsHandler{svc: svc}
}

// GetTopSkills returns the most common skills.
func (h *AnalyticsHandler) GetTopSkills(w http.ResponseWriter, r *http.Request) {
	limit := 10
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	skills, err := h.svc.GetTopSkills(r.Context(), limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get skills"})
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=600")
	writeJSON(w, http.StatusOK, map[string]interface{}{"data": skills})
}

// GetSummary returns analytics summary.
func (h *AnalyticsHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.svc.GetAnalyticsSummary(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get summary"})
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=300")
	writeJSON(w, http.StatusOK, summary)
}
