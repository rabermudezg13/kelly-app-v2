# 🧹 Pasos para Limpiar el Repositorio

## ❌ El Problema

El repositorio Git está en un directorio padre que incluye otros proyectos (foodie, etc.). Por eso aparecen archivos que no tienen que ver.

---

## ✅ Solución: Crear Repositorio Limpio

### Paso 1: Abrir Terminal

Abre la terminal en tu Mac.

### Paso 2: Ir al Directorio Correcto

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
```

### Paso 3: Inicializar Nuevo Repositorio

```bash
# Inicializar Git solo en este directorio
git init
```

### Paso 4: Agregar Archivos

```bash
# Agregar todos los archivos de kelly-app-v2
git add .
```

### Paso 5: Hacer Commit

```bash
git commit -m "Initial commit - Kelly App v2.0 ready for App Platform"
```

### Paso 6: Conectar con GitHub

```bash
# Conectar con el nuevo repositorio
git remote add origin https://github.com/rabermudezg13/NewKellyApp2026.git
```

Si te dice que ya existe, usa:
```bash
git remote set-url origin https://github.com/rabermudezg13/NewKellyApp2026.git
```

### Paso 7: Subir Código

```bash
# Cambiar a branch main
git branch -M main

# Subir (el --force es necesario porque el repo está vacío)
git push -u origin main --force
```

Si te pide credenciales:
- **Username**: `rabermudezg13`
- **Password**: Usa un **Personal Access Token** (no tu contraseña)

---

## ✅ Verificar

1. Ve a: https://github.com/rabermudezg13/NewKellyApp2026
2. Deberías ver SOLO:
   - ✅ `backend/` folder
   - ✅ `frontend/` folder
   - ✅ `.do/app.yaml`
   - ✅ Archivos de documentación
   - ❌ NO deberías ver `IOS/`, `foodie/`, etc.

---

## 🚀 Después de Limpiar

Una vez que el repositorio esté limpio:

1. Ve a App Platform en DigitalOcean
2. Si ya creaste la App, **reconecta** el repositorio
3. O crea una nueva App y conecta: `rabermudezg13/NewKellyApp2026`
4. Ahora debería detectar los componentes correctamente
5. O configura manualmente con Source Directory: `backend` y `frontend`

---

## 📋 Comandos Completos (Copia y Pega)

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
git init
git add .
git commit -m "Initial commit - Kelly App v2.0 ready for App Platform"
git remote add origin https://github.com/rabermudezg13/NewKellyApp2026.git
git branch -M main
git push -u origin main --force
```

---

¿Listo para ejecutar estos comandos?
