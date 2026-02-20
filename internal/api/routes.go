package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/samuelshine/job-data-scraper/internal/api/handlers"
	"github.com/samuelshine/job-data-scraper/internal/api/middleware"
)

// RouterConfig holds all dependencies needed for the router.
type RouterConfig struct {
	JobHandler       *handlers.JobHandler
	CompanyHandler   *handlers.CompanyHandler
	AnalyticsHandler *handlers.AnalyticsHandler
	AuthHandler      *handlers.AuthHandler
	JWTSecret        string
	CORSOrigins      []string
}

// NewRouter creates the HTTP router with all routes.
func NewRouter(cfg RouterConfig) *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Compress(5))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// API docs (Swagger UI)
	r.Get("/docs", DocsHandler())
	r.Get("/openapi.json", OpenAPIHandler())

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		// Public auth routes
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", cfg.AuthHandler.Register)
			r.Post("/login", cfg.AuthHandler.Login)
		})

		// Jobs (public, with optional auth for saved status)
		r.Route("/jobs", func(r chi.Router) {
			r.Use(middleware.OptionalAuthMiddleware(cfg.JWTSecret))
			r.Get("/", cfg.JobHandler.ListJobs)
			r.Get("/{id}", cfg.JobHandler.GetJob)
		})

		// Companies (public)
		r.Route("/companies", func(r chi.Router) {
			r.Get("/", cfg.CompanyHandler.ListCompanies)
			r.Get("/{slug}", cfg.CompanyHandler.GetCompany)
		})

		// Analytics (public)
		r.Route("/analytics", func(r chi.Router) {
			r.Get("/skills", cfg.AnalyticsHandler.GetTopSkills)
			r.Get("/summary", cfg.AnalyticsHandler.GetSummary)
			r.Get("/trends", cfg.AnalyticsHandler.GetMarketTrends)
			r.Get("/sources", cfg.AnalyticsHandler.GetSourceDistribution)
			r.Get("/salary", cfg.AnalyticsHandler.GetSalaryStats)
			r.Post("/refresh", cfg.AnalyticsHandler.RefreshTrends)
		})

		// Filters (public)
		r.Get("/filters", cfg.JobHandler.GetFilters)

		// Protected user routes
		r.Route("/me", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Get("/", cfg.AuthHandler.GetProfile)
			r.Get("/saved-jobs", cfg.AuthHandler.GetSavedJobs)
			r.Post("/saved-jobs/{id}", cfg.AuthHandler.SaveJob)
			r.Delete("/saved-jobs/{id}", cfg.AuthHandler.UnsaveJob)
		})
	})

	return r
}
