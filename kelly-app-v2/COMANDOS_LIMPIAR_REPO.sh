#!/bin/bash

# Script para crear un repositorio limpio solo con Kelly App

echo "🧹 Limpiando y preparando repositorio para Kelly App..."
echo ""

# Ir al directorio correcto
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"

# Verificar que estamos en el lugar correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: No se encontraron las carpetas backend/ y frontend/"
    echo "   Asegúrate de estar en el directorio correcto"
    exit 1
fi

echo "✅ Directorio correcto encontrado"
echo ""

# Inicializar nuevo repositorio Git
echo "📦 Inicializando nuevo repositorio Git..."
git init

# Agregar todos los archivos
echo "📝 Agregando archivos..."
git add .

# Hacer commit
echo "💾 Haciendo commit..."
git commit -m "Initial commit - Kelly App v2.0 ready for App Platform

- Backend with PostgreSQL support
- Frontend React application
- App Platform configuration
- Complete deployment documentation"

# Conectar con GitHub
echo "🔗 Conectando con GitHub..."
git remote add origin https://github.com/rabermudezg13/NewKellyApp2026.git 2>/dev/null || git remote set-url origin https://github.com/rabermudezg13/NewKellyApp2026.git

# Verificar remote
echo ""
echo "📋 Remote configurado:"
git remote -v

# Subir código
echo ""
echo "🚀 Subiendo código a GitHub..."
echo "   (Puede pedirte credenciales)"
git branch -M main
git push -u origin main --force

echo ""
echo "✅ ¡Listo! Repositorio limpio creado y subido"
echo ""
echo "📋 Verifica en: https://github.com/rabermudezg13/NewKellyApp2026"
echo "   Deberías ver SOLO las carpetas backend/ y frontend/"
