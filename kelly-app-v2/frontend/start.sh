#!/bin/bash
set -e

# Use PORT environment variable, default to 3025 if not set
PORT=${PORT:-3025}

# Start vite preview
exec npx vite preview --host 0.0.0.0 --port $PORT
