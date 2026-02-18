package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/samuelshine/job-data-scraper/internal/service"
)

// AnalyticsHandler handles analytics-related HTTP requests
type AnalyticsHandler struct {
	svc *service.JobService
}

// NewAnalyticsHandler creates a new analytics handler
func NewAnalyticsHandler(svc *service.JobService) *AnalyticsHandler {
	return &AnalyticsHandler{svc: svc}
}

// GetTopSkills handles GET /api/v1/analytics/skills
func (h *AnalyticsHandler) GetTopSkills(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 {
		limit = 20
	}

	skills := h.svc.GetTopSkills(r.Context(), limit)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=900")

	json.NewEncoder(w).Encode(map[string]any{
		"data": skills,
	})
}

// GetSummary handles GET /api/v1/analytics/summary
func (h *AnalyticsHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	summary := h.svc.GetAnalyticsSummary(r.Context())

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=900")

	json.NewEncoder(w).Encode(summary)
}
