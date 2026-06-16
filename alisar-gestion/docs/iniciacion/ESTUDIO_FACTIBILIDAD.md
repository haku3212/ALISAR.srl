# ESTUDIO DE FACTIBILIDAD
## Sistema de Gestión Forestal ALISAR

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Enero 2026 |
| **Versión** | 1.0 |

---

## 1. DESCRIPCIÓN DEL PROBLEMA

ALISAR S.R.L. opera en el sector forestal gestionando personal, maquinaria, obras, inventario de madera, operaciones de rodeo y documentación legal (permisos POAT, certificados). Actualmente estos procesos se llevan en registros físicos o planillas Excel dispersas, lo que genera:

- Pérdida o duplicación de información
- Imposibilidad de consultar datos históricos de forma rápida
- Sin alertas para documentos vencidos (permisos forestales)
- Falta de trazabilidad de cambios
- Riesgo de incumplimiento regulatorio por vencimiento de permisos

---

## 2. SOLUCIONES EVALUADAS

### Opción A: Hoja de cálculo avanzada (Excel/Google Sheets)
| | |
|---|---|
| **Ventajas** | Bajo costo, familiar para usuarios |
| **Desventajas** | Sin control de acceso, sin alertas automáticas, sin auditoría, inconsistencia de datos |
| **Costo estimado** | $0 (ya disponible) |
| **Viabilidad** | No recomendado |

### Opción B: Sistema SaaS (Software como Servicio en la nube)
| | |
|---|---|
| **Ventajas** | Acceso desde cualquier lugar, mantenimiento incluido |
| **Desventajas** | Costo mensual recurrente, dependencia de internet, datos en servidor externo (problema de privacidad) |
| **Costo estimado** | $200–500/mes |
| **Viabilidad** | Viable pero costoso a largo plazo |

### Opción C: Aplicación de escritorio personalizada (SELECCIONADA)
| | |
|---|---|
| **Ventajas** | Sin costo recurrente, datos locales y seguros, adaptada exactamente a los procesos de ALISAR |
| **Desventajas** | Requiere inversión inicial en desarrollo |
| **Costo estimado** | Desarrollo interno (~120 horas) |
| **Viabilidad** | Alta — tecnologías libres y equipo disponible |

---

## 3. FACTIBILIDAD TÉCNICA

| Criterio | Evaluación |
|---|---|
| **Stack tecnológico** | React 18 + Node.js + Electron + SQLite — tecnologías maduras y ampliamente documentadas |
| **Infraestructura requerida** | PC Windows con 4GB RAM — sin servidor externo |
| **Equipo técnico** | Desarrolladores con experiencia en JavaScript/React/Node.js disponibles |
| **Integración** | SQLite no requiere instalación separada; Electron empaqueta todo en un .exe |
| **Escalabilidad** | Migración a PostgreSQL/MongoDB posible si se requiere multi-usuario en red |
| **Veredicto** | ✅ FACTIBLE |

---

## 4. FACTIBILIDAD ECONÓMICA

| Concepto | Detalle |
|---|---|
| **Costo de desarrollo** | ~120 horas de desarrollo (recurso interno) |
| **Costo de licencias** | $0 (React, Node.js, SQLite, Electron son open-source) |
| **Costo de despliegue** | $0 (instalador local, sin servidor) |
| **Costo de mantenimiento** | Mínimo (actualizaciones periódicas) |
| **Ahorro estimado** | Reducción de errores manuales + cumplimiento regulatorio evita multas |
| **Retorno de inversión** | Alto — el sistema se amortiza en el primer año de operación |
| **Veredicto** | ✅ FACTIBLE |

---

## 5. FACTIBILIDAD OPERACIONAL

| Criterio | Evaluación |
|---|---|
| **Aceptación de usuarios** | Sistema con interfaz intuitiva tipo panel de control |
| **Capacitación requerida** | Guía de inicio rápido + sesión de 1 hora por módulo |
| **Resistencia al cambio** | Media — mitigada con diseño familiar y soporte inicial |
| **Soporte técnico** | Equipo de desarrollo disponible para consultas post-entrega |
| **Veredicto** | ✅ FACTIBLE |

---

## 6. FACTIBILIDAD LEGAL

| Criterio | Evaluación |
|---|---|
| **Licencias de software** | Todas las dependencias son open-source (MIT, Apache 2.0) — sin restricciones comerciales |
| **Protección de datos** | Datos almacenados localmente; sin envío a terceros |
| **Cumplimiento regulatorio** | El módulo de Documentos gestiona vencimientos de POAT y permisos forestales |
| **Veredicto** | ✅ FACTIBLE |

---

## 7. CONCLUSIÓN Y RECOMENDACIÓN

**Se recomienda proceder con la Opción C: Aplicación de escritorio personalizada.**

La solución es técnica, económica, operacional y legalmente factible. Aprovecha tecnologías modernas y gratuitas, no genera costos recurrentes, y puede ser desarrollada por el equipo interno en aproximadamente 5 meses.

| Dimensión | Resultado |
|---|---|
| Técnica | ✅ Factible |
| Económica | ✅ Factible |
| Operacional | ✅ Factible |
| Legal | ✅ Factible |
| **Decisión Final** | **✅ PROYECTO APROBADO** |

---

*Documento generado: Enero 2026 | Estudio de Factibilidad v1.0*
