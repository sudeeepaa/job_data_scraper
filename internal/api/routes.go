package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/samuelshine/job-data-scraper/internal/api/handlers"
)

// NewRouter creates the HTTP router with all routes
func NewRouter(
	jobHandler *handlers.JobHandler,
	companyHandler *handlers.CompanyHandler,
	analyticsHandler *handlers.AnalyticsHandler,
) *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4321", "http://localhost:3000", "https://*"},
		AllowedMethods:   []string{"GET", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		// Jobs
		r.Route("/jobs", func(r chi.Router) {
			r.Get("/", jobHandler.ListJobs)
			r.Get("/{id}", jobHandler.GetJob)
		})

		// Companies
		r.Route("/companies", func(r chi.Router) {
			r.Get("/", companyHandler.ListCompanies)
			r.Get("/{slug}", companyHandler.GetCompany)
		})

		// Analytics
		r.Route("/analytics", func(r chi.Router) {
			r.Get("/skills", analyticsHandler.GetTopSkills)
			r.Get("/summary", analyticsHandler.GetSummary)
		})

		// Filters
		r.Get("/filters", jobHandler.GetFilters)
	})

	return r
}
