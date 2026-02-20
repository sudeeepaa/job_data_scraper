package config

import "os"

// Config holds application configuration.
type Config struct {
	Port         string
	DatabasePath string
	JWTSecret    string
	CORSOrigins  []string
}

// LoadConfig reads configuration from environment variables with defaults.
func LoadConfig() *Config {
	return &Config{
		Port:         getEnv("PORT", "8080"),
		DatabasePath: getEnv("DATABASE_PATH", "jobpulse.db"),
		JWTSecret:    getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		CORSOrigins:  []string{getEnv("CORS_ORIGINS", "http://localhost:4321")},
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
