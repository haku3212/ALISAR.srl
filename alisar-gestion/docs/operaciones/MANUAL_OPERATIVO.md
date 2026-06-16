# MANUAL OPERATIVO
## Sistema de Gestión Forestal ALISAR v1.0.0

| Campo | Detalle |
|---|---|
| **Sistema** | ALISAR — Gestión de Recursos Forestales |
| **Versión** | 1.0.0 |
| **Audiencia** | Administradores y operadores del sistema |
| **Fecha** | Mayo 2026 |

---

## 1. INICIO DEL SISTEMA

### Arrancar la aplicación
1. Hacer doble clic en el icono **ALISAR** del escritorio
2. Esperar ~3 segundos mientras carga el backend
3. Aparecerá la pantalla de inicio de sesión

### Credenciales por defecto
| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `riberalta` |

> ⚠️ **Cambiar la contraseña por defecto inmediatamente después de la primera sesión.**

---

## 2. NAVEGACIÓN PRINCIPAL

La barra lateral izquierda contiene todos los módulos:

| Ícono | Módulo | Función |
|---|---|---|
| Dashboard | Panel principal | KPIs y alertas |
| Personal | Recursos Humanos | Gestión de empleados |
| Maquinaria | Equipos | Control de maquinaria |
| Obras | Proyectos | Seguimiento de obras forestales |
| Madera | Inventario | Stock de madera |
| Rodeos | Operaciones | Extracciones con GPS |
| Documentos | Permisos | POAT y certificados |
| Historial | Auditoría | Registro de cambios |
| Configuración | Config | Ajustes del sistema |

---

## 3. OPERACIONES COMUNES

### Crear un registro (aplica a todos los módulos)
1. Navegar al módulo correspondiente
2. Hacer clic en **"Nuevo"** o **"+ Agregar"**
3. Completar el formulario (campos marcados con * son obligatorios)
4. Hacer clic en **"Guardar"**
5. El registro aparecerá en la tabla inmediatamente

### Editar un registro
1. Localizar el registro en la tabla
2. Hacer clic en el ícono de **lápiz (editar)**
3. Modificar los campos necesarios
4. Hacer clic en **"Guardar"**

### Eliminar un registro
1. Localizar el registro en la tabla
2. Hacer clic en el ícono de **papelera (eliminar)**
3. Confirmar la acción en el diálogo de confirmación
4. El registro se elimina permanentemente

### Buscar registros
1. Usar la barra de búsqueda en la parte superior del módulo
2. Escribir nombre, número o cualquier campo del registro
3. Los resultados se filtran en tiempo real

### Exportar a Excel
1. Hacer clic en el botón **"Exportar Excel"**
2. El archivo se descarga automáticamente en la carpeta de descargas
3. Abrir con Microsoft Excel o Google Sheets

---

## 4. GESTIÓN DE ALERTAS

### Dashboard — Alertas de Documentos
El dashboard muestra automáticamente documentos que vencen próximamente:
- **Rojo:** Vencido o vence en menos de 7 días — ACCIÓN URGENTE
- **Naranja:** Vence en 8–15 días — ATENCIÓN REQUERIDA
- **Amarillo:** Vence en 16–30 días — PLANIFICAR RENOVACIÓN

### Alertas de Maquinaria
Los equipos con mantenimiento próximo muestran un indicador de color:
- **Verde:** Mantenimiento al día
- **Naranja:** Mantenimiento próximo (menos de 30 días)
- **Rojo:** Mantenimiento vencido

---

## 5. MÓDULO DE DOCUMENTOS — PROCEDIMIENTO

Para gestionar permisos POAT y certificados forestales:

1. Ir a **Documentos**
2. Clic en **"Nuevo Documento"**
3. Completar:
   - Nombre del documento
   - Tipo (POAT / Certificado / Permiso / etc.)
   - Número de documento
   - Fecha de emisión
   - **Fecha de vencimiento** ← MUY IMPORTANTE
4. Guardar
5. El sistema calculará automáticamente el estado y generará alertas

---

## 6. MÓDULO RODEOS — USAR GPS

1. Ir a **Rodeos** → **Nuevo Rodeo**
2. En el formulario, hacer clic en **"Seleccionar Ubicación"**
3. Se abrirá Google Maps
4. Hacer clic en el punto exacto de la operación en el mapa
5. Las coordenadas se llenan automáticamente
6. Completar el resto del formulario y guardar

> Requiere conexión a internet para cargar el mapa.

---

## 7. HISTORIAL DE CAMBIOS — AUDITORÍA

Para revisar qué cambios se han hecho:
1. Ir a **Historial**
2. Ver el registro cronológico de todas las operaciones
3. Filtrar por:
   - Módulo (Personal, Maquinaria, etc.)
   - Rango de fechas
   - Tipo de acción (Crear/Editar/Eliminar)
4. Exportar el historial si es necesario para auditorías

---

## 8. CONFIGURACIÓN DEL SISTEMA

### Cambiar contraseña de administrador
1. Ir a **Configuración**
2. Sección **"Cambiar Contraseña"**
3. Ingresar contraseña actual
4. Ingresar y confirmar nueva contraseña
5. Guardar

### Información de la empresa
1. Ir a **Configuración** → **"Datos de la Empresa"**
2. Actualizar nombre, RUC, dirección, logo
3. Esta información aparecerá en los reportes generados

---

## 9. PROCEDIMIENTOS DE EMERGENCIA

### La aplicación no inicia
1. Verificar que el equipo tiene Windows 64-bit
2. Intentar ejecutar como Administrador (clic derecho → "Ejecutar como administrador")
3. Si persiste, reinstalar desde ALISAR Setup.exe

### Se perdieron datos
1. Cerrar la aplicación inmediatamente
2. Localizar el respaldo más reciente de `database.db`
3. Copiar el archivo de respaldo a `C:\Program Files\ALISAR\`
4. Reiniciar la aplicación

### Error "No se puede conectar al servidor"
1. Esperar 10 segundos y recargar (la app inicia el backend en paralelo)
2. Si persiste, cerrar completamente la app (Task Manager → finalizar procesos ALISAR)
3. Volver a abrir la aplicación

---

## 10. OPERACIONES Y MANTENIMIENTO COMPLETADOS

| Actividad | Estado |
|---|---|
| Manual operativo entregado | ✅ |
| Personal capacitado | ✅ |
| Sistema en producción | ✅ |
| Respaldos configurados | ✅ |
| Plan de soporte activo | ✅ |
| Monitoreo de alertas operativo | ✅ |

---

*Manual Operativo ALISAR v1.0.0 | Mayo 2026*
