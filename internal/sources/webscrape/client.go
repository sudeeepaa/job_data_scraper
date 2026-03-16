package webscrape

import (
	"context"
	"fmt"
	"html"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/samuelshine/job-data-scraper/internal/domain"
	sourceutil "github.com/samuelshine/job-data-scraper/internal/sources"
)

var (
	linkedinCardRe     = regexp.MustCompile(`(?is)<li[^>]*>\s*(.*?)\s*</li>`)
	linkedinHrefRe     = regexp.MustCompile(`href="([^"]*linkedin\.com/jobs/view/[^"]+|[^"]*/jobs/view/[^"]+)"`)
	linkedinTitleRe    = regexp.MustCompile(`(?is)<h3[^>]*base-search-card__title[^>]*>(.*?)</h3>`)
	linkedinCompanyRe  = regexp.MustCompile(`(?is)<h4[^>]*base-search-card__subtitle[^>]*>(.*?)</h4>`)
	linkedinLocationRe = regexp.MustCompile(`(?is)<span[^>]*job-search-card__location[^>]*>(.*?)</span>`)
	linkedinTimeRe     = regexp.MustCompile(`datetime="([^"]+)"`)

	indeedCardRe     = regexp.MustCompile(`(?is)<div[^>]+class="[^"]*(?:job_seen_beacon|slider_container)[^"]*"[^>]*>(.*?)</table>`)
	indeedHrefRe     = regexp.MustCompile(`href="(/(?:rc/clk|viewjob)[^"]+|https://www\.indeed\.com/[^"]+)"`)
	indeedTitleRe    = regexp.MustCompile(`(?is)(?:title="([^"]+)"|<span[^>]*title="([^"]+)"[^>]*>)`)
	indeedCompanyRe  = regexp.MustCompile(`(?is)<span[^>]*(?:data-testid="company-name"|class="companyName")[^>]*>(.*?)</span>`)
	indeedLocationRe = regexp.MustCompile(`(?is)<div[^>]*(?:data-testid="text-location"|class="companyLocation")[^>]*>(.*?)</div>`)
)

type parser func(body string) []domain.Job

type Client struct {
	name       string
	httpClient *http.Client
	buildURL   func(query string, page int) string
	parse      parser
}

// New creates an experimental built-in HTML scraper for a supported provider.
func New(provider string) (*Client, error) {
	switch strings.ToLower(strings.TrimSpace(provider)) {
	case "linkedin":
		return &Client{
			name:       "linkedin",
			httpClient: newHTTPClient(),
			buildURL:   buildLinkedInURL,
			parse:      parseLinkedInJobs,
		}, nil
	case "indeed":
		return &Client{
			name:       "indeed",
			httpClient: newHTTPClient(),
			buildURL:   buildIndeedURL,
			parse:      parseIndeedJobs,
		}, nil
	default:
		return nil, fmt.Errorf("unsupported provider %q", provider)
	}
}

func (c *Client) Name() string {
	return c.name
}

func (c *Client) Search(ctx context.Context, query, _ string, page int) ([]domain.Job, error) {
	if strings.TrimSpace(query) == "" {
		return nil, nil
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.buildURL(query, page), nil)
	if err != nil {
		return nil, fmt.Errorf("%s scrape: create request: %w", c.name, err)
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%s scrape: request failed: %w", c.name, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%s scrape: returned status %d", c.name, resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("%s scrape: read response: %w", c.name, err)
	}

	jobs := c.parse(string(body))
	if len(jobs) == 0 {
		return nil, fmt.Errorf("%s scrape: no parseable jobs found", c.name)
	}

	return jobs, nil
}

func newHTTPClient() *http.Client {
	return &http.Client{Timeout: 20 * time.Second}
}

func buildLinkedInURL(query string, page int) string {
	values := url.Values{}
	values.Set("keywords", query)
	values.Set("start", fmt.Sprintf("%d", max(page-1, 0)*25))
	return "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?" + values.Encode()
}

func buildIndeedURL(query string, page int) string {
	values := url.Values{}
	values.Set("q", query)
	values.Set("start", fmt.Sprintf("%d", max(page-1, 0)*10))
	return "https://www.indeed.com/jobs?" + values.Encode()
}

func parseLinkedInJobs(body string) []domain.Job {
	matches := linkedinCardRe.FindAllStringSubmatch(body, -1)
	jobs := make([]domain.Job, 0, len(matches))

	for _, match := range matches {
		card := match[1]
		href := firstGroup(linkedinHrefRe, card)
		title := cleanText(firstGroup(linkedinTitleRe, card))
		company := cleanText(firstGroup(linkedinCompanyRe, card))
		location := cleanText(firstGroup(linkedinLocationRe, card))

		if href == "" || title == "" || company == "" {
			continue
		}

		postedAt := parsePublishedAt(firstGroup(linkedinTimeRe, card))
		jobs = append(jobs, buildJob("linkedin", href, title, company, location, postedAt))
	}

	return jobs
}

func parseIndeedJobs(body string) []domain.Job {
	matches := indeedCardRe.FindAllStringSubmatch(body, -1)
	jobs := make([]domain.Job, 0, len(matches))

	for _, match := range matches {
		card := match[1]
		href := firstGroup(indeedHrefRe, card)
		title := cleanText(firstNonEmptyGroups(indeedTitleRe, card))
		company := cleanText(firstGroup(indeedCompanyRe, card))
		location := cleanText(firstGroup(indeedLocationRe, card))

		if href == "" || title == "" || company == "" {
			continue
		}

		if strings.HasPrefix(href, "/") {
			href = "https://www.indeed.com" + href
		}

		jobs = append(jobs, buildJob("indeed", href, title, company, location, time.Time{}))
	}

	return jobs
}

func buildJob(source, sourceURL, title, company, location string, postedAt time.Time) domain.Job {
	if postedAt.IsZero() {
		postedAt = time.Now()
	}

	return domain.Job{
		ID:             sourceutil.StableJobID(source, "", title, company, sourceURL),
		Title:          title,
		Company:        company,
		CompanySlug:    slugify(company),
		Location:       location,
		PostedAt:       postedAt,
		Source:         source,
		SourceURL:      sourceURL,
		Skills:         domain.StringSlice{},
		EmploymentType: "full-time",
	}
}

func cleanText(raw string) string {
	if raw == "" {
		return ""
	}

	raw = html.UnescapeString(raw)
	tagRe := regexp.MustCompile(`(?is)<[^>]+>`)
	raw = tagRe.ReplaceAllString(raw, " ")
	raw = strings.ReplaceAll(raw, "\u00a0", " ")
	raw = strings.Join(strings.Fields(strings.TrimSpace(raw)), " ")
	return raw
}

func parsePublishedAt(raw string) time.Time {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return time.Time{}
	}

	if t, err := time.Parse(time.RFC3339, raw); err == nil {
		return t
	}

	if t, err := time.Parse("2006-01-02", raw); err == nil {
		return t
	}

	return time.Time{}
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

func firstGroup(re *regexp.Regexp, input string) string {
	match := re.FindStringSubmatch(input)
	if len(match) < 2 {
		return ""
	}
	return match[1]
}

func firstNonEmptyGroups(re *regexp.Regexp, input string) string {
	match := re.FindStringSubmatch(input)
	for _, item := range match[1:] {
		if strings.TrimSpace(item) != "" {
			return item
		}
	}
	return ""
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
