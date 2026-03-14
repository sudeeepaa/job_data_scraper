package adzuna

import (
	"encoding/json"
	"testing"
)

func TestParseJobID_AcceptsIntAndString(t *testing.T) {
	intID := json.RawMessage(`12345`)
	if got := parseJobID(intID); got != "12345" {
		t.Fatalf("parseJobID(int) = %q, want 12345", got)
	}

	stringID := json.RawMessage(`"abc-123"`)
	if got := parseJobID(stringID); got != "abc-123" {
		t.Fatalf("parseJobID(string) = %q, want abc-123", got)
	}
}
