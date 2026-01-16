#!/bin/bash

# Script para detener los servidores que están corriendo en modo daemon
# Uso: ./stop-daemon.sh

cd "$(dirname "$0")"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Deteniendo servidores...${NC}"
echo ""

# Detener Backend
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${RED}📦 Deteniendo Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
        sleep 2
        # Si aún está corriendo, forzar
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Backend detenido${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend no estaba corriendo${NC}"
    fi
    rm -f backend.pid
else
    echo -e "${YELLOW}⚠️  No se encontró archivo backend.pid${NC}"
    # Intentar detener por nombre de proceso
    pkill -f "uvicorn.*main:app" && echo -e "${GREEN}✅ Procesos de backend detenidos${NC}" || echo -e "${YELLOW}⚠️  No se encontraron procesos de backend${NC}"
fi

# Detener Frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${RED}🎨 Deteniendo Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
        sleep 2
        # Si aún está corriendo, forzar
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Frontend detenido${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend no estaba corriendo${NC}"
    fi
    rm -f frontend.pid
else
    echo -e "${YELLOW}⚠️  No se encontró archivo frontend.pid${NC}"
    # Intentar detener por nombre de proceso
    pkill -f "vite" && echo -e "${GREEN}✅ Procesos de frontend detenidos${NC}" || echo -e "${YELLOW}⚠️  No se encontraron procesos de frontend${NC}"
fi

echo ""
echo -e "${GREEN}✅ Servidores detenidos${NC}"
echo ""
