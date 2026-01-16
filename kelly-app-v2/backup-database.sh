#!/bin/bash

# Script para hacer backup de la base de datos
# Ejecutar manualmente o configurar en cron

set -e

BACKUP_DIR="./backend/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/kelly_app_$TIMESTAMP.db"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Copiar base de datos
if [ -f "./backend/kelly_app.db" ]; then
    cp "./backend/kelly_app.db" "$BACKUP_FILE"
    echo "✅ Backup creado: $BACKUP_FILE"
    
    # Comprimir backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup comprimido: $BACKUP_FILE.gz"
    
    # Eliminar backups antiguos (mantener últimos 30 días)
    find "$BACKUP_DIR" -name "kelly_app_*.db.gz" -mtime +30 -delete
    echo "✅ Backups antiguos eliminados"
else
    echo "❌ Error: No se encontró la base de datos"
    exit 1
fi
