#!/bin/bash

# Script para iniciar los servidores y mostrar información de acceso
# Uso: ./iniciar-servidores.sh

echo "🚀 Iniciando Kelly App v2.0..."
echo ""

# Obtener la IP local
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si los servidores ya están corriendo
if pgrep -f "python.*main.py" > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend ya está corriendo${NC}"
else
    echo -e "${BLUE}📦 Iniciando Backend (puerto 3026)...${NC}"
    cd "$(dirname "$0")/backend"
    if [ ! -d "venv" ]; then
        echo "❌ Error: venv no encontrado. Por favor, crea el entorno virtual primero."
        exit 1
    fi
    source venv/bin/activate
    nohup python main.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   PID: $BACKEND_PID"
    cd ..
    sleep 3
fi

# Verificar si el frontend ya está corriendo
if pgrep -f "vite" > /dev/null || pgrep -f "node.*dev" > /dev/null; then
    echo -e "${YELLOW}⚠️  Frontend ya está corriendo${NC}"
else
    echo -e "${GREEN}🎨 Iniciando Frontend (puerto 3025)...${NC}"
    cd "$(dirname "$0")/frontend"
    if [ ! -d "node_modules" ]; then
        echo "❌ Error: node_modules no encontrado. Por favor, ejecuta 'npm install' primero."
        exit 1
    fi
    nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   PID: $FRONTEND_PID"
    cd ..
    sleep 3
fi

echo ""
echo -e "${GREEN}✅ Servidores iniciados!${NC}"
echo ""
echo "📍 URLs de acceso:"
echo ""
echo -e "${BLUE}Desde esta máquina (localhost):${NC}"
echo "   Frontend: http://localhost:3025"
echo "   Backend:  http://localhost:3026"
echo "   API Docs: http://localhost:3026/docs"
echo ""
if [ ! -z "$LOCAL_IP" ]; then
    echo -e "${YELLOW}Desde otros equipos en la red (IP: $LOCAL_IP):${NC}"
    echo "   Frontend: http://$LOCAL_IP:3025"
    echo "   Backend:  http://$LOCAL_IP:3026"
    echo "   API Docs: http://$LOCAL_IP:3026/docs"
    echo ""
fi
echo "📋 Ver logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Para detener:"
echo "   ./stop-servidores.sh"
echo ""
