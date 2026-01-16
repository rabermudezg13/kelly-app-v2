# 📝 Paso 2.4: Configurar Variables de Entorno del Backend

## 🎯 Objetivo

Agregar las variables de entorno necesarias para que el backend funcione correctamente en App Platform.

---

## 📋 Pasos Detallados

### 1. Ubicar la Sección de Variables de Entorno

En la pantalla de configuración de App Platform:

1. **Busca el componente "backend"** (Web Service)
2. **Expande la sección** del backend haciendo click en él
3. **Busca la sección "Environment Variables"** o **"Variables"**
   - Puede estar en una pestaña llamada **"Environment"** o **"Config"**
   - O puede estar en un botón **"Edit"** o **"Configure"**

### 2. Agregar Variables de Entorno

Click en **"Add Variable"** o **"Add Environment Variable"** y agrega cada una:

#### Variable 1: PYTHONUNBUFFERED

```
Key: PYTHONUNBUFFERED
Value: 1
Scope: Run Time
```

**¿Qué hace?**: Permite que los logs de Python se muestren en tiempo real.

---

#### Variable 2: SECRET_KEY

```
Key: SECRET_KEY
Value: [GENERAR UNA CLAVE SEGURA]
Scope: Run Time
Type: Secret (marcar esta opción si está disponible)
```

**¿Cómo generar SECRET_KEY?**

**Opción A: Desde Terminal (macOS/Linux)**
```bash
openssl rand -hex 32
```

**Opción B: Desde Python**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Opción C: Online (menos seguro)**
- Ve a https://www.random.org/strings/
- Genera una cadena de 64 caracteres hexadecimales

**Ejemplo de SECRET_KEY generada:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

⚠️ **IMPORTANTE**: Guarda esta clave en un lugar seguro. La necesitarás si haces cambios.

---

#### Variable 3: ALGORITHM

```
Key: ALGORITHM
Value: HS256
Scope: Run Time
```

**¿Qué hace?**: Define el algoritmo de encriptación para los tokens JWT.

---

#### Variable 4: ACCESS_TOKEN_EXPIRE_MINUTES

```
Key: ACCESS_TOKEN_EXPIRE_MINUTES
Value: 43200
Scope: Run Time
```

**¿Qué hace?**: Define cuántos minutos duran los tokens de autenticación (43200 = 30 días).

---

#### Variable 5: DATABASE_URL (Se agregará después)

**NO la agregues todavía**. Esta se configurará automáticamente cuando agregues la base de datos en el paso 2.7.

Si App Platform te muestra un placeholder o sugerencia, puedes dejarla así:
```
Key: DATABASE_URL
Value: ${db.DATABASE_URL}
Scope: Run Time
```

---

#### Variable 6: CORS_ORIGINS (Se agregará después)

**NO la agregues todavía**. Esta se configurará después de crear el frontend.

---

## 🖼️ Visualización de la Pantalla

La pantalla debería verse así:

```
┌─────────────────────────────────────────┐
│ Backend (Web Service)                   │
├─────────────────────────────────────────┤
│ Environment Variables                   │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Key: PYTHONUNBUFFERED                ││
│ │ Value: 1                             ││
│ │ Scope: [Run Time ▼]                  ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Key: SECRET_KEY                      ││
│ │ Value: [tu-clave-generada]          ││
│ │ Scope: [Run Time ▼]                 ││
│ │ Type: [Secret ✓]                    ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Key: ALGORITHM                      ││
│ │ Value: HS256                         ││
│ │ Scope: [Run Time ▼]                 ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Key: ACCESS_TOKEN_EXPIRE_MINUTES    ││
│ │ Value: 43200                        ││
│ │ Scope: [Run Time ▼]                 ││
│ └─────────────────────────────────────┘│
│                                         │
│ [+ Add Variable]                        │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

Después de agregar las variables, verifica:

- [ ] `PYTHONUNBUFFERED` = `1`
- [ ] `SECRET_KEY` = (clave generada, marcada como Secret)
- [ ] `ALGORITHM` = `HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `43200`
- [ ] Todas tienen **Scope: Run Time**

---

## 🔄 Siguiente Paso

Una vez que hayas agregado estas variables:

1. **Guarda los cambios** (puede haber un botón "Save" o se guardan automáticamente)
2. **Continúa con el Paso 2.5**: Configurar Frontend

---

## 🆘 Si no encuentras la sección

1. **Busca un botón "Edit"** o **"Configure"** en el componente backend
2. **Busca pestañas** como "Environment", "Config", "Settings"
3. **Scroll hacia abajo** en la configuración del backend
4. Si aún no la encuentras, puedes agregar las variables después de crear todos los componentes

---

## 💡 Tips

- **SECRET_KEY**: Debe ser única y segura. No la compartas.
- **Scope: Run Time**: Significa que la variable estará disponible cuando la app esté corriendo.
- **Type: Secret**: Oculta el valor en la interfaz (recomendado para SECRET_KEY).

---

¿Necesitas ayuda con algún paso específico?
