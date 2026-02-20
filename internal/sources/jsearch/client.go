package jsearch

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

const (
	baseURL = "https://jsearch.p.rapidapi.com"
	host    = "jsearch.p.rapidapi.com"
)

// Client is a JSearch API client.
type Client struct {
	httpClient *http.Client
	apiKey     string
}

// New creates a new JSearch client.
func New(apiKey string) *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 15 * time.Second},
		apiKey:     apiKey,
	}
}

// Name returns the source identifier.
func (c *Client) Name() string {
	return "jsearch"
}

// Search fetches jobs from JSearch API.
func (c *Client) Search(ctx context.Context, query, location string, page int) ([]domain.Job, error) {
	// Build search query
	q := query
	if location != "" {
		q = fmt.Sprintf("%s in %s", query, location)
	}

	params := url.Values{}
	params.Set("query", q)
	params.Set("page", fmt.Sprintf("%d", page))
	params.Set("num_pages", "1")

	reqURL := fmt.Sprintf("%s/search?%s", baseURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("jsearch: failed to create request: %w", err)
	}

	req.Header.Set("X-RapidAPI-Key", c.apiKey)
	req.Header.Set("X-RapidAPI-Host", host)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("jsearch: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("jsearch: API returned status %d", resp.StatusCode)
	}

	var result searchResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("jsearch: failed to decode response: %w", err)
	}

	if result.Status != "OK" {
		return nil, fmt.Errorf("jsearch: API returned status %s", result.Status)
	}

	jobs := make([]domain.Job, 0, len(result.Data))
	for _, jr := range result.Data {
		jobs = append(jobs, normalize(jr))
	}

	return jobs, nil
}

func normalize(jr jobResult) domain.Job {
	// Build location string
	loc := buildLocation(jr.JobCity, jr.JobState, jr.JobCountry)

	// Salary
	var salaryMin, salaryMax *int
	if jr.JobMinSalary != nil {
		v := int(*jr.JobMinSalary)
		salaryMin = &v
	}
	if jr.JobMaxSalary != nil {
		v := int(*jr.JobMaxSalary)
		salaryMax = &v
	}

	currency := jr.JobSalaryCurrency
	if currency == "" {
		currency = "USD"
	}

	// Employment type normalization
	empType := normalizeEmploymentType(jr.JobEmploymentType)

	// Skills
	skills := jr.JobRequiredSkills
	if len(skills) == 0 {
		skills = extractBasicSkills(jr.JobDescription)
	}

	// Apply link
	applyLink := jr.JobApplyLink
	if applyLink == "" && len(jr.ApplyOptions) > 0 {
		applyLink = jr.ApplyOptions[0].ApplyLink
	}

	return domain.Job{
		ID:              uuid.New().String(),
		ExternalID:      jr.JobID,
		Title:           jr.JobTitle,
		Description:     jr.JobDescription,
		Company:         jr.EmployerName,
		CompanySlug:     slugify(jr.EmployerName),
		Location:        loc,
		SalaryMin:       salaryMin,
		SalaryMax:       salaryMax,
		SalaryCurrency:  currency,
		PostedAt:        jr.postedAt(),
		Source:          "jsearch",
		SourceURL:       applyLink,
		Skills:          domain.StringSlice(skills),
		IsRemote:        jr.JobIsRemote || isRemoteLocation(loc),
		EmploymentType:  empType,
		ExperienceLevel: "", // JSearch doesn't provide this directly
	}
}

func buildLocation(city, state, country string) string {
	parts := []string{}
	if city != "" {
		parts = append(parts, city)
	}
	if state != "" {
		parts = append(parts, state)
	}
	if len(parts) == 0 && country != "" {
		parts = append(parts, country)
	}
	if len(parts) == 0 {
		return "Remote"
	}
	return strings.Join(parts, ", ")
}

func normalizeEmploymentType(raw string) string {
	switch strings.ToUpper(raw) {
	case "FULLTIME":
		return "full-time"
	case "PARTTIME":
		return "part-time"
	case "CONTRACTOR", "CONTRACT":
		return "contract"
	case "INTERN":
		return "internship"
	default:
		return "full-time"
	}
}

func isRemoteLocation(loc string) bool {
	lower := strings.ToLower(loc)
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
	// Collapse multiple dashes
	for strings.Contains(s, "--") {
		s = strings.ReplaceAll(s, "--", "-")
	}
	return strings.Trim(s, "-")
}

// extractBasicSkills does naive keyword matching for common tech skills.
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
