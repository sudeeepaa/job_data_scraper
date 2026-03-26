package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/scraper"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 40*time.Second)
	defer cancel()

	fmt.Println("--- Testing RemoteOK Scraper ---")
	rok := scraper.NewRemoteOKScraper()
	jobs, err := rok.Search(ctx, "software", "", 1)
	if err != nil {
		log.Printf("❌ RemoteOK failed: %v", err)
	} else {
		fmt.Printf("✅ RemoteOK returned %d jobs\n", len(jobs))
		if len(jobs) > 0 {
			fmt.Printf("Example job: %s at %s\n", jobs[0].Title, jobs[0].Company)
		}
	}

	fmt.Println("\n--- Testing Jobicy Scraper ---")
	jobicy := scraper.NewJobicyScraper()
	jobs, err = jobicy.Search(ctx, "software", "", 1)
	if err != nil {
		log.Printf("❌ Jobicy failed: %v", err)
	} else {
		fmt.Printf("✅ Jobicy returned %d jobs\n", len(jobs))
		if len(jobs) > 0 {
			fmt.Printf("Example job: %s at %s\n", jobs[0].Title, jobs[0].Company)
		}
	}
}
