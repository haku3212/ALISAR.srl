# DISEÑO GENERAL — ARQUITECTURA DEL SISTEMA
## Sistema de Gestión Forestal ALISAR

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Febrero 2026 |
| **Versión** | 1.0 |

---

## 1. VISIÓN GENERAL DE LA ARQUITECTURA

ALISAR utiliza una arquitectura de tres capas dentro de una aplicación de escritorio Electron:

```
┌─────────────────────────────────────────────────────────────┐
│                    ELECTRON (Desktop Shell)                 │
│  ┌───────────────────────┐  ┌───────────────────────────┐  │
│  │   FRONTEND (React 18) │  │  BACKEND (Node.js/Express) │  │
│  │                       │  │                           │  │
│  │  ┌─────────────────┐  │  │  ┌─────────────────────┐  │  │
│  │  │   Components    │  │  │  │    API REST (50+)    │  │  │
│  │  │   - Dashboard   │  │◄─┼─►│    endpoints        │  │  │
│  │  │   - Personal    │  │  │  ├─────────────────────┤  │  │
│  │  │   - Maquinaria  │  │  │  │   Middleware JWT     │  │  │
│  │  │   - Obras       │  │  │  ├─────────────────────┤  │  │
│  │  │   - Madera      │  │  │  │   Controllers        │  │  │
│  │  │   - Rodeos      │  │  │  ├─────────────────────┤  │  │
│  │  │   - Documentos  │  │  │  │   SQLite Database   │  │  │
│  │  │   - Historial   │  │  │  │   (9 tablas)        │  │  │
│  │  │   - Config      │  │  │  └─────────────────────┘  │  │
│  │  └─────────────────┘  │  │                           │  │
│  │  ┌─────────────────┐  │  │                           │  │
│  │  │  Context (Auth, │  │  │                           │  │
│  │  │  Toast)         │  │  │                           │  │
│  │  └─────────────────┘  │  │                           │  │
│  └───────────────────────┘  └───────────────────────────┘  │
│                                                             │
│  Puerto Frontend: 3000          Puerto Backend: 4000        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICO

### Capa de Presentación (Frontend)
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.2.0 | Framework UI principal |
| React Router DOM | 6.22.0 | Navegación SPA |
| Recharts | 3.8.1 | Gráficas y visualizaciones |
| Axios | 1.16.1 | Cliente HTTP para API |
| jsPDF + html2pdf | 4.2.1 | Generación de reportes PDF |
| XLSX | 0.18.5 | Exportación a Excel |
| Lucide React | Latest | Iconografía |
| React Toastify | Latest | Notificaciones |

### Capa de Negocio (Backend)
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | LTS | Runtime JavaScript servidor |
| Express.js | 5.2.1 | Framework API REST |
| jsonwebtoken | 9.0.3 | Autenticación JWT |
| bcryptjs | 3.0.3 | Hash de contraseñas |
| CORS | 2.8.6 | Control de origen cruzado |

### Capa de Datos
| Tecnología | Versión | Uso |
|---|---|---|
| SQLite3 | 6.0.1 | Base de datos local embebida |
| sqlite | 5.1.1 | Wrapper async para SQLite3 |

### Capa de Escritorio
| Tecnología | Versión | Uso |
|---|---|---|
| Electron | 28.x | Contenedor de aplicación de escritorio |
| electron-builder | Latest | Empaquetado e instalador |

---

## 3. MODELO DE DATOS — ESQUEMA DE BASE DE DATOS

```sql
-- 9 Tablas principales

users          → id, username, password_hash, role, created_at
personal       → id, nombre, cedula, cargo, telefono, email, 
                 fecha_ingreso, direccion, lat, lng, estado, ...
maquinaria     → id, nombre, tipo, marca, modelo, anio, placa,
                 estado, ultimo_mantenimiento, proximo_mantenimiento
obras          → id, nombre, descripcion, ubicacion, fecha_inicio,
                 fecha_fin, presupuesto, avance_porcentaje, estado
madera         → id, especie, volumen_m3, procedencia, destino,
                 fecha_registro, stock_minimo, estado
rodeos         → id, nombre, descripcion, fecha, ubicacion,
                 lat, lng, responsable, maquinaria_id, estado
documentos     → id, nombre, tipo, numero, fecha_emision,
                 fecha_vencimiento, estado, descripcion
audit_logs     → id, usuario, accion, modulo, registro_id,
                 detalle, timestamp
config         → id, clave, valor
```

---

## 4. FLUJO DE AUTENTICACIÓN

```
Usuario → Login Form → POST /api/auth/login
                            │
                    ┌───────▼───────┐
                    │  Verificar    │
                    │  usuario en   │
                    │  BD           │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  bcrypt.compare│
                    │  password     │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  JWT.sign()   │
                    │  (24h exp)    │
                    └───────┬───────┘
                            │
              Token → AuthContext → localStorage
                            │
              Todos los requests con:
              Authorization: Bearer <token>
```

---

## 5. ESTRUCTURA DE CARPETAS

```
alisar-gestion/
├── frontend/
│   └── src/
│       ├── components/         # Módulos de UI
│       │   ├── common/         # Componentes reutilizables
│       │   ├── forms/          # Formularios detallados
│       │   └── layout/         # Sidebar, layout
│       ├── context/            # AuthContext, ToastContext
│       ├── hooks/              # useCRUD hook
│       ├── services/           # api.js (Axios)
│       ├── utils/              # validators, reportGenerator
│       └── config/             # theme.js
├── backend/
│   ├── server.js               # Punto de entrada + BD + rutas
│   ├── routes/                 # auth.js
│   ├── controllers/            # authController.js
│   ├── middleware/             # auth.js (JWT verify)
│   └── models/                 # User.js
├── public/
│   ├── electron.js             # Proceso principal Electron
│   └── preload.js              # Bridge de seguridad
├── docs/                       # Toda la documentación del proyecto
└── scripts/
    └── build-electron.js       # Script de build
```

---

## 6. PATRONES DE DISEÑO UTILIZADOS

| Patrón | Implementación |
|---|---|
| **MVC** | Controllers (M+C) + React Components (V) |
| **Context Provider** | AuthContext + ToastContext para estado global |
| **Custom Hooks** | `useCRUD` para operaciones CRUD reutilizables |
| **RESTful API** | Endpoints HTTP estándar (GET/POST/PUT/DELETE) |
| **Repository Pattern** | server.js centraliza acceso a BD |
| **Component Composition** | Componentes common/ reutilizados en todos los módulos |

---

## 7. COLORES CORPORATIVOS (TEMA)

| Variable | Color | Hex |
|---|---|---|
| Primary | Amarillo corporativo | `#FFD700` |
| Background | Negro oscuro | `#000000` |
| Surface | Gris oscuro | `#1a1a1a` |
| Text Primary | Blanco | `#FFFFFF` |
| Text Secondary | Gris claro | `#AAAAAA` |
| Success | Verde | `#4CAF50` |
| Warning | Naranja | `#FF9800` |
| Danger | Rojo | `#F44336` |

---

*Documento generado: Febrero 2026 | Diseño General v1.0*
