package scraper

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

var techKeywords = []string{
	"Go", "Golang", "Python", "JavaScript", "TypeScript", "React", "Vue", "Angular",
	"Node.js", "Java", "Kotlin", "Swift", "Ruby", "PHP", "C++", "C#", "Rust", "Scala",
	"Docker", "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MySQL", "MongoDB",
	"Redis", "GraphQL", "REST", "gRPC", "Terraform", "Linux", "Git", "CI/CD",
	"Machine Learning", "ML", "AI", "Data Science", "Spark", "Kafka", "Elasticsearch",
}

// ExtractSkills matches text against a list of known tech keywords.
func ExtractSkills(text string) []string {
	matched := make(map[string]bool)
	lowerText := strings.ToLower(text)

	for _, kw := range techKeywords {
		// Simple case-insensitive match. 
		// For more accuracy, we could use word boundary regex, 
		// but simple contains is often enough for job descriptions.
		if strings.Contains(lowerText, strings.ToLower(kw)) {
			// Normalize variant: Golang -> Go
			if kw == "Golang" {
				matched["Go"] = true
			} else {
				matched[kw] = true
			}
		}
	}

	skills := make([]string, 0, len(matched))
	for s := range matched {
		skills = append(skills, s)
	}
	return skills
}

// StripHTML removes all HTML tags and returns clean plain text, preserving structure.
func StripHTML(htmlContent string) string {
	// Pre-process common block elements to preserve newlines
	s := strings.ReplaceAll(htmlContent, "<p>", "\n\n")
	s = strings.ReplaceAll(s, "</p>", "")
	s = strings.ReplaceAll(s, "<br>", "\n")
	s = strings.ReplaceAll(s, "<br/>", "\n")
	s = strings.ReplaceAll(s, "<br />", "\n")

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(s))
	if err != nil {
		// Fallback to simple regex if goquery fails
		re := regexp.MustCompile(`<[^>]*>`)
		return strings.TrimSpace(re.ReplaceAllString(s, " "))
	}
	return strings.TrimSpace(doc.Text())
}

// ParseSalary extracts min and max salary from typical strings.
func ParseSalary(salaryStr string) (min, max int) {
	if salaryStr == "" {
		return 0, 0
	}

	// Remove currency symbols, commas, and "k" suffixes
	clean := strings.ToLower(salaryStr)
	clean = strings.ReplaceAll(clean, "$", "")
	clean = strings.ReplaceAll(clean, "€", "")
	clean = strings.ReplaceAll(clean, "£", "")
	clean = strings.ReplaceAll(clean, ",", "")

	// Handle "k" suffix (80k -> 80000)
	hasK := strings.Contains(clean, "k")
	clean = strings.ReplaceAll(clean, "k", "")

	// Find all numbers
	re := regexp.MustCompile(`\d+`)
	matches := re.FindAllString(clean, -1)

	if len(matches) == 0 {
		return 0, 0
	}

	var nums []int
	for _, m := range matches {
		var n int
		_, err := fmt.Sscanf(m, "%d", &n)
		if err == nil {
			if hasK {
				n *= 1000
			}
			nums = append(nums, n)
		}
	}

	if len(nums) == 1 {
		return nums[0], nums[0]
	}
	if len(nums) >= 2 {
		return nums[0], nums[1]
	}

	return 0, 0
}

// NormalizeLocation maps variations of "Remote" and keeps city names.
func NormalizeLocation(loc string) string {
	l := strings.ToLower(strings.TrimSpace(loc))
	if l == "" {
		return "Remote"
	}
	if strings.Contains(l, "remote") || strings.Contains(l, "worldwide") || strings.Contains(l, "anywhere") {
		return "Remote"
	}
	return strings.TrimSpace(loc)
}

// Slugify creates a URL-friendly version of a string.
func Slugify(s string) string {
	res := strings.ToLower(strings.TrimSpace(s))
	res = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		if r == ' ' || r == '-' || r == '_' {
			return '-'
		}
		return -1
	}, res)
	for strings.Contains(res, "--") {
		res = strings.ReplaceAll(res, "--", "-")
	}
	return strings.Trim(res, "-")
}
// IsValidJobURL checks if a URL is likely a real job page vs social media/unrelated.
func IsValidJobURL(u string) bool {
	if u == "" {
		return false
	}
	if !strings.HasPrefix(u, "http") {
		return false
	}
	
	// Social media and other noise to ignore
	blacklisted := []string{
		"instagram.com", 
		"twitter.com", 
		"facebook.com", 
		"linkedin.com/in/", 
		"github.com/", 
		"t.co",
	}
	
    lowerURL := strings.ToLower(u)
	for _, pattern := range blacklisted {
		if strings.Contains(lowerURL, pattern) {
			return false
		}
	}
	
	return true
}
