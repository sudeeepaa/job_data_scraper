package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/samuelshine/job-data-scraper/internal/api/middleware"
	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

type ApplicationHandler struct {
	svc *service.ApplicationService
}

func NewApplicationHandler(svc *service.ApplicationService) *ApplicationHandler {
	return &ApplicationHandler{svc: svc}
}

func (h *ApplicationHandler) ListApplications(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	apps, err := h.svc.ListApplications(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list applications")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"data": apps})
}

func (h *ApplicationHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req domain.ApplicationCreate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	app, err := h.svc.CreateApplication(r.Context(), userID, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create application")
		return
	}

	writeJSON(w, http.StatusCreated, app)
}

func (h *ApplicationHandler) UpdateApplication(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	var req domain.ApplicationUpdate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	app, err := h.svc.UpdateApplication(r.Context(), id, userID, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update application")
		return
	}
	if app == nil {
		writeError(w, http.StatusNotFound, "application not found")
		return
	}

	writeJSON(w, http.StatusOK, app)
}

func (h *ApplicationHandler) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteApplication(r.Context(), id, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete application")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
