# ESPECIFICACIÓN TÉCNICA
## Sistema de Gestión Forestal ALISAR v1.0.0

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Marzo 2026 |
| **Versión** | 1.0 |

---

## 1. ENDPOINTS DE LA API REST

### Autenticación
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### Personal
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/personal` | Listar todo el personal | Sí |
| GET | `/api/personal/:id` | Obtener empleado por ID | Sí |
| POST | `/api/personal` | Crear nuevo empleado | Sí |
| PUT | `/api/personal/:id` | Actualizar empleado | Sí |
| DELETE | `/api/personal/:id` | Eliminar empleado | Sí |

### Maquinaria
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/maquinaria` | Listar maquinaria |
| POST | `/api/maquinaria` | Crear registro |
| PUT | `/api/maquinaria/:id` | Actualizar |
| DELETE | `/api/maquinaria/:id` | Eliminar |

*(Misma estructura para: `/api/obras`, `/api/madera`, `/api/rodeos`, `/api/documentos`)*

### Dashboard
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard/stats` | KPIs y métricas generales |
| GET | `/api/dashboard/alerts` | Alertas de documentos por vencer |

### Historial
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/audit-logs` | Listar historial completo |
| GET | `/api/audit-logs?modulo=Personal` | Filtrar por módulo |

---

## 2. ESTRUCTURA DE RESPUESTA DE LA API

### Éxito
```json
{
  "success": true,
  "data": [...],
  "message": "Operación exitosa"
}
```

### Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "code": 401
}
```

### Login exitoso
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

---

## 3. ESQUEMA DETALLADO DE LA BASE DE DATOS

### Tabla: personal
```sql
CREATE TABLE personal (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre              TEXT NOT NULL,
  cedula              TEXT UNIQUE,
  cargo               TEXT,
  departamento        TEXT,
  telefono            TEXT,
  email               TEXT,
  fecha_ingreso       TEXT,
  fecha_nacimiento    TEXT,
  direccion           TEXT,
  lat                 REAL,
  lng                 REAL,
  estado              TEXT DEFAULT 'activo',
  salario             REAL,
  tipo_contrato       TEXT,
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);
```

### Tabla: maquinaria
```sql
CREATE TABLE maquinaria (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre                TEXT NOT NULL,
  tipo                  TEXT,
  marca                 TEXT,
  modelo                TEXT,
  anio                  INTEGER,
  placa                 TEXT,
  numero_serie          TEXT,
  estado                TEXT DEFAULT 'operativo',
  ultimo_mantenimiento  TEXT,
  proximo_mantenimiento TEXT,
  responsable           TEXT,
  ubicacion             TEXT,
  observaciones         TEXT,
  created_at            TEXT DEFAULT (datetime('now'))
);
```

### Tabla: audit_logs
```sql
CREATE TABLE audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario     TEXT NOT NULL,
  accion      TEXT NOT NULL,  -- CREATE, UPDATE, DELETE
  modulo      TEXT NOT NULL,  -- Personal, Maquinaria, etc.
  registro_id INTEGER,
  detalle     TEXT,
  timestamp   TEXT DEFAULT (datetime('now'))
);
```

---

## 4. CONFIGURACIÓN DE ELECTRON

### electron.js — Configuración de ventana principal
```javascript
mainWindow = new BrowserWindow({
  width: 1280,
  height: 800,
  minWidth: 1024,
  minHeight: 600,
  webPreferences: {
    nodeIntegration: false,      // Seguridad: desactivado
    contextIsolation: true,      // Seguridad: activado
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### preload.js — APIs expuestas al renderer
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-version'),
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window')
});
```

---

## 5. CONFIGURACIÓN DE BUILD (electron-builder)

```json
{
  "appId": "com.alisar.desktop",
  "productName": "ALISAR",
  "win": {
    "target": ["nsis", "portable"],
    "arch": ["x64"]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true
  },
  "extraResources": [
    { "from": "backend/", "to": "backend/", "filter": ["**/*"] }
  ]
}
```

---

## 6. VALIDACIONES IMPLEMENTADAS (validators.js)

| Función | Descripción |
|---|---|
| `validateCedula(ci)` | Valida cédula ecuatoriana con algoritmo de dígito verificador |
| `validateEmail(email)` | Regex RFC 5322 |
| `validatePhone(phone)` | Formato +593 o 09XXXXXXXX |
| `validateDate(date)` | Fecha válida y no futura (para fecha ingreso) |
| `validatePercentage(val)` | Número entre 0 y 100 |
| `validatePassword(pass)` | Mínimo 6 caracteres |
| `validateRequired(val)` | Campo no vacío |
| `validatePositiveNumber(val)` | Número positivo |
| `validateYear(year)` | Año entre 1900 y año actual |
| `validateCoordinates(lat, lng)` | Rango válido de coordenadas geográficas |
| `isDateExpired(date)` | Retorna true si la fecha ya venció |
| `daysUntilExpiry(date)` | Días hasta vencimiento (negativo = vencido) |

---

## 7. REQUISITOS DE SISTEMA

| Componente | Mínimo | Recomendado |
|---|---|---|
| Sistema Operativo | Windows 7 SP1 (64-bit) | Windows 10/11 (64-bit) |
| RAM | 4 GB | 8 GB |
| Espacio en disco | 500 MB | 1 GB |
| Procesador | Intel Core i3 / equivalente | Intel Core i5 / equivalente |
| Resolución | 1024×768 | 1920×1080 |
| Conexión a internet | Opcional (solo Maps) | Recomendada |

---

## 8. VARIABLES DE ENTORNO (.env)

```env
NODE_ENV=production
BACKEND_PORT=4000
FRONTEND_PORT=3000
DB_PATH=./database.db
JWT_SECRET=alisar_secret_change_in_production
GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

*Documento generado: Marzo 2026 | Especificación Técnica v1.0*
