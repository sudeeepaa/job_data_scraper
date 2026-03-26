#!/bin/sh
set -eu

BACKEND_PORT="${PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-4321}"
PRIVATE_API_URL="${PRIVATE_API_URL:-http://127.0.0.1:${BACKEND_PORT}}"

HOST=127.0.0.1 PORT="${FRONTEND_PORT}" PRIVATE_API_URL="${PRIVATE_API_URL}" node /app/frontend/dist/server/entry.mjs &
FRONTEND_PID=$!

cleanup() {
  kill "${FRONTEND_PID}" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

PORT="${BACKEND_PORT}" FRONTEND_SERVER_URL="http://127.0.0.1:${FRONTEND_PORT}" /app/server
