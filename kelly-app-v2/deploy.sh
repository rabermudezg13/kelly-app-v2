#!/bin/bash

# Script de deployment para Kelly App
# Este script ayuda a configurar la aplicación en producción

set -e

echo "🚀 Kelly App - Script de Deployment"
echo "===================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz de kelly-app-v2"
    exit 1
fi

# 1. Verificar archivos .env
print_info "Verificando archivos .env..."

if [ ! -f "backend/.env" ]; then
    print_warning "backend/.env no existe. Creando desde env.example..."
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        print_warning "Por favor, edita backend/.env y configura tus valores"
    else
        print_error "backend/env.example no existe"
    fi
else
    print_success "backend/.env existe"
fi

if [ ! -f "frontend/.env" ]; then
    print_warning "frontend/.env no existe. Creando desde env.example..."
    if [ -f "frontend/env.example" ]; then
        cp frontend/env.example frontend/.env
        print_warning "Por favor, edita frontend/.env y configura tus valores"
    else
        print_error "frontend/env.example no existe"
    fi
else
    print_success "frontend/.env existe"
fi

# 2. Verificar dependencias del backend
print_info "Verificando dependencias del backend..."
cd backend

if [ ! -d "venv" ]; then
    print_warning "Entorno virtual no existe. Creando..."
    python3 -m venv venv
    print_success "Entorno virtual creado"
fi

print_info "Activando entorno virtual..."
source venv/bin/activate

print_info "Instalando/actualizando dependencias..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
print_success "Dependencias del backend instaladas"

cd ..

# 3. Verificar dependencias del frontend
print_info "Verificando dependencias del frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    print_warning "node_modules no existe. Instalando..."
    npm install
    print_success "Dependencias del frontend instaladas"
else
    print_info "Actualizando dependencias..."
    npm install
    print_success "Dependencias del frontend actualizadas"
fi

cd ..

# 4. Verificar configuración de nginx
print_info "Verificando configuración de nginx..."

if [ -f "nginx/kellyapp.conf" ]; then
    print_success "Configuración de nginx encontrada"
    print_info "Para instalar la configuración de nginx:"
    echo "  sudo cp nginx/kellyapp.conf /etc/nginx/sites-available/kellyapp.conf"
    echo "  sudo ln -s /etc/nginx/sites-available/kellyapp.conf /etc/nginx/sites-enabled/kellyapp.conf"
    echo "  sudo nginx -t"
    echo "  sudo systemctl reload nginx"
else
    print_warning "nginx/kellyapp.conf no encontrado"
fi

# 5. Generar SECRET_KEY si no existe
if [ -f "backend/.env" ]; then
    if grep -q "SECRET_KEY=your-secret-key-change-in-production" backend/.env; then
        print_warning "SECRET_KEY no está configurado. Generando uno nuevo..."
        NEW_SECRET=$(openssl rand -hex 32)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|SECRET_KEY=.*|SECRET_KEY=$NEW_SECRET|" backend/.env
        else
            # Linux
            sed -i "s|SECRET_KEY=.*|SECRET_KEY=$NEW_SECRET|" backend/.env
        fi
        print_success "SECRET_KEY generado y actualizado en backend/.env"
    fi
fi

echo ""
print_success "Deployment setup completado!"
echo ""
print_info "Próximos pasos:"
echo "  1. Edita backend/.env y frontend/.env con tus valores de producción"
echo "  2. Configura nginx (ver instrucciones arriba)"
echo "  3. Configura SSL con Let's Encrypt: sudo certbot --nginx -d kellyapp.fromcolombiawithcoffees.com"
echo "  4. Inicia los servicios (ver DEPLOYMENT.md para más detalles)"
echo ""
print_info "Para más información, consulta DEPLOYMENT.md"

