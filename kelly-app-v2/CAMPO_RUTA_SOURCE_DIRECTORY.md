# 📝 Configurar el Campo de Ruta (Source Directory)

## 🎯 El Campo que Ves

Si ves un campo para **"Source Directory"** o **"Path"** o **"Ruta"**, ese es el campo correcto.

---

## ✅ Qué Ruta Poner

### Si el código está en la raíz del repositorio:

**Para Backend:**
```
backend
```

**Para Frontend:**
```
frontend
```

### Si el código está en un subdirectorio:

**Para Backend:**
```
new Kelly App/kelly-app-v2/backend
```

**Para Frontend:**
```
new Kelly App/kelly-app-v2/frontend
```

---

## 🔍 Cómo Saber Qué Ruta Usar

### Opción 1: Verificar en GitHub

1. Ve a: https://github.com/rabermudezg13/NewKellyApp2026
2. Mira la estructura de carpetas
3. Si ves `backend/` directamente en la raíz → usa `backend`
4. Si ves `new Kelly App/kelly-app-v2/backend/` → usa `new Kelly App/kelly-app-v2/backend`

### Opción 2: Verificar Localmente

En tu terminal:

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
ls -la
```

Si ves `backend/` y `frontend/` directamente → usa `backend` y `frontend`

---

## 📋 Campos Necesarios para Guardar

Para que puedas guardar, necesitas llenar estos campos:

### Para Backend (Web Service):

1. **Name**: `backend`
2. **Source Directory** (el campo de ruta): `backend` o la ruta completa
3. **Build Command**: `pip install -r requirements.txt`
4. **Run Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
5. **HTTP Port**: `8080`
6. **Environment**: `Python`

### Para Frontend (Static Site):

1. **Name**: `frontend`
2. **Source Directory** (el campo de ruta): `frontend` o la ruta completa
3. **Build Command**: `npm ci && npm run build`
4. **Output Directory**: `dist`

---

## 🎯 Pasos Exactos

### Paso 1: Llenar el Campo de Ruta

En el campo que ves para la ruta, escribe:

**Si tu código está en la raíz:**
```
backend
```

**O si está en subdirectorio:**
```
new Kelly App/kelly-app-v2/backend
```

### Paso 2: Llenar los Otros Campos

Asegúrate de llenar TODOS los campos requeridos:

- Name
- Source Directory (la ruta)
- Build Command
- Run Command (para backend)
- HTTP Port (para backend)
- Environment (para backend)
- Output Directory (para frontend)

### Paso 3: Guardar

1. Verifica que todos los campos estén llenos
2. Click en **"Save"** o **"Done"** o **"Create"**

---

## 🆘 Si Aún No Puedes Guardar

### Verifica:

1. **¿Todos los campos requeridos están llenos?**
   - Algunos campos pueden tener un asterisco (*) indicando que son obligatorios

2. **¿El campo de ruta tiene el valor correcto?**
   - Debe ser exactamente `backend` o la ruta completa
   - Sin espacios extra al inicio o final

3. **¿Hay algún mensaje de error específico?**
   - Lee el mensaje de error completo
   - Puede indicar qué campo falta o está mal

---

## 📸 Ejemplo de lo que Deberías Ver

```
┌─────────────────────────────────────────┐
│ Add Component                            │
├─────────────────────────────────────────┤
│ Type: [Web Service ▼]                   │
│                                         │
│ Name: backend                           │
│                                         │
│ Source Directory:                       │
│ ┌─────────────────────────────────────┐ │
│ │ backend                             │ │ ← ESTE ES EL CAMPO
│ └─────────────────────────────────────┘ │
│                                         │
│ Build Command:                          │
│ ┌─────────────────────────────────────┐ │
│ │ pip install -r requirements.txt     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Run Command:                            │
│ ┌─────────────────────────────────────┐ │
│ │ python -m uvicorn main:app --host   │ │
│ │   0.0.0.0 --port 8080               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ HTTP Port: 8080                         │
│                                         │
│ Environment: Python                    │
│                                         │
│ [Save] [Cancel]                         │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

Antes de guardar, verifica:

- [ ] Campo "Name" lleno
- [ ] Campo "Source Directory" (ruta) lleno con `backend` o ruta completa
- [ ] Campo "Build Command" lleno
- [ ] Campo "Run Command" lleno (para backend)
- [ ] Campo "HTTP Port" lleno (para backend)
- [ ] Campo "Environment" seleccionado (para backend)
- [ ] Campo "Output Directory" lleno (para frontend)

---

## 💡 Tip

**Prueba primero con la ruta simple:**
```
backend
```

Si no funciona, prueba con la ruta completa:
```
new Kelly App/kelly-app-v2/backend
```

---

¿Qué ruta pusiste en el campo? ¿Y qué mensaje de error exacto te sale cuando intentas guardar?
