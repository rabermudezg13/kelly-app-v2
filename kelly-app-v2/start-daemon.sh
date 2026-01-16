#!/bin/bash

# Script para iniciar los servidores en background (daemon mode)
# Los servidores seguirán corriendo aunque cierres la terminal
# Uso: ./start-daemon.sh

cd "$(dirname "$0")"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Kelly App en modo daemon...${NC}"
echo ""

# Verificar si ya están corriendo
if [ -f "backend.pid" ] && ps -p $(cat backend.pid) > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Backend ya está corriendo (PID: $(cat backend.pid))${NC}"
else
    echo -e "${BLUE}📦 Iniciando Backend (puerto 3026)...${NC}"
    cd backend
    source venv/bin/activate
    nohup python -m uvicorn main:app --host 0.0.0.0 --port 3026 > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    cd ..
    echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
    echo "   Logs: tail -f backend.log"
fi

# Esperar un poco para que el backend inicie
sleep 3

# Verificar si el frontend ya está corriendo
if [ -f "frontend.pid" ] && ps -p $(cat frontend.pid) > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Frontend ya está corriendo (PID: $(cat frontend.pid))${NC}"
else
    echo -e "${BLUE}🎨 Iniciando Frontend (puerto 3025)...${NC}"
    cd frontend
    nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    cd ..
    echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
    echo "   Logs: tail -f frontend.log"
fi

echo ""
echo -e "${GREEN}✅ Servidores iniciados en modo daemon!${NC}"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3025"
echo "   Backend:  http://localhost:3026"
echo "   API Docs: http://localhost:3026/docs"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs del backend:  tail -f backend.log"
echo "   Ver logs del frontend: tail -f frontend.log"
echo "   Ver estado:           ./status-daemon.sh"
echo "   Detener servidores:   ./stop-daemon.sh"
echo ""
echo "💡 Los servidores seguirán corriendo aunque cierres la terminal"
echo ""
