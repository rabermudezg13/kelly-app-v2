#!/bin/bash

# Script para verificar el estado de los servidores
# Uso: ./status-daemon.sh

cd "$(dirname "$0")"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Estado de los Servidores${NC}"
echo "================================"
echo ""

# Verificar Backend
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: CORRIENDO (PID: $BACKEND_PID)${NC}"
        echo "   URL: http://localhost:3026"
        # Verificar si responde
        if curl -s http://localhost:3026 > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓ Responde correctamente${NC}"
        else
            echo -e "   ${YELLOW}⚠ No responde (puede estar iniciando)${NC}"
        fi
    else
        echo -e "${RED}❌ Backend: DETENIDO (PID file existe pero proceso no)${NC}"
        rm -f backend.pid
    fi
else
    # Verificar si hay algún proceso de backend corriendo
    if pgrep -f "uvicorn.*main:app" > /dev/null; then
        echo -e "${YELLOW}⚠️  Backend: CORRIENDO (sin PID file)${NC}"
    else
        echo -e "${RED}❌ Backend: DETENIDO${NC}"
    fi
fi

echo ""

# Verificar Frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: CORRIENDO (PID: $FRONTEND_PID)${NC}"
        echo "   URL: http://localhost:3025"
        # Verificar si responde
        if curl -s http://localhost:3025 > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓ Responde correctamente${NC}"
        else
            echo -e "   ${YELLOW}⚠ No responde (puede estar iniciando)${NC}"
        fi
    else
        echo -e "${RED}❌ Frontend: DETENIDO (PID file existe pero proceso no)${NC}"
        rm -f frontend.pid
    fi
else
    # Verificar si hay algún proceso de frontend corriendo
    if pgrep -f "vite" > /dev/null; then
        echo -e "${YELLOW}⚠️  Frontend: CORRIENDO (sin PID file)${NC}"
    else
        echo -e "${RED}❌ Frontend: DETENIDO${NC}"
    fi
fi

echo ""
echo "📋 Logs disponibles:"
[ -f "backend.log" ] && echo "   Backend:  tail -f backend.log" || echo "   Backend:  (no hay logs aún)"
[ -f "frontend.log" ] && echo "   Frontend: tail -f frontend.log" || echo "   Frontend: (no hay logs aún)"
echo ""
