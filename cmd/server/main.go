package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/samuelshine/job-data-scraper/internal/api"
	"github.com/samuelshine/job-data-scraper/internal/api/handlers"
	"github.com/samuelshine/job-data-scraper/internal/repository"
	"github.com/samuelshine/job-data-scraper/internal/service"
)

func main() {
	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize layers
	repo := repository.NewJobRepository()
	svc := service.NewJobService(repo)

	// Initialize handlers
	jobHandler := handlers.NewJobHandler(svc)
	companyHandler := handlers.NewCompanyHandler(svc)
	analyticsHandler := handlers.NewAnalyticsHandler(svc)

	// Create router
	router := api.NewRouter(jobHandler, companyHandler, analyticsHandler)

	// Start server
	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 Starting Job Data API server on http://localhost%s", addr)
	log.Printf("📚 API docs: http://localhost%s/api/v1/jobs", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
