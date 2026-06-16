# PLAN DE SOPORTE POST-IMPLEMENTACIÓN
## Sistema de Gestión Forestal ALISAR v1.0.0

| Campo | Detalle |
|---|---|
| **Proyecto** | Sistema de Gestión de Recursos Forestales ALISAR |
| **Fecha** | Mayo 2026 |
| **Versión** | 1.0 |

---

## 1. ALCANCE DEL SOPORTE

Este plan cubre el soporte técnico y funcional del Sistema ALISAR desde su entrega oficial (Mayo 2026) hasta que se acuerde una nueva versión o contrato de mantenimiento.

---

## 2. NIVELES DE SOPORTE

### Nivel 1 — Soporte Usuario Final
**Responsable:** Personal capacitado de ALISAR S.R.L.
**Tiempo de respuesta:** Inmediato

| Tipo de Consulta | Acción |
|---|---|
| Cómo usar un módulo | Consultar QUICK_START.md o INSTALLATION_GUIDE.md |
| Contraseña olvidada | Administrador restablece desde módulo Configuración |
| Datos no aparecen | Verificar filtros activos en la búsqueda |
| Error de login | Verificar credenciales; si persiste escalar a Nivel 2 |

### Nivel 2 — Soporte Técnico
**Responsable:** Equipo de desarrollo ALISAR
**Tiempo de respuesta:** 24–48 horas hábiles

| Tipo de Problema | Acción |
|---|---|
| Error de la aplicación (crash) | Revisar logs de Electron + reiniciar aplicación |
| Corrupción de base de datos | Restaurar desde último respaldo de database.db |
| Problema de instalación | Re-ejecutar ALISAR Setup.exe como administrador |
| Error en exportación | Verificar permisos de escritura en carpeta de destino |

### Nivel 3 — Desarrollo / Correcciones
**Responsable:** Equipo de desarrollo
**Tiempo de respuesta:** 5–10 días hábiles

| Tipo de Problema | Acción |
|---|---|
| Bug en funcionalidad crítica | Parche urgente + nueva build |
| Mejora de funcionalidad existente | Evaluación + planificación de versión |
| Nueva funcionalidad requerida | Propuesta de proyecto / versión 2.0 |

---

## 3. CLASIFICACIÓN DE INCIDENTES

| Severidad | Descripción | Tiempo de Resolución |
|---|---|---|
| **Crítica** | Sistema no inicia / pérdida de datos | < 4 horas |
| **Alta** | Módulo completo no funciona | < 24 horas |
| **Media** | Funcionalidad específica con error | < 72 horas |
| **Baja** | Problema cosmético o de rendimiento menor | < 2 semanas |

---

## 4. PROCEDIMIENTO DE RESPALDO DE DATOS

### Respaldo Manual (Recomendado: Semanal)
```
1. Cerrar la aplicación ALISAR
2. Navegar a: C:\Program Files\ALISAR\
3. Copiar el archivo database.db
4. Guardarlo en: D:\Respaldos\ALISAR\database_YYYY-MM-DD.db
```

### Respaldo Automático (Recomendado: Configurar en Windows)
- Usar la tarea programada de Windows para copiar database.db cada noche
- Mantener mínimo 7 días de respaldos rotativos

---

## 5. PROCEDIMIENTO DE ACTUALIZACIÓN

Cuando se libere una nueva versión de ALISAR:
1. Descargar nuevo instalador desde el canal oficial
2. Hacer respaldo de database.db antes de actualizar
3. Ejecutar el nuevo instalador (actualiza la app, preserva la BD)
4. Verificar que todos los módulos funcionan correctamente
5. Si hay error, restaurar versión anterior y reportar al equipo

---

## 6. CONTACTO DE SOPORTE

| Tipo | Canal | Tiempo de Respuesta |
|---|---|---|
| Consultas generales | Email del equipo de desarrollo | 24–48 horas |
| Bugs críticos | Contacto directo / urgente | < 4 horas |
| Solicitudes de mejora | Email formal con descripción | 5 días hábiles |

---

## 7. MANTENIMIENTO PREVENTIVO RECOMENDADO

| Actividad | Frecuencia | Responsable |
|---|---|---|
| Respaldo de base de datos | Semanal | Administrador ALISAR |
| Revisión de alertas de documentos | Diaria | Administrador ALISAR |
| Limpieza de historial de auditoría | Trimestral | Administrador ALISAR |
| Revisión de usuarios activos | Mensual | Administrador ALISAR |
| Actualización de Windows del equipo | Mensual | IT ALISAR |
| Verificación de espacio en disco | Mensual | IT ALISAR |

---

*Documento generado: Mayo 2026 | Plan de Soporte v1.0*
