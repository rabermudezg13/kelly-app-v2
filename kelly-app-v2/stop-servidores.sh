#!/bin/bash

# Script para detener los servidores
# Uso: ./stop-servidores.sh

echo "🛑 Deteniendo servidores..."

# Detener backend
if pgrep -f "python.*main.py" > /dev/null; then
    echo "📦 Deteniendo Backend..."
    pkill -f "python.*main.py"
    sleep 2
    echo "✅ Backend detenido"
else
    echo "⚠️  Backend no estaba corriendo"
fi

# Detener frontend
if pgrep -f "vite" > /dev/null || pgrep -f "node.*dev" > /dev/null; then
    echo "🎨 Deteniendo Frontend..."
    pkill -f "vite"
    pkill -f "node.*dev"
    sleep 2
    echo "✅ Frontend detenido"
else
    echo "⚠️  Frontend no estaba corriendo"
fi

echo ""
echo "✅ Servidores detenidos"
