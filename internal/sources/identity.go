package sources

import (
	"crypto/sha256"
	"fmt"
	"strings"
)

// StableJobID creates a deterministic ID so repeated source fetches update the
// same job record instead of inserting duplicates.
func StableJobID(source, externalID string, fallbackParts ...string) string {
	seed := strings.TrimSpace(externalID)
	if seed == "" {
		cleaned := make([]string, 0, len(fallbackParts))
		for _, part := range fallbackParts {
			part = strings.TrimSpace(part)
			if part != "" {
				cleaned = append(cleaned, part)
			}
		}
		seed = strings.Join(cleaned, "|")
	}

	if seed == "" {
		seed = source
	}

	hash := sha256.Sum256([]byte(source + "|" + seed))
	return fmt.Sprintf("%s_%x", source, hash[:12])
}
