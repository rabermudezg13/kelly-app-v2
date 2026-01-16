# 📦 Pasos para Crear y Subir a GitHub

## ✅ Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com
2. Click en **+** (arriba derecha) > **New repository**
3. Configura:
   - **Name**: `kelly-app` (o el nombre que prefieras)
   - **Description**: "Kelly Education Front Desk Application"
   - **Visibility**: Private (recomendado)
   - **NO marques** "Add a README file"
   - **NO marques** "Add .gitignore"
   - **NO marques** "Choose a license"
4. Click **Create repository**

GitHub te mostrará instrucciones. **NO las sigas todavía**, primero necesitas preparar el código localmente.

---

## ✅ Paso 2: Preparar Código Localmente

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"

# Verificar estado
git status

# Agregar .gitignore (si no existe)
# Ya está creado, solo verifica que esté

# Agregar todos los archivos nuevos
git add .

# Hacer commit
git commit -m "Initial commit - Kelly App v2.0 ready for App Platform"
```

---

## ✅ Paso 3: Conectar con GitHub

```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
# Reemplaza kelly-app con el nombre de tu repositorio

# Verificar si ya hay un remote
git remote -v

# Si NO hay remote, agregar uno:
git remote add origin https://github.com/TU_USUARIO/kelly-app.git

# Si YA hay un remote diferente, cambiarlo:
# git remote set-url origin https://github.com/TU_USUARIO/kelly-app.git

# Subir código
git branch -M main
git push -u origin main
```

---

## ✅ Paso 4: Verificar en GitHub

1. Ve a tu repositorio: `https://github.com/TU_USUARIO/kelly-app`
2. Verifica que veas:
   - ✅ `backend/` folder
   - ✅ `frontend/` folder
   - ✅ `.do/` folder con `app.yaml`
   - ✅ Archivos de documentación
   - ❌ NO deberías ver `.env` files
   - ❌ NO deberías ver `*.db` files

---

## ✅ Paso 5: Actualizar .do/app.yaml

Edita `.do/app.yaml` y reemplaza:

```yaml
github:
  repo: TU_USUARIO/kelly-app  # ← Cambiar aquí
  branch: main
```

Luego haz commit y push:

```bash
git add .do/app.yaml
git commit -m "Update app.yaml with GitHub repo"
git push
```

---

## 🚀 Siguiente Paso

Una vez que el código esté en GitHub, puedes proceder con el deploy en App Platform:

1. Ve a https://cloud.digitalocean.com
2. **App Platform** > **Create App**
3. Conecta tu repositorio de GitHub
4. Sigue la guía en `APP_PLATFORM_GUIA_COMPLETA.md`

---

## 🔒 Importante: Archivos que NO debes subir

Asegúrate de que estos archivos NO estén en GitHub:
- ❌ `backend/.env`
- ❌ `backend/kelly_app.db`
- ❌ `frontend/.env`
- ❌ Cualquier archivo con passwords o secrets

El `.gitignore` ya está configurado para excluirlos automáticamente.

---

¿Necesitas ayuda con algún paso específico?
