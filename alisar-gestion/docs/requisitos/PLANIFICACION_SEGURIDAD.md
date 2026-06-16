# PLANIFICACIÓN DE SEGURIDAD
## Sistema de Gestión Forestal ALISAR

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Febrero 2026 |
| **Versión** | 1.0 |

---

## 1. OBJETIVOS DE SEGURIDAD

1. Garantizar que solo usuarios autorizados accedan al sistema
2. Proteger la integridad y confidencialidad de los datos forestales
3. Mantener un registro auditado de todas las acciones realizadas
4. Prevenir accesos no autorizados desde la red local o internet

---

## 2. ANÁLISIS DE AMENAZAS

| Amenaza | Vector | Probabilidad | Impacto | Control |
|---|---|---|---|---|
| Acceso no autorizado | Contraseña débil o compartida | Media | Alto | Autenticación JWT + bcrypt |
| Robo de sesión | Token interceptado | Baja | Alto | Tokens con expiración + HTTPS en futuras versiones |
| Inyección SQL | Inputs no validados | Media | Alto | Consultas parametrizadas en SQLite |
| XSS (Cross-Site Scripting) | Inputs en frontend | Media | Medio | React escapa HTML por defecto |
| Acceso físico a BD | Robo de equipo | Baja | Alto | BD local en carpeta protegida del sistema |
| Escalación de privilegios | Manipulación de JWT | Baja | Alto | Verificación de firma JWT en cada request |

---

## 3. CONTROLES DE SEGURIDAD IMPLEMENTADOS

### 3.1 Autenticación
| Control | Implementación | Archivo |
|---|---|---|
| Hash de contraseñas | bcryptjs con 10 salt rounds | `backend/controllers/authController.js` |
| Tokens JWT | Expiración en 24 horas | `backend/middleware/auth.js` |
| Verificación en cada endpoint | Middleware de autenticación | `backend/middleware/auth.js` |
| Logout invalidación | Token eliminado en cliente | `frontend/src/context/AuthContext.js` |

### 3.2 Validación de Datos
| Control | Implementación | Archivo |
|---|---|---|
| Validación en frontend | 12 funciones de validación | `frontend/src/utils/validators.js` |
| Validación de CI ecuatoriana | Algoritmo de dígito verificador | `frontend/src/utils/validators.js` |
| Validación de email | Regex estándar RFC 5322 | `frontend/src/utils/validators.js` |
| Consultas parametrizadas | SQLite prepared statements | `backend/server.js` |
| Sanitización de inputs | React escaping automático | Todos los componentes |

### 3.3 Seguridad de Electron
| Control | Implementación | Archivo |
|---|---|---|
| Context isolation | `contextIsolation: true` | `public/electron.js` |
| Node integration desactivada | `nodeIntegration: false` | `public/electron.js` |
| Preload script | Exposición controlada de APIs | `public/preload.js` |
| CSP (Content Security Policy) | Headers de seguridad configurados | `public/electron.js` |

### 3.4 Base de Datos
| Control | Implementación |
|---|---|
| Sin contraseña de BD en código | Variables de entorno (.env) |
| BD solo accesible localmente | SQLite sin puerto de red |
| Respaldo de datos | Script reset.js para recuperación |

---

## 4. POLÍTICA DE CONTRASEÑAS

| Criterio | Requisito |
|---|---|
| Longitud mínima | 6 caracteres |
| Complejidad | Letras y números recomendados |
| Almacenamiento | Hash bcrypt (no texto plano NUNCA) |
| Cambio periódico | Recomendado cada 90 días |
| Contraseña por defecto | Debe cambiarse en primer acceso |

---

## 5. GESTIÓN DE ACCESOS

| Rol | Permisos |
|---|---|
| Administrador | Acceso completo a todos los módulos |
| Usuario estándar | Consulta y edición (sin eliminación) |
| Solo lectura | Consulta de datos (futuras versiones) |

---

## 6. AUDITORÍA Y TRAZABILIDAD

El sistema implementa un registro completo de auditoría:
- Tabla `audit_logs` en SQLite con cada operación
- Campos: usuario, acción, módulo, registro afectado, timestamp
- Visible desde el módulo "Historial de Cambios"
- Inmutable desde la interfaz de usuario

---

## 7. PLAN DE RESPUESTA A INCIDENTES

| Incidente | Respuesta | Tiempo |
|---|---|---|
| Contraseña comprometida | Cambio inmediato + revisión de audit log | < 1 hora |
| Pérdida de datos | Restauración desde backup de BD | < 4 horas |
| Acceso no autorizado detectado | Revisión de logs + cambio de credenciales | < 2 horas |
| Error crítico del sistema | Reinstalación desde instalador | < 1 hora |

---

## 8. CHECKLIST DE SEGURIDAD PARA DESPLIEGUE

- [x] Cambiar contraseña por defecto (admin/riberalta) en producción
- [x] Configurar JWT_SECRET fuerte en archivo .env
- [x] Verificar que la carpeta de BD no sea accesible públicamente
- [x] Asegurarse que el equipo tenga contraseña de Windows activa
- [x] Activar respaldos automáticos de la base de datos
- [x] Revisar permisos de archivos de la aplicación instalada

---

*Documento generado: Febrero 2026 | Plan de Seguridad v1.0*
