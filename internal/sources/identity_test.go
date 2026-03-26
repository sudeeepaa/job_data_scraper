package sources

import "testing"

func TestStableJobID_UsesExternalIDDeterministically(t *testing.T) {
	first := StableJobID("jsearch", "external-123", "ignored")
	second := StableJobID("jsearch", "external-123", "different", "values")
	third := StableJobID("adzuna", "external-123")

	if first != second {
		t.Fatalf("expected matching IDs for same source/external ID: %q != %q", first, second)
	}
	if first == third {
		t.Fatalf("expected source to affect ID, but both were %q", first)
	}
}

func TestStableJobID_FallsBackWhenExternalIDMissing(t *testing.T) {
	first := StableJobID("jsearch", "", "Senior Go Engineer", "TechCorp", "https://example.com/jobs/1")
	second := StableJobID("jsearch", "", "Senior Go Engineer", "TechCorp", "https://example.com/jobs/1")

	if first != second {
		t.Fatalf("expected fallback ID to be deterministic: %q != %q", first, second)
	}
}
