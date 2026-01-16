#!/bin/bash
cd "$(dirname "$0")/backend"

# Kill existing backend processes
pkill -f "uvicorn.*main:app" || pkill -f "python.*main.py" || true
sleep 2

# Activate virtual environment and start backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 3026 --reload
