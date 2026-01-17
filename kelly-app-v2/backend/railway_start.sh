#!/bin/bash
echo "=================================="
echo "Starting Railway Backend"
echo "=================================="
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Starting uvicorn with CORS enabled..."
echo "=================================="
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
