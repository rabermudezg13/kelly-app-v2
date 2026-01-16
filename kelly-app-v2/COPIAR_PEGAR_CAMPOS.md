# 📋 Campos para Copiar y Pegar

## 🎯 Backend (Web Service)

### Name
```
backend
```

### Source Directory
```
new Kelly App/kelly-app-v2/backend
```

### Build Command
```
pip install -r requirements.txt
```

### Run Command
```
python -m uvicorn main:app --host 0.0.0.0 --port 8080
```

### HTTP Port
```
8080
```

### Environment
```
Python
```

### Route Path
```
/api
```

---

## 🎯 Frontend (Static Site)

### Name
```
frontend
```

### Source Directory
```
new Kelly App/kelly-app-v2/frontend
```

### Build Command
```
npm ci && npm run build
```

### Output Directory
```
dist
```

### Route Path
```
/
```

---

## 🎯 Variables de Entorno - Backend

### Variable 1
```
PYTHONUNBUFFERED
```
```
1
```
Scope: `Run Time`

### Variable 2
```
SECRET_KEY
```
```
88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df
```
Scope: `Run Time`  
Type: `Secret` ✓

### Variable 3
```
ALGORITHM
```
```
HS256
```
Scope: `Run Time`

### Variable 4
```
ACCESS_TOKEN_EXPIRE_MINUTES
```
```
43200
```
Scope: `Run Time`

### Variable 5
```
DATABASE_URL
```
```
${db.DATABASE_URL}
```
Scope: `Run Time`

### Variable 6
```
CORS_ORIGINS
```
```
${frontend.PUBLIC_URL}
```
Scope: `Run Time`

---

## 🎯 Variables de Entorno - Frontend

### Variable 1
```
VITE_API_URL
```
```
${backend.PUBLIC_URL}/api
```
Scope: `Build Time`

---

## 🎯 Base de Datos PostgreSQL

### Name
```
db
```

### Engine
```
PostgreSQL
```

### Version
```
15
```

### Plan
```
Basic
```

### Database Name
```
kelly_app
```

### Database User
```
kelly_app_user
```

---

## 📝 Instrucciones de Uso

1. **Copia cada campo** cuando lo necesites
2. **Pega en App Platform** en el campo correspondiente
3. **Verifica** que esté exactamente como se muestra
4. **Especialmente importante**: Source Directory debe ser exacto

---

¡Usa estos campos para copiar y pegar directamente! 📋
