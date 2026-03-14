package scrapebridge

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClientSearch(t *testing.T) {
	salaryMin := 120000
	salaryMax := 160000

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("method = %s, want POST", r.Method)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer token-123" {
			t.Fatalf("authorization header = %q", got)
		}

		var req searchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatalf("Decode request failed: %v", err)
		}
		if req.Query != "ml engineer" {
			t.Fatalf("query = %q, want ml engineer", req.Query)
		}

		_ = json.NewEncoder(w).Encode(searchResponse{
			Jobs: []bridgeJob{
				{
					ExternalID:     "li-1",
					Title:          "ML Engineer",
					Description:    "Build models",
					Company:        "LinkedIn Co",
					Location:       "Bengaluru, India",
					SalaryMin:      &salaryMin,
					SalaryMax:      &salaryMax,
					SalaryCurrency: "USD",
					Source:         "linkedin",
					SourceURL:      "https://linkedin.example/job/li-1",
					Skills:         []string{"Python", "PyTorch"},
					IsRemote:       true,
					EmploymentType: "full_time",
				},
			},
		})
	}))
	defer server.Close()

	client := New(server.URL, "token-123", []string{"linkedin", "indeed"})
	jobs, err := client.Search(context.Background(), "ml engineer", "India", 1)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(jobs) != 1 {
		t.Fatalf("len(jobs) = %d, want 1", len(jobs))
	}
	if jobs[0].Source != "linkedin" {
		t.Fatalf("jobs[0].Source = %q, want linkedin", jobs[0].Source)
	}
	if jobs[0].CompanySlug != "linkedin-co" {
		t.Fatalf("jobs[0].CompanySlug = %q, want linkedin-co", jobs[0].CompanySlug)
	}
}
