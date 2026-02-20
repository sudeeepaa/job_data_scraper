package handlers

import "net/http"

// APIError provides a consistent error envelope for all API responses.
type APIError struct {
	Error string `json:"error"`
	Code  int    `json:"code"`
}

// writeError sends a standardized error response.
func writeError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, APIError{Error: msg, Code: code})
}
