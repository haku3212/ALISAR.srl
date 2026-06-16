# RECOPILACIÓN Y ANÁLISIS DE REQUISITOS
## Sistema de Gestión Forestal ALISAR

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Enero–Febrero 2026 |
| **Versión** | 1.0 |

---

## 1. TÉCNICAS DE RECOPILACIÓN UTILIZADAS

- Entrevistas con personal administrativo de ALISAR S.R.L.
- Revisión de planillas Excel y registros manuales existentes
- Análisis de regulaciones forestales aplicables (POAT, permisos)
- Observación directa de procesos operativos

---

## 2. REQUISITOS FUNCIONALES

### RF-01: Autenticación y Seguridad
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-01.1 | El sistema debe requerir usuario y contraseña para acceder | Alta | ✅ Implementado |
| RF-01.2 | Las contraseñas deben almacenarse cifradas (bcrypt) | Alta | ✅ Implementado |
| RF-01.3 | La sesión debe expirar con token JWT | Alta | ✅ Implementado |
| RF-01.4 | Debe existir un usuario administrador por defecto | Media | ✅ Implementado |

### RF-02: Dashboard
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-02.1 | Mostrar KPIs principales de todos los módulos | Alta | ✅ Implementado |
| RF-02.2 | Mostrar alertas de documentos próximos a vencer | Alta | ✅ Implementado |
| RF-02.3 | Mostrar gráficas de métricas con Recharts | Media | ✅ Implementado |
| RF-02.4 | Actualización en tiempo real al navegar | Media | ✅ Implementado |

### RF-03: Módulo Personal
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-03.1 | Registro completo de empleados (nombre, CI, cargo, contacto) | Alta | ✅ Implementado |
| RF-03.2 | Operaciones CRUD completas | Alta | ✅ Implementado |
| RF-03.3 | Búsqueda y filtrado de personal | Alta | ✅ Implementado |
| RF-03.4 | Exportación de listado a Excel | Media | ✅ Implementado |
| RF-03.5 | Registro de ubicación con Google Maps | Baja | ✅ Implementado |

### RF-04: Módulo Maquinaria
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-04.1 | Catálogo de equipos y maquinaria | Alta | ✅ Implementado |
| RF-04.2 | Estado de maquinaria (operativo/mantenimiento/fuera de servicio) | Alta | ✅ Implementado |
| RF-04.3 | Fechas de último y próximo mantenimiento | Alta | ✅ Implementado |
| RF-04.4 | Alertas visuales para mantenimiento próximo | Media | ✅ Implementado |
| RF-04.5 | CRUD completo de maquinaria | Alta | ✅ Implementado |

### RF-05: Módulo Obras
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-05.1 | Registro de proyectos/obras forestales | Alta | ✅ Implementado |
| RF-05.2 | Seguimiento de porcentaje de avance | Alta | ✅ Implementado |
| RF-05.3 | Control de presupuesto asignado vs ejecutado | Alta | ✅ Implementado |
| RF-05.4 | Estado de obra (planificado/en ejecución/completado) | Alta | ✅ Implementado |

### RF-06: Módulo Madera
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-06.1 | Inventario de especies de madera | Alta | ✅ Implementado |
| RF-06.2 | Control de volúmenes (m³) y stock | Alta | ✅ Implementado |
| RF-06.3 | Registro de procedencia y destino | Media | ✅ Implementado |
| RF-06.4 | Alerta de stock mínimo | Media | ✅ Implementado |

### RF-07: Módulo Rodeos
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-07.1 | Registro de operaciones de extracción forestal | Alta | ✅ Implementado |
| RF-07.2 | Geolocalización de operaciones con Google Maps | Media | ✅ Implementado |
| RF-07.3 | Registro de personal y maquinaria involucrada | Alta | ✅ Implementado |
| RF-07.4 | Fecha y descripción de la operación | Alta | ✅ Implementado |

### RF-08: Módulo Documentos
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-08.1 | Registro de permisos POAT y certificados | Alta | ✅ Implementado |
| RF-08.2 | Control de fechas de vencimiento | Alta | ✅ Implementado |
| RF-08.3 | Alertas de documentos próximos a vencer (30/15/7 días) | Alta | ✅ Implementado |
| RF-08.4 | Estado de documentos (vigente/por vencer/vencido) | Alta | ✅ Implementado |

### RF-09: Historial de Cambios
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-09.1 | Registrar todas las operaciones CRUD del sistema | Alta | ✅ Implementado |
| RF-09.2 | Mostrar usuario, fecha, acción y registro afectado | Alta | ✅ Implementado |
| RF-09.3 | Filtrar historial por módulo y fechas | Media | ✅ Implementado |

### RF-10: Reportes y Exportación
| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-10.1 | Exportar listados a Excel (.xlsx) | Alta | ✅ Implementado |
| RF-10.2 | Generar reportes en PDF | Media | ✅ Implementado |

---

## 3. REQUISITOS NO FUNCIONALES

| ID | Categoría | Requisito | Estado |
|---|---|---|---|
| RNF-01 | Rendimiento | Carga de cualquier módulo en menos de 2 segundos | ✅ Cumplido |
| RNF-02 | Seguridad | Contraseñas cifradas con bcrypt (salt rounds: 10) | ✅ Cumplido |
| RNF-03 | Seguridad | Tokens JWT con expiración de 24 horas | ✅ Cumplido |
| RNF-04 | Usabilidad | Interfaz en español, intuitiva sin manual | ✅ Cumplido |
| RNF-05 | Compatibilidad | Windows 7, 8, 10, 11 (64-bit) | ✅ Cumplido |
| RNF-06 | Portabilidad | Versión portable (.exe) sin instalación | ✅ Cumplido |
| RNF-07 | Disponibilidad | Funcionamiento sin conexión a internet (excl. Maps) | ✅ Cumplido |
| RNF-08 | Mantenibilidad | Código estructurado con separación frontend/backend | ✅ Cumplido |
| RNF-09 | Escalabilidad | Arquitectura compatible con migración a PostgreSQL | ✅ Diseñado |

---

## 4. TRAZABILIDAD DE REQUISITOS

| Módulo | RF cubiertos | % Completado |
|---|---|---|
| Autenticación | RF-01.1–01.4 | 100% |
| Dashboard | RF-02.1–02.4 | 100% |
| Personal | RF-03.1–03.5 | 100% |
| Maquinaria | RF-04.1–04.5 | 100% |
| Obras | RF-05.1–05.4 | 100% |
| Madera | RF-06.1–06.4 | 100% |
| Rodeos | RF-07.1–07.4 | 100% |
| Documentos | RF-08.1–08.4 | 100% |
| Historial | RF-09.1–09.3 | 100% |
| Reportes | RF-10.1–10.2 | 100% |
| **TOTAL** | **37 requisitos** | **100%** |

---

*Documento generado: Febrero 2026 | Análisis de Requisitos v1.0 — COMPLETADO*
