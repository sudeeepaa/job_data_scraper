package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/samuelshine/job-data-scraper/internal/api/middleware"
	"github.com/samuelshine/job-data-scraper/internal/domain"
	"github.com/samuelshine/job-data-scraper/internal/repository"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

// AuthHandler handles authentication endpoints.
type AuthHandler struct {
	authService *service.AuthService
	userRepo    *repository.UserRepo
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(authService *service.AuthService, userRepo *repository.UserRepo) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userRepo:    userRepo,
	}
}

// Register handles user registration.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req domain.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.authService.Register(r.Context(), req)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, service.ErrEmailTaken) {
			status = http.StatusConflict
		} else if errors.Is(err, service.ErrInvalidEmail) || errors.Is(err, service.ErrWeakPassword) {
			status = http.StatusBadRequest
		}
		writeError(w, status, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, resp)
}

// Login handles user login.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req domain.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.authService.Login(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			writeError(w, http.StatusUnauthorized, "invalid email or password")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// GetProfile returns the authenticated user's profile.
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	user, err := h.authService.GetUserByID(r.Context(), userID)
	if err != nil || user == nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// GetSavedJobs returns the user's bookmarked jobs.
func (h *AuthHandler) GetSavedJobs(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	jobs, err := h.userRepo.GetSavedJobs(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get saved jobs")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"data": jobs})
}

// SaveJob bookmarks a job for the authenticated user.
func (h *AuthHandler) SaveJob(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	jobID := chi.URLParam(r, "id")
	if jobID == "" {
		writeError(w, http.StatusBadRequest, "job ID required")
		return
	}

	if err := h.userRepo.SaveJob(r.Context(), userID, jobID); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save job")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "job saved"})
}

// UnsaveJob removes a bookmark for the authenticated user.
func (h *AuthHandler) UnsaveJob(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	jobID := chi.URLParam(r, "id")
	if jobID == "" {
		writeError(w, http.StatusBadRequest, "job ID required")
		return
	}

	if err := h.userRepo.UnsaveJob(r.Context(), userID, jobID); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to unsave job")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "job unsaved"})
}

// writeJSON is a helper for consistent JSON responses.
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
