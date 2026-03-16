package webscrape

import "testing"

func TestParseLinkedInJobs(t *testing.T) {
	body := `
<ul>
  <li>
    <div class="base-search-card">
      <a href="https://www.linkedin.com/jobs/view/123">
        <h3 class="base-search-card__title">Machine Learning Engineer</h3>
      </a>
      <h4 class="base-search-card__subtitle"><a>OpenAI</a></h4>
      <span class="job-search-card__location">Bengaluru, India</span>
      <time datetime="2026-03-16"></time>
    </div>
  </li>
</ul>`

	jobs := parseLinkedInJobs(body)
	if len(jobs) != 1 {
		t.Fatalf("expected 1 job, got %d", len(jobs))
	}

	if jobs[0].Title != "Machine Learning Engineer" {
		t.Fatalf("expected title to be parsed, got %q", jobs[0].Title)
	}

	if jobs[0].Company != "OpenAI" {
		t.Fatalf("expected company to be parsed, got %q", jobs[0].Company)
	}
}

func TestParseIndeedJobs(t *testing.T) {
	body := `
<div class="job_seen_beacon">
  <table>
    <tr>
      <td>
        <a data-jk="abc123" href="/viewjob?jk=abc123" title="Staff Backend Engineer"></a>
        <span data-testid="company-name">Acme Corp</span>
        <div data-testid="text-location">Remote</div>
      </td>
    </tr>
  </table>
</div>`

	jobs := parseIndeedJobs(body)
	if len(jobs) != 1 {
		t.Fatalf("expected 1 job, got %d", len(jobs))
	}

	if jobs[0].Title != "Staff Backend Engineer" {
		t.Fatalf("expected title to be parsed, got %q", jobs[0].Title)
	}

	if jobs[0].Source != "indeed" {
		t.Fatalf("expected source to be indeed, got %q", jobs[0].Source)
	}
}
