package adzuna

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

const baseURL = "https://api.adzuna.com/v1/api/jobs"

// Client is an Adzuna API client.
type Client struct {
	httpClient *http.Client
	appID      string
	appKey     string
	country    string
}

// New creates a new Adzuna client.
func New(appID, appKey string) *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 15 * time.Second},
		appID:      appID,
		appKey:     appKey,
		country:    "us",
	}
}

// Name returns the source identifier.
func (c *Client) Name() string {
	return "adzuna"
}

// Search fetches jobs from Adzuna API.
func (c *Client) Search(ctx context.Context, query, location string, page int) ([]domain.Job, error) {
	if page < 1 {
		page = 1
	}

	params := url.Values{}
	params.Set("app_id", c.appID)
	params.Set("app_key", c.appKey)
	params.Set("what", query)
	params.Set("results_per_page", "10")
	params.Set("content-type", "application/json")

	if location != "" {
		params.Set("where", location)
	}

	reqURL := fmt.Sprintf("%s/%s/search/%d?%s", baseURL, c.country, page, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("adzuna: failed to create request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("adzuna: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("adzuna: API returned status %d", resp.StatusCode)
	}

	var result searchResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("adzuna: failed to decode response: %w", err)
	}

	jobs := make([]domain.Job, 0, len(result.Results))
	for _, jr := range result.Results {
		jobs = append(jobs, normalize(jr))
	}

	return jobs, nil
}

func normalize(jr jobResult) domain.Job {
	// Salary
	var salaryMin, salaryMax *int
	if jr.SalaryMin != nil {
		v := int(*jr.SalaryMin)
		salaryMin = &v
	}
	if jr.SalaryMax != nil {
		v := int(*jr.SalaryMax)
		salaryMax = &v
	}

	// Employment type
	empType := normalizeContractTime(jr.ContractTime)

	// Location
	loc := jr.Location.DisplayName
	if loc == "" && len(jr.Location.Area) > 0 {
		loc = strings.Join(jr.Location.Area, ", ")
	}

	// Skills from description
	skills := extractBasicSkills(jr.Description)

	return domain.Job{
		ID:              uuid.New().String(),
		ExternalID:      fmt.Sprintf("%d", jr.ID),
		Title:           jr.Title,
		Description:     jr.Description,
		Company:         jr.Company.DisplayName,
		CompanySlug:     slugify(jr.Company.DisplayName),
		Location:        loc,
		SalaryMin:       salaryMin,
		SalaryMax:       salaryMax,
		SalaryCurrency:  "USD",
		PostedAt:        jr.postedAt(),
		Source:          "adzuna",
		SourceURL:       jr.RedirectURL,
		Skills:          domain.StringSlice(skills),
		IsRemote:        isRemoteLocation(loc, jr.Title),
		EmploymentType:  empType,
		ExperienceLevel: "",
	}
}

func normalizeContractTime(raw string) string {
	switch strings.ToLower(raw) {
	case "full_time":
		return "full-time"
	case "part_time":
		return "part-time"
	case "contract":
		return "contract"
	default:
		return "full-time"
	}
}

func isRemoteLocation(loc, title string) bool {
	lower := strings.ToLower(loc + " " + title)
	return strings.Contains(lower, "remote") || strings.Contains(lower, "anywhere")
}

func slugify(name string) string {
	s := strings.ToLower(strings.TrimSpace(name))
	s = strings.Map(func(r rune) rune {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' {
			return r
		}
		if r == ' ' || r == '-' || r == '_' {
			return '-'
		}
		return -1
	}, s)
	for strings.Contains(s, "--") {
		s = strings.ReplaceAll(s, "--", "-")
	}
	return strings.Trim(s, "-")
}

func extractBasicSkills(description string) []string {
	if description == "" {
		return nil
	}
	lower := strings.ToLower(description)
	known := []string{
		"Go", "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Ruby", "Swift", "Kotlin",
		"React", "Angular", "Vue.js", "Node.js", "Django", "Flask", "Spring",
		"AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
		"PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
		"Git", "Linux", "REST", "GraphQL", "gRPC",
		"Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
		"CI/CD", "Agile", "Scrum",
	}
	found := []string{}
	seen := map[string]bool{}
	for _, skill := range known {
		if strings.Contains(lower, strings.ToLower(skill)) && !seen[skill] {
			found = append(found, skill)
			seen[skill] = true
		}
	}
	if len(found) > 8 {
		found = found[:8]
	}
	return found
}
