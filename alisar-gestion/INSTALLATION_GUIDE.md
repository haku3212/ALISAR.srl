# ALISAR - Guía de Instalación para Empresas

**Versión**: 1.0.0  
**Fecha**: Mayo 2026  
**Empresa**: ALISAR SRL  
**Destinatario**: Departamento de IT / Administración

---

## 📋 Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación Paso a Paso](#instalación-paso-a-paso)
3. [Configuración Inicial](#configuración-inicial)
4. [Verificación de Instalación](#verificación-de-instalación)
5. [Uso del Sistema](#uso-del-sistema)
6. [Solución de Problemas](#solución-de-problemas)
7. [Soporte Técnico](#soporte-técnico)

---

## Requisitos del Sistema

### Hardware Mínimo
- **Procesador**: Intel Core i5 o equivalente
- **RAM**: 4 GB mínimo (8 GB recomendado)
- **Espacio en Disco**: 500 MB libres mínimo
- **Pantalla**: Resolución 1024x768 mínimo (1920x1080 recomendada)

### Software
- **Sistema Operativo**: Windows 7, 8, 10 o 11 (64 bits)
- **Conexión**: Red local o internet para sincronización
- **.NET Framework**: v4.5+ (generalmente incluido)

### Privilegios
- Acceso de administrador para instalar la aplicación
- Permisos de lectura/escritura en C:\Program Files\ (o ubicación elegida)

---

## Instalación Paso a Paso

### Opción A: Instalador Estándar (Recomendado)

#### Paso 1: Obtener el instalador
1. Descargar `ALISAR Setup.exe` (versión actual)
2. Guardar en carpeta accesible (ej: Descargas, Escritorio)
3. Verificar que el archivo no está dañado

#### Paso 2: Ejecutar el instalador
1. **Hacer clic derecho** en `ALISAR Setup.exe`
2. **Seleccionar**: "Ejecutar como administrador"
3. **Aceptar** el aviso de Control de Cuentas de Usuario
4. **Esperar** a que cargue el asistente de instalación

#### Paso 3: Completar el asistente
1. **Seleccionar idioma**: Español (por defecto)
2. **Aceptar licencia**: Revisar y aceptar términos
3. **Seleccionar carpeta**: 
   - Por defecto: `C:\Program Files\ALISAR`
   - O elegir otra ubicación
4. **Seleccionar componentes** (dejar todos marcados):
   - [ ] Aplicación principal
   - [ ] Base de datos
   - [ ] Accesos directos
5. **Instalar**: Hacer clic en "Instalar"
6. **Esperar**: La instalación toma 2-3 minutos

#### Paso 4: Finalizar
1. Al completar, marcar "Ejecutar ALISAR"
2. O hacer clic en "Finalizar" para terminar
3. Se crean accesos directos en:
   - Escritorio
   - Menú Inicio > ALISAR
   - Menú Inicio > Programas

### Opción B: Instalador Portable (Sin instalación)

1. Descargar `ALISAR.exe` (versión portable)
2. Copiar a carpeta deseada
3. **Hacer doble clic** para ejecutar
4. La aplicación inicia inmediatamente
5. No requiere instalación previa
6. Crear acceso directo (clic derecho > Crear acceso directo)

---

## Configuración Inicial

### Primera Ejecución

#### 1. Pantalla de Bienvenida
```
┌─────────────────────────────────────────┐
│        BIENVENIDO A ALISAR v1.0         │
├─────────────────────────────────────────┤
│                                         │
│    Usuario: admin                       │
│    Contraseña: ••••••••                 │
│                                         │
│    [    Ingresar    ]    [Recordar]    │
│                                         │
└─────────────────────────────────────────┘
```

**Credenciales Iniciales**:
- **Usuario**: `admin`
- **Contraseña**: `riberalta`

#### 2. Dashboard Inicial
- Sistema inicia en Dashboard principal
- Muestra resumen de operaciones
- Todos los módulos disponibles en el menú lateral

### Configuración Recomendada

#### Cambiar contraseña de admin
1. Ir a **Configuración** (ícono de engranaje)
2. Seleccionar pestaña **Seguridad**
3. Hacer clic en **Cambiar Contraseña**
4. Ingresar contraseña actual: `riberalta`
5. Ingresar nueva contraseña (mínimo 8 caracteres)
6. Confirmar nueva contraseña
7. Guardar cambios

#### Datos de la Empresa
1. Ir a **Configuración**
2. Pestaña **Información General**
3. Completar datos:
   - Nombre de la empresa: ALISAR SRL
   - Ubicación principal
   - Teléfono de contacto
   - Email de contacto
4. Guardar cambios

#### Usuarios Adicionales
1. Ir a **Configuración**
2. Pestaña **Usuarios**
3. Click en **Nuevo Usuario**
4. Completar formulario:
   - Nombre completo
   - Email
   - Usuario (login)
   - Rol (Admin, Manager, Operador)
5. Sistema genera contraseña temporal
6. Guardar y comunicar credenciales al usuario

---

## Verificación de Instalación

### Checklist de Verificación

- [ ] ALISAR inicia sin errores
- [ ] Acceso de administratorcon usuario `admin`
- [ ] Dashboard muestra correctamente
- [ ] Se ven todos los módulos en el menú
- [ ] Base de datos se crea en: `C:\Program Files\ALISAR\database.db`
- [ ] Puedo ver datos en al menos un módulo
- [ ] Puedo crear un nuevo registro
- [ ] Exportación a Excel funciona
- [ ] Generación de PDF funciona
- [ ] Sistema responde rápidamente

### Verificación de Base de Datos

**Ubicación**: `C:\Program Files\ALISAR\database.db`

Para administradores con conocimiento técnico:
```bash
# Abrir desde línea de comandos
sqlite3 "C:\Program Files\ALISAR\database.db"

# Ver tablas
.tables

# Ver registros de personal
SELECT * FROM personal;

# Salir
.quit
```

---

## Uso del Sistema

### Estructura de Menú

```
┌─ ALISAR Dashboard ────────────────────┐
│                                       │
│ [+] Dashboard        ← Panel general  │
│ [+] Personal         ← RR.HH.        │
│ [+] Maquinaria       ← Equipos       │
│ [+] Obras            ← Proyectos     │
│ [+] Madera           ← Inventario    │
│ [+] Rodeos           ← Operaciones   │
│ [+] Documentos       ← Permisos      │
│ [+] Historial        ← Auditoría     │
│ [⚙] Configuración    ← Ajustes      │
│                                       │
│ ┌──────────────────────────────────┐ │
│ │ Usuario: admin                   │ │
│ │ [← Cerrar Sesión]                │ │
│ └──────────────────────────────────┘ │
└───────────────────────────────────────┘
```

### Operaciones Comunes

#### Crear un Registro
1. Click en módulo deseado (ej: Personal)
2. Click en botón **Nuevo Personal** (amarillo)
3. Completar formulario:
   - Campos requeridos (en rojo)
   - Campos opcionales (en gris)
4. Validaciones en tiempo real
5. Click en **Crear**
6. Confirmación: "Registro creado exitosamente"

#### Editar un Registro
1. En tabla, buscar el registro
2. Click en ícono **editar** (lápiz azul)
3. Modificar campos necesarios
4. Click en **Actualizar**
5. Confirmación: "Registro actualizado"

#### Eliminar un Registro
1. En tabla, buscar el registro
2. Click en ícono **eliminar** (basura roja)
3. Confirmar en cuadro de diálogo
4. Registro se elimina inmediatamente
5. ⚠️ Acción irreversible

#### Buscar Registros
1. Usar barra de búsqueda en la parte superior
2. Escribir texto a buscar
3. Búsqueda es en tiempo real
4. Presionar ENTER para confirmar
5. Resultados se muestran automáticamente

#### Exportar a Excel
1. En módulo deseado
2. Click en botón **Excel** (azul)
3. Archivo se descarga automáticamente
4. Abrir con Microsoft Excel
5. Editar como cualquier hoja de cálculo

#### Generar Reporte PDF
1. En módulo deseado (si disponible)
2. Click en botón **PDF**
3. PDF se genera y se abre
4. Hacer clic en **Guardar** o **Imprimir**

---

## Solución de Problemas

### Problema 1: "No se puede iniciar ALISAR"

**Síntomas**: Error al ejecutar, ventana no abre

**Soluciones**:
1. **Reiniciar computadora** y volver a intentar
2. **Verificar permisos**: 
   - Clic derecho en ALISAR.exe > Propiedades
   - Pestaña Compatibilidad
   - Marcar "Ejecutar este programa como administrador"
   - Aplicar y OK
3. **Limpiar datos temporales**:
   - Ir a: `C:\Users\[Usuario]\AppData\Local\ALISAR`
   - Eliminar carpeta `cache`
   - Reintentar

### Problema 2: "Error de conexión al servidor"

**Síntomas**: Mensaje "No se puede conectar a la base de datos"

**Soluciones**:
1. **Verificar que el servicio esté activo**:
   - El sistema inicia automáticamente
   - Esperar 5 segundos a que se inicie completamente
2. **Reiniciar la aplicación**:
   - Cerrar completamente
   - Esperar 10 segundos
   - Abrir nuevamente
3. **Verificar puerto**:
   - El sistema usa puertos 3000 y 4000
   - Verificar que no estén bloqueados por firewall

### Problema 3: "Olvidé la contraseña"

**Soluciones**:
1. **Usuario admin**:
   - Contactar al administrador del sistema
   - Realizar reseteo desde línea de comandos (requiere acceso técnico)

2. **Usuarios normales**:
   - Contactar al administrador
   - Admin puede resetear la contraseña desde Configuración

### Problema 4: "La base de datos se corrupto"

**Síntomas**: Errores al acceder a datos, datos faltantes

**Soluciones**:
1. **Backup automático**:
   - El sistema crea backups automáticamente
   - Ubicación: `C:\Program Files\ALISAR\backups\`
   
2. **Restaurar desde backup**:
   - Contactar al administrador técnico
   - Restauración requiere acceso de línea de comandos

3. **Contactar soporte** si el problema persiste

### Problema 5: "La aplicación va muy lenta"

**Síntomas**: Responde lentamente, tarda en cargar datos

**Soluciones**:
1. **Cerrar otras aplicaciones** para liberar memoria
2. **Reiniciar el sistema operativo**
3. **Verificar espacio en disco** (debe haber >100MB libres)
4. **Verificar RAM disponible** (Panel de Control > Sistema)
5. **Actualizar antivirus** (a veces ralentiza el sistema)

---

## Soporte Técnico

### Información de Soporte

| Canal | Detalles |
|-------|----------|
| **Email** | soporte@alisar.com |
| **Teléfono** | +591 3 XXX XXXX |
| **Horario** | Lunes-Viernes, 8:00-17:00 |
| **Emergencias** | +591 7XXX XXXX (24/7) |

### Información para Reportar Problemas

Al contactar soporte, proporcionar:
1. **Descripción clara** del problema
2. **Pasos para reproducir** el error
3. **Captura de pantalla** del error (si es visible)
4. **Versión del sistema**: Ir a Configuración > Acerca de
5. **Información del sistema**:
   - Windows: Presionar Win+R, escribir `msinfo32`
   - Espacio en disco disponible
   - Cantidad de RAM disponible

### Base de Conocimiento

Preguntas frecuentes disponibles en:
- `https://alisar.com/help/`
- Documentación incluida en el disco de instalación
- Manual en PDF: `ALISAR_Manual_Usuario.pdf`

---

## Actualización del Sistema

### Verificar Versión Instalada
1. Abrir ALISAR
2. Ir a **Configuración** > **Acerca de**
3. Versión mostrada (ej: v1.0.0)

### Actualizar a Nueva Versión
1. Descargar nuevo instalador `ALISAR Setup.exe` (versión nueva)
2. Ejecutar como administrador
3. Seleccionar "Actualizar" (si está disponible la opción)
4. O desinstalar e instalar nueva versión
5. Los datos se preservan automáticamente

### Respaldar Datos Antes de Actualizar
```
Copiar: C:\Program Files\ALISAR\database.db
Guardar en: carpeta externa/USB
```

---

## Notas Importantes

⚠️ **Advertencias**:
- **No eliminar** la carpeta C:\Program Files\ALISAR manualmente
- **No compartir** credenciales de admin
- **Respaldar datos** regularmente
- **No desactivar** antivirus (puede causar problemas de seguridad)

✅ **Buenas Prácticas**:
- Cambiar contraseña de admin cada 90 días
- Crear usuarios con roles específicos (no usar admin para todo)
- Revisar Historial de cambios regularmente
- Exportar datos a Excel como backup adicional
- Mantener el sistema operativo actualizado

---

## Contacto

**ALISAR SRL**  
Dirección: [Dirección de la empresa]  
Teléfono: [Teléfono principal]  
Email: [Email de contacto]  

**Gerente de Proyecto**: [Nombre]  
Email: [Email del gerente]

---

**Fecha de Creación**: Mayo 2026  
**Versión del Documento**: 1.0  
**Próxima Revisión**: Agosto 2026

---

© 2026 ALISAR SRL. Todos los derechos reservados.
