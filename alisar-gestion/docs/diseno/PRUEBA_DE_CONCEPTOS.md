# PRUEBA DE CONCEPTOS (PoC)
## Sistema de Gestión Forestal ALISAR

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Febrero–Marzo 2026 |
| **Versión** | 1.0 |

---

## 1. OBJETIVO DE LA PRUEBA DE CONCEPTOS

Validar que el stack tecnológico seleccionado (Electron + React + Node.js + SQLite) es técnicamente viable para construir una aplicación de escritorio funcional, segura y desplegable en Windows antes de comprometer el esfuerzo de desarrollo completo.

---

## 2. HIPÓTESIS A VALIDAR

| # | Hipótesis | Resultado |
|---|---|---|
| H1 | Electron puede empaquetar React + Node.js en un solo .exe funcional | ✅ Validado |
| H2 | SQLite funciona correctamente embebido en Electron sin instalación separada | ✅ Validado |
| H3 | JWT puede implementarse de forma segura entre frontend React y backend Express | ✅ Validado |
| H4 | Google Maps API puede integrarse en una app Electron sin problemas de CSP | ✅ Validado |
| H5 | La exportación a Excel y PDF funciona en entorno de escritorio | ✅ Validado |

---

## 3. PROTOTIPO CONSTRUIDO

Se construyó un prototipo funcional con las siguientes características:

### 3.1 Estructura Base
- Proyecto Electron con frontend React embebido
- Backend Express corriendo como proceso hijo de Electron
- SQLite con 2 tablas de prueba (users, test_records)
- Comunicación Frontend ↔ Backend via HTTP local (localhost:4000)

### 3.2 Funcionalidades Probadas

**Autenticación JWT:**
```
POST /api/auth/login → { token: "eyJ..." }
GET /api/personal (con Bearer token) → 200 OK
GET /api/personal (sin token) → 401 Unauthorized
```

**SQLite embebido:**
```javascript
const db = await open({ filename: './database.db', driver: sqlite3.Database });
await db.run('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
// ✅ Funciona sin instalación de servidor de BD
```

**Electron ↔ React communication:**
```javascript
// preload.js - Bridge seguro
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-version')
});
// ✅ Context isolation funciona correctamente
```

**Exportación Excel:**
```javascript
import * as XLSX from 'xlsx';
const ws = XLSX.utils.json_to_sheet(data);
// ✅ Genera .xlsx válido en entorno desktop
```

### 3.3 Pantalla Prototipo
La pantalla de login con tema oscuro y colores corporativos (amarillo #FFD700 / negro) fue validada con usuarios de ALISAR antes de proceder al desarrollo completo.

---

## 4. PROBLEMAS ENCONTRADOS Y SOLUCIONES

| Problema | Solución Aplicada |
|---|---|
| CORS en Electron bloqueando requests | Configuración de CORS en Express con `origin: '*'` para localhost |
| SQLite nativo no compila en Windows sin Build Tools | Uso de paquete `better-sqlite3` → luego `sqlite3` con prebuilt binaries |
| Electron no encontraba el backend al hacer build | Backend spawned como proceso hijo desde `electron.js` con path relativo |
| Google Maps API key expuesta en frontend | Movida a .env con variable de entorno, cargada desde preload |
| Build de Electron incluía node_modules de desarrollo | `.gitignore` + `electron-builder` configurado para excluir devDependencies |

---

## 5. MÉTRICAS DE RENDIMIENTO DEL PROTOTIPO

| Métrica | Resultado |
|---|---|
| Tiempo de inicio de la aplicación | ~3 segundos |
| Tiempo de carga de datos (50 registros) | < 500ms |
| Tamaño del instalador | ~85MB |
| Memoria RAM en uso | ~180MB |
| CPU en reposo | < 2% |

---

## 6. DECISIÓN

**La Prueba de Conceptos fue EXITOSA.** Todos los componentes críticos del stack tecnológico fueron validados. Se aprueba proceder al desarrollo completo del sistema.

**Fecha de aprobación:** Marzo 2026
**Aprobado por:** Equipo de Desarrollo ALISAR

---

*Documento generado: Marzo 2026 | Prueba de Conceptos v1.0 — APROBADA*
