# PLAN DE PRUEBAS DE CALIDAD
## Sistema de Gestión Forestal ALISAR v1.0.0

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Abril–Mayo 2026 |
| **Versión** | 1.0 |
| **Estado** | COMPLETADO |

---

## 1. OBJETIVO DEL PLAN DE PRUEBAS

Verificar que el Sistema ALISAR cumple con todos los requisitos funcionales y no funcionales definidos, garantizando calidad, seguridad y correcto funcionamiento antes del despliegue final.

---

## 2. NIVELES DE PRUEBA

### 2.1 Pruebas de Unidad

**Objetivo:** Verificar el correcto funcionamiento de funciones individuales.

#### Funciones de Validación (validators.js)

| ID | Función | Caso de Prueba | Entrada | Resultado Esperado | Estado |
|---|---|---|---|---|---|
| PU-01 | validateCedula | CI válida | "1234567890" | true | ✅ |
| PU-02 | validateCedula | CI con dígito incorrecto | "1234567899" | false | ✅ |
| PU-03 | validateEmail | Email válido | "test@alisar.com" | true | ✅ |
| PU-04 | validateEmail | Email sin @ | "testalisar.com" | false | ✅ |
| PU-05 | validatePassword | Contraseña válida | "abc123" | true | ✅ |
| PU-06 | validatePassword | Contraseña corta | "abc" | false | ✅ |
| PU-07 | validatePercentage | 0% válido | 0 | true | ✅ |
| PU-08 | validatePercentage | 100% válido | 100 | true | ✅ |
| PU-09 | validatePercentage | -1% inválido | -1 | false | ✅ |
| PU-10 | validatePercentage | 101% inválido | 101 | false | ✅ |
| PU-11 | isDateExpired | Fecha pasada | "2020-01-01" | true | ✅ |
| PU-12 | isDateExpired | Fecha futura | "2030-12-31" | false | ✅ |
| PU-13 | daysUntilExpiry | Vence en 30 días | fecha +30d | ~30 | ✅ |
| PU-14 | validateRequired | Campo vacío | "" | false | ✅ |
| PU-15 | validateRequired | Campo con valor | "texto" | true | ✅ |
| PU-16 | validatePositiveNumber | Número positivo | 5.5 | true | ✅ |
| PU-17 | validatePositiveNumber | Número negativo | -1 | false | ✅ |

#### Endpoints de API (backend)

| ID | Endpoint | Caso de Prueba | Estado |
|---|---|---|---|
| PU-18 | POST /api/auth/login | Credenciales correctas → token JWT | ✅ |
| PU-19 | POST /api/auth/login | Credenciales incorrectas → 401 | ✅ |
| PU-20 | GET /api/personal | Sin token → 401 Unauthorized | ✅ |
| PU-21 | GET /api/personal | Con token válido → 200 + lista | ✅ |
| PU-22 | POST /api/personal | Datos válidos → 201 Created | ✅ |
| PU-23 | PUT /api/personal/:id | ID inexistente → 404 | ✅ |
| PU-24 | DELETE /api/personal/:id | Eliminar existente → 200 | ✅ |

---

### 2.2 Pruebas de Funcionamiento

**Objetivo:** Verificar que cada módulo cumple con sus requisitos funcionales.

| ID | Módulo | Funcionalidad | Procedimiento | Resultado | Estado |
|---|---|---|---|---|---|
| PF-01 | Login | Autenticación válida | Ingresar admin/riberalta → acceder | Redirige a Dashboard | ✅ |
| PF-02 | Login | Autenticación inválida | Ingresar contraseña errónea | Muestra error | ✅ |
| PF-03 | Dashboard | KPIs visibles | Abrir Dashboard | Métricas de todos los módulos | ✅ |
| PF-04 | Dashboard | Alertas documentos | Tener doc a vencer | Alerta visible en dashboard | ✅ |
| PF-05 | Personal | Crear empleado | Completar formulario → Guardar | Registro en tabla | ✅ |
| PF-06 | Personal | Editar empleado | Clic Editar → Modificar → Guardar | Cambios reflejados | ✅ |
| PF-07 | Personal | Eliminar empleado | Clic Eliminar → Confirmar | Registro removido | ✅ |
| PF-08 | Personal | Buscar empleado | Escribir nombre en búsqueda | Filtrado en tiempo real | ✅ |
| PF-09 | Personal | Exportar Excel | Clic exportar | Archivo .xlsx descargado | ✅ |
| PF-10 | Maquinaria | CRUD completo | Crear/Editar/Eliminar | Operaciones exitosas | ✅ |
| PF-11 | Maquinaria | Alerta mantenimiento | Maquinaria con mant. próximo | Badge de alerta visible | ✅ |
| PF-12 | Obras | Control de avance | Editar porcentaje de avance | Barra de progreso actualizada | ✅ |
| PF-13 | Madera | Registro de stock | Crear registro con volumen | Aparece en inventario | ✅ |
| PF-14 | Rodeos | Selección GPS | Abrir mapa → seleccionar punto | Coordenadas guardadas | ✅ |
| PF-15 | Documentos | Alerta vencimiento | Documento a 15 días de vencer | Estado "Por Vencer" + alerta | ✅ |
| PF-16 | Historial | Registro de cambio | Crear/editar cualquier registro | Aparece en historial | ✅ |
| PF-17 | Configuración | Cambiar contraseña | Ingresar nueva contraseña | Login con nueva contraseña | ✅ |

---

### 2.3 Pruebas de Integración

