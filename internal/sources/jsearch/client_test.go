package jsearch

import "testing"

func TestBuildLocation_IncludesCountryWhenAvailable(t *testing.T) {
	got := buildLocation("Bengaluru", "Karnataka", "India")
	want := "Bengaluru, Karnataka, India"
	if got != want {
		t.Fatalf("buildLocation() = %q, want %q", got, want)
	}
}
