package config

import (
	"os"
	"time"
)

// Config holds application configuration.
type Config struct {
	Port         string
	DatabasePath string
	JWTSecret    string
	CORSOrigins  []string

	// API keys for job sources
	JSearchAPIKey string
	AdzunaAppID   string
	AdzunaAppKey  string

	// Cache settings
	CacheTTL time.Duration
}

// LoadConfig reads configuration from environment variables with defaults.
func LoadConfig() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabasePath:  getEnv("DATABASE_PATH", "jobpulse.db"),
		JWTSecret:     getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		CORSOrigins:   []string{getEnv("CORS_ORIGINS", "http://localhost:4321")},
		JSearchAPIKey: os.Getenv("JSEARCH_API_KEY"),
		AdzunaAppID:   os.Getenv("ADZUNA_APP_ID"),
		AdzunaAppKey:  os.Getenv("ADZUNA_APP_KEY"),
		CacheTTL:      24 * time.Hour,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
