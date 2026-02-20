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
	"github.com/samuelshine/job-data-scraper/internal/sources"
	"github.com/samuelshine/job-data-scraper/internal/sources/adzuna"
	"github.com/samuelshine/job-data-scraper/internal/sources/jsearch"
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

	// Build job source clients (conditional on API keys)
	var srcs []sources.JobSource

	if cfg.JSearchAPIKey != "" {
		srcs = append(srcs, jsearch.New(cfg.JSearchAPIKey))
		log.Printf("✅ JSearch source enabled")
	} else {
		log.Printf("⚠️  JSEARCH_API_KEY not set — JSearch source disabled")
	}

	if cfg.AdzunaAppID != "" && cfg.AdzunaAppKey != "" {
		srcs = append(srcs, adzuna.New(cfg.AdzunaAppID, cfg.AdzunaAppKey))
		log.Printf("✅ Adzuna source enabled")
	} else {
		log.Printf("⚠️  ADZUNA_APP_ID/KEY not set — Adzuna source disabled")
	}

	// Build aggregator (nil if no sources)
	var aggregator *service.Aggregator
	if len(srcs) > 0 {
		aggregator = service.NewAggregator(srcs, jobRepo, cacheRepo, cfg.CacheTTL)
		log.Printf("🔍 Aggregator enabled with %d source(s)", len(srcs))
	} else {
		log.Printf("📦 No API keys configured — using seed data only")
	}

	// Initialize services
	jobService := service.NewJobService(jobRepo, userRepo, cacheRepo, aggregator)
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
