# CARTA DEL PROYECTO
## Sistema de Gestión Forestal ALISAR

| Campo | Detalle |
|---|---|
| **Nombre del Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Patrocinador** | ALISAR S.R.L. |
| **Gerente del Proyecto** | Equipo de Desarrollo ALISAR |
| **Fecha de Inicio** | Enero 2026 |
| **Fecha de Entrega** | Mayo 2026 |
| **Versión** | 1.0.0 |
| **Estado** | Completado |

---

## 1. PROPÓSITO DEL PROYECTO

ALISAR S.R.L. requiere un sistema de escritorio para centralizar y digitalizar la gestión de sus recursos forestales. Actualmente, los procesos se realizan de forma manual o con hojas de cálculo dispersas, lo que genera ineficiencias, errores y falta de trazabilidad.

Este proyecto entrega una aplicación de escritorio completa, segura y funcional que permite gestionar personal, maquinaria, obras forestales, inventario de madera, operaciones de rodeo y permisos/documentos, con acceso controlado por roles.

---

## 2. OBJETIVOS DEL PROYECTO

| # | Objetivo | Indicador de Éxito |
|---|---|---|
| 1 | Digitalizar la gestión de personal forestal | Módulo de personal operativo con CRUD completo |
| 2 | Controlar el inventario de maquinaria | Módulo de maquinaria con alertas de mantenimiento |
| 3 | Gestionar obras y proyectos forestales | Seguimiento de progreso y presupuesto |
| 4 | Controlar inventario de madera | Registro de especies, volúmenes y stock |
| 5 | Registrar operaciones de rodeo | Módulo con geolocalización GPS |
| 6 | Gestionar permisos y documentos legales | Alertas de vencimiento de POAT y certificados |
| 7 | Garantizar seguridad de datos | Autenticación JWT + cifrado de contraseñas |
| 8 | Facilitar auditoría de cambios | Historial completo de modificaciones |

---

## 3. ALCANCE

### Incluido
- Aplicación de escritorio Windows (Electron + React + Node.js)
- 9 módulos funcionales: Dashboard, Personal, Maquinaria, Obras, Madera, Rodeos, Documentos, Historial, Configuración
- Base de datos local SQLite (sin dependencia de servidor externo)
- Exportación de reportes en PDF y Excel
- Integración con Google Maps para geolocalización
- Instalador Windows (.exe)
- Documentación de usuario y técnica

### Excluido
- Aplicación web o móvil
- Integración con sistemas ERP externos
- Módulo de facturación o contabilidad
- Soporte para sistemas operativos distintos a Windows

---

## 4. ENTREGABLES PRINCIPALES

| Entregable | Descripción | Fecha |
|---|---|---|
| Aplicación instalable | ALISAR Setup.exe + ALISAR.exe portable | Mayo 2026 |
| Código fuente | Repositorio Git completo | Mayo 2026 |
| Documentación de usuario | QUICK_START.md, INSTALLATION_GUIDE.md | Mayo 2026 |
| Documentación técnica | README_DEV.md, ELECTRON_SETUP.md | Mayo 2026 |
| Base de datos inicializada | database.db con datos de muestra | Mayo 2026 |

---

## 5. SUPUESTOS Y RESTRICCIONES

### Supuestos
- El cliente dispone de equipos Windows (64-bit) con mínimo 4GB RAM
- Los usuarios tienen conocimientos básicos de informática
- Se utilizará SQLite como base de datos local para facilitar el despliegue
- La conectividad a internet es necesaria solo para la función de Google Maps

### Restricciones
- Presupuesto limitado: se priorizó software libre (React, Node.js, SQLite)
- Tiempo de desarrollo: 120+ horas en aproximadamente 5 meses
- Sin servidor en la nube: sistema completamente local por seguridad de datos forestales

---

## 6. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Cambio de requisitos durante el desarrollo | Media | Alto | Control de versiones Git, entregas iterativas |
| Incompatibilidad con versiones de Windows | Baja | Medio | Pruebas en Windows 7/10/11 |
| Pérdida de datos de la BD | Baja | Alto | Script de backup incluido |
| Resistencia al cambio por usuarios | Media | Medio | Guía de inicio rápido y capacitación |

---

## 7. PARTES INTERESADAS

| Parte Interesada | Rol | Interés |
|---|---|---|
| ALISAR S.R.L. | Patrocinador / Cliente | Sistema funcional y seguro |
| Administradores | Usuario primario | Gestión completa de módulos |
| Personal de campo | Usuario secundario | Consulta de información |
| Equipo de desarrollo | Ejecutor | Entrega según especificaciones |

---

## 8. APROBACIÓN

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Patrocinador | ALISAR S.R.L. | ______________ | Mayo 2026 |
| Gerente de Proyecto | Equipo Desarrollo | ______________ | Mayo 2026 |

---

*Documento generado: Junio 2026 | Versión 1.0*
