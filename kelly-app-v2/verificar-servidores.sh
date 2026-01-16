#!/bin/bash

# Script para verificar el estado de los servidores
# Uso: ./verificar-servidores.sh

echo "🔍 Verificando estado de los servidores..."
echo ""

# Obtener la IP local
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar Backend
echo -n "📦 Backend (puerto 3026): "
if pgrep -f "python.*main.py" > /dev/null; then
    echo -e "${GREEN}✅ Corriendo${NC}"
    # Intentar hacer una petición HTTP
    if curl -s http://localhost:3026/health > /dev/null 2>&1; then
        echo "   ✅ Responde correctamente"
    else
        echo -e "   ${YELLOW}⚠️  Proceso existe pero no responde${NC}"
    fi
else
    echo -e "${RED}❌ No está corriendo${NC}"
fi

# Verificar Frontend
echo -n "🎨 Frontend (puerto 3025): "
if pgrep -f "vite" > /dev/null || pgrep -f "node.*dev" > /dev/null; then
    echo -e "${GREEN}✅ Corriendo${NC}"
    # Intentar hacer una petición HTTP
    if curl -s http://localhost:3025 > /dev/null 2>&1; then
        echo "   ✅ Responde correctamente"
    else
        echo -e "   ${YELLOW}⚠️  Proceso existe pero no responde${NC}"
    fi
else
    echo -e "${RED}❌ No está corriendo${NC}"
fi

echo ""
echo "📍 URLs de acceso:"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   Desde red local: http://$LOCAL_IP:3025"
fi
echo "   Desde localhost: http://localhost:3025"
echo ""
