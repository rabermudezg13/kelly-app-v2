# 📦 Configurar Repositorio en GitHub

## 🎯 Paso 1: Crear Repositorio en GitHub

### Opción A: Desde el sitio web de GitHub

1. Ve a https://github.com
2. Click en el botón **+** (arriba derecha) > **New repository**
3. Configura el repositorio:
   - **Repository name**: `kelly-app` (o el nombre que prefieras)
   - **Description**: "Kelly Education Front Desk Application"
   - **Visibility**: Private (recomendado) o Public
   - **NO marques** "Initialize with README" (ya tienes código)
4. Click **Create repository**

### Opción B: Desde GitHub CLI (si lo tienes instalado)

```bash
gh repo create kelly-app --private --source=. --remote=origin --push
```

---

## 🎯 Paso 2: Subir Código al Repositorio

### 2.1 Verificar estado de Git

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"

# Verificar si ya es un repositorio Git
git status
```

### 2.2 Si NO es un repositorio Git

```bash
# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - Kelly App v2.0"
```

### 2.3 Conectar con GitHub

```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
# Reemplaza kelly-app con el nombre de tu repositorio

git remote add origin https://github.com/TU_USUARIO/kelly-app.git

# O si prefieres SSH:
# git remote add origin git@github.com:TU_USUARIO/kelly-app.git

# Subir código
git branch -M main
git push -u origin main
```

### 2.4 Si YA es un repositorio Git

```bash
# Verificar remotes existentes
git remote -v

# Si no hay remote, agregar uno:
git remote add origin https://github.com/TU_USUARIO/kelly-app.git

# Subir código
git push -u origin main
```

---

## 🎯 Paso 3: Crear .gitignore (Si no existe)

Asegúrate de tener un `.gitignore` para no subir archivos sensibles:

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"

# Crear .gitignore si no existe
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
*.db
*.sqlite
*.sqlite3

# Node
node_modules/
dist/
build/
*.log
npm-debug.log*

# Environment variables
.env
.env.local
.env.production
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
backend.log
frontend.log

# Backups
backend/backups/
*.db.backup

# PIDs
*.pid

# Docker
.dockerignore
EOF

# Agregar .gitignore
git add .gitignore
git commit -m "Add .gitignore"
git push
```

---

## 🎯 Paso 4: Verificar que Todo Esté Subido

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/kelly-app`
2. Verifica que veas:
   - ✅ `backend/` folder
   - ✅ `frontend/` folder
   - ✅ `.do/app.yaml` (si lo creaste)
   - ✅ `README.md` o documentación
   - ✅ NO deberías ver `.env` files
   - ✅ NO deberías ver `*.db` files

---

## 🎯 Paso 5: Preparar para App Platform

### 5.1 Verificar archivos necesarios

Asegúrate de que estos archivos estén en el repositorio:

```
kelly-app-v2/
├── .do/
│   └── app.yaml          ← Configuración de App Platform
├── backend/
│   ├── requirements.txt  ← Con psycopg2-binary
│   ├── main.py
│   └── ...
└── frontend/
    ├── package.json
    └── ...
```

### 5.2 Actualizar .do/app.yaml

Edita `.do/app.yaml` y reemplaza:
- `TU_USUARIO` → Tu usuario de GitHub
- `TU_REPOSITORIO` → Nombre de tu repositorio

```yaml
github:
  repo: TU_USUARIO/kelly-app  # ← Actualizar aquí
  branch: main
```

---

## ✅ Checklist

- [ ] Repositorio creado en GitHub
- [ ] Código subido al repositorio
- [ ] `.gitignore` configurado
- [ ] Archivos sensibles NO están en el repo
- [ ] `.do/app.yaml` actualizado con tu repo
- [ ] Repositorio listo para App Platform

---

## 🔒 Seguridad

**NUNCA subas estos archivos:**
- ❌ `.env` files
- ❌ `*.db` files (bases de datos)
- ❌ `venv/` o `node_modules/`
- ❌ Archivos con passwords o secrets

**SÍ puedes subir:**
- ✅ Código fuente
- ✅ `requirements.txt`
- ✅ `package.json`
- ✅ `.do/app.yaml`
- ✅ Documentación

---

## 🚀 Siguiente Paso

Una vez que el código esté en GitHub, puedes proceder con el deploy en App Platform siguiendo `APP_PLATFORM_GUIA_COMPLETA.md`.
