#!/bin/bash
cd "$(dirname "$0")"

echo "🛑 Stopping all services..."

# Kill backend
pkill -f "uvicorn.*main:app" || pkill -f "python.*main.py" || true

# Kill frontend
pkill -f "vite" || pkill -f "node.*vite" || true

sleep 3

echo "🚀 Starting backend..."
cd backend
source venv/bin/activate
nohup python -m uvicorn main:app --host 0.0.0.0 --port 3026 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

sleep 3

echo "🚀 Starting frontend..."
cd ../frontend
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

sleep 5

echo "✅ Services restarted!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Check logs:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
