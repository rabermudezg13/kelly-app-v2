# 🐳 Docker - Inicio Rápido

## 🚀 Iniciar la Aplicación con Docker

### Paso 1: Instalar Docker Desktop
Si no lo tienes instalado:
1. Descarga desde: https://www.docker.com/products/docker-desktop
2. Instala y reinicia tu Mac
3. Verifica: `docker --version`

### Paso 2: Iniciar Todo
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
docker-compose up --build
```

**¡Eso es todo!** 🎉

La primera vez tardará unos minutos (descarga imágenes e instala dependencias).
Las siguientes veces será mucho más rápido.

### Paso 3: Acceder
- **Frontend:** http://localhost:3025
- **Backend:** http://localhost:3026
- **API Docs:** http://localhost:3026/docs

### Detener
```bash
# Presiona Ctrl+C
# O en otra terminal:
docker-compose down
```

## 📚 Documentación Completa

- **`DOCKER_VENTAJAS.md`** - ¿Por qué usar Docker? Ventajas y beneficios
- **`DOCKER_GUIA.md`** - Guía completa de uso, comandos y troubleshooting

## 🆚 Comparación Rápida

| Método | Comando | Ventajas |
|--------|---------|----------|
| **Docker** | `docker-compose up` | ✅ Un solo comando<br>✅ Aislado<br>✅ Portátil |
| **Daemon** | `./start-daemon.sh` | ✅ Control manual<br>✅ Logs en tiempo real |
| **Normal** | `./start.sh` | ✅ Simple<br>✅ Ver output directo |

## 💡 Recomendación

**Para empezar rápido:** Usa Docker (`docker-compose up`)
**Para desarrollo diario:** Usa el método que prefieras (todos funcionan bien)
