#!/bin/bash
cd "$(dirname "$0")/frontend"

# Kill existing frontend processes
pkill -f "vite" || pkill -f "node.*vite" || true
sleep 2

# Start frontend
npm run dev
