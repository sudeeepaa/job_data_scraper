package scrapebridge

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/domain"
	sourceutil "github.com/samuelshine/job-data-scraper/internal/sources"
)

// Client delegates scraping to an external worker or provider.
// This keeps the API server simple while still allowing LinkedIn/Indeed-style
// ingestion through a controlled bridge endpoint.
type Client struct {
	httpClient *http.Client
	url        string
	token      string
	sources    []string
}

// New creates a new scraper bridge client.
func New(url, token string, sources []string) *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 30 * time.Second},
		url:        strings.TrimSpace(url),
		token:      strings.TrimSpace(token),
		sources:    append([]string(nil), sources...),
	}
}

// Name returns the source identifier.
func (c *Client) Name() string {
	return "scrape_bridge"
}

// Search fetches jobs from the configured external scraping bridge.
func (c *Client) Search(ctx context.Context, query, location string, page int) ([]domain.Job, error) {
	if c.url == "" {
		return nil, fmt.Errorf("scrape bridge: URL is empty")
	}

	payload := searchRequest{
		Query:    query,
		Location: location,
		Page:     page,
		Sources:  c.sources,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("scrape bridge: marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("scrape bridge: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("scrape bridge: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("scrape bridge: provider returned status %d", resp.StatusCode)
	}

	var result searchResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("scrape bridge: decode response: %w", err)
	}

	jobs := make([]domain.Job, 0, len(result.Jobs))
	for _, raw := range result.Jobs {
		jobs = append(jobs, normalize(raw))
	}

	return jobs, nil
}

func normalize(raw bridgeJob) domain.Job {
	source := strings.TrimSpace(raw.Source)
	if source == "" {
		source = "scrape"
	}

	company := strings.TrimSpace(raw.Company)
	if company == "" {
		company = "Unknown Company"
	}

	currency := strings.TrimSpace(raw.SalaryCurrency)
	if currency == "" {
		currency = "USD"
	}

	return domain.Job{
		ID:              sourceutil.StableJobID(source, raw.ExternalID, raw.Title, company, raw.SourceURL),
		ExternalID:      strings.TrimSpace(raw.ExternalID),
		Title:           strings.TrimSpace(raw.Title),
		Description:     strings.TrimSpace(raw.Description),
		Company:         company,
		CompanySlug:     slugify(company),
		Location:        strings.TrimSpace(raw.Location),
		SalaryMin:       raw.SalaryMin,
		SalaryMax:       raw.SalaryMax,
		SalaryCurrency:  currency,
		PostedAt:        raw.PostedAt,
		Source:          source,
		SourceURL:       strings.TrimSpace(raw.SourceURL),
		Skills:          domain.StringSlice(raw.Skills),
		IsRemote:        raw.IsRemote,
		EmploymentType:  normalizeEmploymentType(raw.EmploymentType),
		ExperienceLevel: strings.TrimSpace(raw.ExperienceLevel),
	}
}

func normalizeEmploymentType(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "full-time", "full_time", "fulltime":
		return "full-time"
	case "part-time", "part_time", "parttime":
		return "part-time"
	case "contract", "contractor":
		return "contract"
	case "internship", "intern":
		return "internship"
	default:
		return "full-time"
	}
}

func slugify(name string) string {
	s := strings.ToLower(strings.TrimSpace(name))
	s = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
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
