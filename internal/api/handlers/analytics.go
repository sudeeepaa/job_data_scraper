package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/samuelshine/job-data-scraper/internal/service"
	"github.com/go-chi/chi/v5"
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
		writeError(w, http.StatusInternalServerError, "failed to get skills")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=600")
	writeJSON(w, http.StatusOK, map[string]interface{}{"data": skills})
}

// GetSummary returns analytics summary.
func (h *AnalyticsHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.svc.GetAnalyticsSummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get summary")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=300")
	writeJSON(w, http.StatusOK, summary)
}

// GetMarketTrends returns the latest market trend snapshot.
func (h *AnalyticsHandler) GetMarketTrends(w http.ResponseWriter, r *http.Request) {
	limit := 10
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	trends, err := h.svc.GetMarketTrends(r.Context(), limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get trends")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=900")
	writeJSON(w, http.StatusOK, map[string]interface{}{"data": trends})
}

// GetSourceDistribution returns job counts per source.
func (h *AnalyticsHandler) GetSourceDistribution(w http.ResponseWriter, r *http.Request) {
	dist, err := h.svc.GetSourceDistribution(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get source distribution")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=900")
	writeJSON(w, http.StatusOK, map[string]interface{}{"data": dist})
}

// GetSalaryStats returns aggregate salary statistics.
func (h *AnalyticsHandler) GetSalaryStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.svc.GetSalaryStats(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get salary stats")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=900")
	writeJSON(w, http.StatusOK, stats)
}

// RefreshTrends triggers recomputation of market trend snapshots.
func (h *AnalyticsHandler) RefreshTrends(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.RefreshTrends(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to refresh trends")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "trends refreshed"})
}

// GetSourceHealth returns the latest health and fetch status for configured sources.
func (h *AnalyticsHandler) GetSourceHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"data": h.svc.GetSourceHealth(r.Context()),
	})
}

// ScrapeSource triggers a manual fetch for a single source.
func (h *AnalyticsHandler) ScrapeSource(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "source")
	if name == "" {
		writeError(w, http.StatusBadRequest, "source name required")
		return
	}

	jobs, err := h.svc.ScrapeSource(r.Context(), name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message":   fmt.Sprintf("Successfully scraped %s", name),
		"jobsFound": len(jobs),
	})
}
