package main

import (
    "encoding/json"
    "fmt"
    "log"
    "os"
    "sort"

    "job-data-scraper/models"
    "job-data-scraper/scrapers"
    "job-data-scraper/normalizer"
    "job-data-scraper/matcher"
    "job-data-scraper/config"
)

func main() {
    // 1️⃣ Load candidate profile
    profile, err := loadProfile("config/profile.json")
    if err != nil {
        log.Fatalf("failed to load profile: %v", err)
    }

    // 2️⃣ Load scoring weights
    weights, err := config.LoadScoreWeights("config/weights.json")
    if err != nil {
        log.Fatalf("failed to load weights: %v", err)
    }

    // 3️⃣ Initialize scrapers
    scraperList := []scrapers.JobScraper{
        scrapers.NewIndeedScraper(),
        scrapers.NewCompanyScraper(),
    }

    // 4️⃣ Scrape jobs
    var rawJobs []models.RawJob
    for _, scraper := range scraperList {
        jobs, err := scraper.Scrape(profile)
        if err != nil {
            log.Printf("scraper %s failed: %v", scraper.SourceName(), err)
            continue
        }
        rawJobs = append(rawJobs, jobs...)
    }

    // 5️⃣ Normalize jobs
    jobs := normalizer.Normalize(rawJobs)

    // 6️⃣ Match & score jobs
    matches := matcher.MatchJobs(profile, jobs, weights)

    // 7️⃣ Sort by score
    sort.Slice(matches, func(i, j int) bool {
        return matches[i].Score > matches[j].Score
    })

    // 8️⃣ Output results
    printTopMatches(matches, 10)
}

func loadProfile(path string) (models.CandidateProfile, error) {
    file, err := os.ReadFile(path)
    if err != nil {
        return models.CandidateProfile{}, err
    }

    var profile models.CandidateProfile
    err = json.Unmarshal(file, &profile)
    return profile, err
}

func printTopMatches(matches []models.JobMatch, limit int) {
    fmt.Println("🔥 Best Job Matches:\n")

    for i, match := range matches {
        if i >= limit {
            break
        }

        fmt.Printf(
            "%d. %s at %s (Score: %.2f)\n"+
                "   Location: %s | Salary: ₹%d - ₹%d\n"+
                "   URL: %s\n\n",
            i+1,
            match.Job.Title,
            match.Job.Company,
            match.Score,
            match.Job.Location,
            match.Job.SalaryMin,
            match.Job.SalaryMax,
            match.Job.URL,
        )
    }
}
