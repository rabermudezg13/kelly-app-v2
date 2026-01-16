# 🎯 Ruta Exacta para el Campo Source Directory

## ✅ Prueba Esta Ruta Primero

En el campo de **Source Directory** o **Path**, escribe exactamente esto:

### Para Backend:
```
backend
```

### Para Frontend:
```
frontend
```

---

## 🔄 Si No Funciona, Prueba Esta

Si la ruta simple no funciona, prueba con la ruta completa:

### Para Backend:
```
new Kelly App/kelly-app-v2/backend
```

### Para Frontend:
```
new Kelly App/kelly-app-v2/frontend
```

---

## 📋 Todos los Campos que Necesitas

### Backend:

1. **Name**: `backend`
2. **Source Directory**: `backend` ← ESTE ES EL CAMPO DE RUTA
3. **Build Command**: `pip install -r requirements.txt`
4. **Run Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
5. **HTTP Port**: `8080`
6. **Environment**: `Python`

### Frontend:

1. **Name**: `frontend`
2. **Source Directory**: `frontend` ← ESTE ES EL CAMPO DE RUTA
3. **Build Command**: `npm ci && npm run build`
4. **Output Directory**: `dist`

---

## ⚠️ Importante

- **NO** pongas `/` al inicio: ❌ `/backend` → ✅ `backend`
- **NO** pongas espacios extra
- **SÍ** respeta mayúsculas y minúsculas

---

¿Qué ruta pusiste y qué error exacto te sale?
