package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/samuelshine/job-data-scraper/internal/api"
	"github.com/samuelshine/job-data-scraper/internal/api/handlers"
	"github.com/samuelshine/job-data-scraper/internal/config"
	"github.com/samuelshine/job-data-scraper/internal/database"
	"github.com/samuelshine/job-data-scraper/internal/repository"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := database.NewDatabase(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Seed database with initial data (idempotent)
	if err := repository.SeedDatabase(context.Background(), db); err != nil {
		log.Fatalf("❌ Failed to seed database: %v", err)
	}

	// Initialize repositories
	jobRepo := repository.NewJobRepo(db)
	userRepo := repository.NewUserRepo(db)
	cacheRepo := repository.NewCacheRepo(db)

	// Initialize services
	jobService := service.NewJobService(jobRepo, userRepo, cacheRepo)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)

	// Initialize handlers
	jobHandler := handlers.NewJobHandler(jobService)
	companyHandler := handlers.NewCompanyHandler(jobService)
	analyticsHandler := handlers.NewAnalyticsHandler(jobService)
	authHandler := handlers.NewAuthHandler(authService, userRepo)

	// Create router
	router := api.NewRouter(api.RouterConfig{
		JobHandler:       jobHandler,
		CompanyHandler:   companyHandler,
		AnalyticsHandler: analyticsHandler,
		AuthHandler:      authHandler,
		JWTSecret:        cfg.JWTSecret,
		CORSOrigins:      cfg.CORSOrigins,
	})

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 JobPulse API server starting on http://localhost%s", addr)
	log.Printf("📚 API: http://localhost%s/api/v1/jobs", addr)
	log.Printf("🔐 Auth: http://localhost%s/api/v1/auth/register", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("❌ Server failed: %v", err)
	}
}
