package config

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestLoadConfig_LoadsDotEnvFile(t *testing.T) {
	tempDir := t.TempDir()
	envPath := filepath.Join(tempDir, ".env")
	content := "JSEARCH_API_KEY=test-jsearch\nADZUNA_APP_ID=test-adzuna-id\nADZUNA_APP_KEY=test-adzuna-key\nSCRAPE_BRIDGE_URL=https://scraper.example.com/search\nSCRAPE_BRIDGE_TOKEN=test-bridge-token\nSCRAPE_BRIDGE_SOURCES=linkedin|indeed\nLIVE_SYNC_QUERIES=golang developer|python developer\nLIVE_SYNC_LOCATIONS=Remote|San Francisco, CA\nLIVE_SYNC_INTERVAL=45m\nLIVE_SYNC_ON_START=false\n"

	if err := os.WriteFile(envPath, []byte(content), 0o600); err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}

	cwd, err := os.Getwd()
	if err != nil {
		t.Fatalf("Getwd failed: %v", err)
	}
	defer os.Chdir(cwd)

	if err := os.Chdir(tempDir); err != nil {
		t.Fatalf("Chdir failed: %v", err)
	}

	t.Setenv("JSEARCH_API_KEY", "")
	t.Setenv("ADZUNA_APP_ID", "")
	t.Setenv("ADZUNA_APP_KEY", "")
	t.Setenv("SCRAPE_BRIDGE_URL", "")
	t.Setenv("SCRAPE_BRIDGE_TOKEN", "")
	t.Setenv("SCRAPE_BRIDGE_SOURCES", "")
	t.Setenv("LIVE_SYNC_QUERIES", "")
	t.Setenv("LIVE_SYNC_LOCATIONS", "")
	t.Setenv("LIVE_SYNC_INTERVAL", "")
	t.Setenv("LIVE_SYNC_ON_START", "")

	cfg := LoadConfig()

	if cfg.JSearchAPIKey != "test-jsearch" {
		t.Fatalf("JSearchAPIKey = %q, want test-jsearch", cfg.JSearchAPIKey)
	}
	if cfg.AdzunaAppID != "test-adzuna-id" {
		t.Fatalf("AdzunaAppID = %q, want test-adzuna-id", cfg.AdzunaAppID)
	}
	if cfg.AdzunaAppKey != "test-adzuna-key" {
		t.Fatalf("AdzunaAppKey = %q, want test-adzuna-key", cfg.AdzunaAppKey)
	}
	if cfg.ScrapeBridgeURL != "https://scraper.example.com/search" {
		t.Fatalf("ScrapeBridgeURL = %q, want bridge URL", cfg.ScrapeBridgeURL)
	}
	if cfg.ScrapeBridgeToken != "test-bridge-token" {
		t.Fatalf("ScrapeBridgeToken = %q, want test-bridge-token", cfg.ScrapeBridgeToken)
	}
	if len(cfg.ScrapeBridgeSources) != 2 {
		t.Fatalf("ScrapeBridgeSources length = %d, want 2", len(cfg.ScrapeBridgeSources))
	}
	if len(cfg.LiveSyncQueries) != 2 {
		t.Fatalf("LiveSyncQueries length = %d, want 2", len(cfg.LiveSyncQueries))
	}
	if len(cfg.LiveSyncLocations) != 2 {
		t.Fatalf("LiveSyncLocations length = %d, want 2", len(cfg.LiveSyncLocations))
	}
	if cfg.LiveSyncInterval != 45*time.Minute {
		t.Fatalf("LiveSyncInterval = %s, want 45m", cfg.LiveSyncInterval)
	}
	if cfg.LiveSyncOnStart {
		t.Fatal("LiveSyncOnStart = true, want false")
	}
}