**Objetivo:** Verificar la comunicación entre frontend, backend y base de datos.

| ID | Componentes | Escenario | Resultado | Estado |
|---|---|---|---|---|
| PI-01 | React ↔ Express | Request con JWT válido fluye correctamente | Respuesta 200 con datos | ✅ |
| PI-02 | Express ↔ SQLite | CRUD en BD retorna datos correctos al frontend | Datos sincronizados | ✅ |
| PI-03 | Login ↔ AuthContext | Token almacenado y usado en requests subsiguientes | Sesión persistente | ✅ |
| PI-04 | Formulario ↔ API ↔ BD | Crear registro → persiste en BD → visible en listado | Flujo completo OK | ✅ |
| PI-05 | Dashboard ↔ todas las tablas | KPIs reflejan datos reales de BD | Conteos correctos | ✅ |
| PI-06 | Audit log ↔ CRUD ops | Cada operación genera registro en audit_logs | Historial completo | ✅ |
| PI-07 | Electron ↔ Backend | App inicia backend al abrir, lo cierra al cerrar | Sin procesos huérfanos | ✅ |
| PI-08 | PDF export ↔ datos | PDF generado contiene datos actuales de BD | Contenido correcto | ✅ |

---

### 2.4 Pruebas de Regresión

**Objetivo:** Garantizar que cambios en una fase no rompan funcionalidades previas.

| ID | Escenario | Después de cambio en | Estado |
|---|---|---|---|
| PR-01 | Login sigue funcionando | Después de agregar módulo Rodeos | ✅ |
| PR-02 | Módulo Personal no afectado | Después de agregar módulo Documentos | ✅ |
| PR-03 | Historial registra nuevos módulos | Después de agregar Rodeos y Documentos | ✅ |
| PR-04 | Dashboard actualiza con nuevos módulos | Después de Rodeos y Documentos | ✅ |
| PR-05 | Export Excel no afectado | Después de cambios de UI en Fase 11 | ✅ |
| PR-06 | Validaciones siguen funcionando | Después de refactor de formularios | ✅ |

---

### 2.5 Prueba del Sistema

**Objetivo:** Validar el sistema completo como unidad integrada en un entorno real.

| ID | Escenario | Procedimiento | Estado |
|---|---|---|---|
| PS-01 | Instalación limpia | Instalar en PC sin nada previo | ✅ |
| PS-02 | Flujo completo de trabajo | Login → usar todos los módulos → logout | ✅ |
| PS-03 | Rendimiento con datos | 100+ registros por módulo → velocidad OK | ✅ |
| PS-04 | Reinicio del sistema | Cerrar y abrir app → datos persisten | ✅ |
| PS-05 | Sin internet | Desactivar red → app funciona (excepto Maps) | ✅ |
| PS-06 | Windows 10 | Prueba en Windows 10 64-bit | ✅ |
| PS-07 | Windows 11 | Prueba en Windows 11 64-bit | ✅ |
| PS-08 | Versión portable | ALISAR.exe sin instalación | ✅ |

---

### 2.6 Prueba de Aceptación de Usuario (UAT)

**Objetivo:** Validación final por parte del cliente / usuario final.

| ID | Caso | Usuario | Resultado | Estado |
|---|---|---|---|---|
| UAT-01 | El sistema es fácil de usar sin manual | Administrador | Navegación intuitiva confirmada | ✅ |
| UAT-02 | Los datos se guardan correctamente | Administrador | Persistencia validada por usuario | ✅ |
| UAT-03 | Las alertas de documentos funcionan | Administrador | Alertas visibles y correctas | ✅ |
| UAT-04 | Los reportes Excel son utilizables | Administrador | Formato compatible con Excel 2016+ | ✅ |
| UAT-05 | El sistema cumple con los requisitos del negocio | Patrocinador | Aprobado formalmente | ✅ |
| UAT-06 | La capacitación fue suficiente | Usuarios finales | Operan el sistema de forma autónoma | ✅ |

---

## 3. CRITERIOS DE ACEPTACIÓN

| Criterio | Meta | Resultado |
|---|---|---|
| Pruebas de unidad pasadas | 100% | 24/24 (100%) ✅ |
| Pruebas de funcionamiento pasadas | ≥ 95% | 17/17 (100%) ✅ |
| Pruebas de integración pasadas | 100% | 8/8 (100%) ✅ |
| Sin bugs bloqueantes | 0 | 0 ✅ |
| UAT aprobada por cliente | Sí | Sí ✅ |

---

## 4. DEFECTOS ENCONTRADOS Y CORREGIDOS

| ID | Descripción | Severidad | Estado |
|---|---|---|---|
| BUG-01 | Token no se renovaba correctamente en sesiones largas | Media | ✅ Corregido |
| BUG-02 | Exportación Excel fallaba con caracteres especiales (ñ, á) | Media | ✅ Corregido |
| BUG-03 | Dashboard no actualizaba KPIs sin recargar | Baja | ✅ Corregido |
| BUG-04 | Formulario Rodeos no validaba coordenadas negativas | Baja | ✅ Corregido |

---

## 5. CONCLUSIÓN

**Las pruebas de calidad han sido COMPLETADAS exitosamente.**

Todos los niveles de prueba fueron ejecutados y los criterios de aceptación fueron satisfechos. El sistema ALISAR v1.0.0 está **aprobado para despliegue en producción**.

**Fecha de aprobación:** Mayo 2026

---

*Documento generado: Mayo 2026 | Plan de Pruebas v1.0 — COMPLETADO*
