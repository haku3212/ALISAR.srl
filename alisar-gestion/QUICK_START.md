# ALISAR - Guía Rápida de Inicio

## Para Usuarios Finales (Sin conocimiento técnico)

### Instalación

1. **Descargar el instalador**
   - Obtener `ALISAR Setup.exe` desde el USB o descarga
   
2. **Ejecutar el instalador**
   - Hacer doble clic en `ALISAR Setup.exe`
   - Seleccionar ubicación de instalación (por defecto: C:\Program Files\ALISAR)
   - Hacer clic en "Instalar"
   - Esperar a que finalice (2-3 minutos)

3. **Iniciar la aplicación**
   - Se crea automáticamente un acceso directo en el Escritorio
   - O buscar "ALISAR" en el menú Inicio
   - Hacer doble clic para abrir

### Uso Básico

#### Login
- **Usuario**: `admin`
- **Contraseña**: `riberalta`

#### Módulos principales

1. **Dashboard** - Panel de control con resumen de operaciones
2. **Personal** - Gestión de empleados y recursos humanos
3. **Maquinaria** - Control de equipos y mantenimiento
4. **Obras** - Seguimiento de proyectos forestales
5. **Madera** - Inventario de productos madereros
6. **Rodeos** - Registro de operaciones de extracción
7. **Documentos** - Gestión de permisos y certificados
8. **Historial** - Auditoría de cambios del sistema
9. **Configuración** - Ajustes de la aplicación

#### Operaciones CRUD

**Crear nuevo registro**
- Click en botón "Nuevo [Módulo]"
- Completar formulario
- Click en "Crear"

**Editar registro**
- Click en botón editar (lápiz) en la fila del registro
- Modificar datos
- Click en "Actualizar"

**Eliminar registro**
- Click en botón eliminar (basura) en la fila del registro
- Confirmar eliminación

**Buscar**
- Usar barra de búsqueda en la parte superior
- Escribir texto a buscar
- Resultados se filtran automáticamente

**Exportar a Excel**
- Click en botón "Excel"
- Archivo se descarga automáticamente
- Abrir con Microsoft Excel

**Generar PDF**
- Click en botón correspondiente en cada módulo
- PDF se genera automáticamente
- Guardar o imprimir según sea necesario

---

## Para Desarrolladores

### Configuración del Ambiente

#### 1. Requisitos
```bash
Node.js v14+
npm v6+
Git (opcional)
```

#### 2. Instalación
```bash
# Clonar o descargar el proyecto
cd alisar-gestion

# Instalar todas las dependencias
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

#### 3. Ejecutar en desarrollo
```bash
# Opción A: Frontend + Backend
npm run dev

# Opción B: Con Electron
npm run electron-dev
```

#### 4. Estructura de código

**Frontend** (`frontend/src/`)
```
components/
  ├── Login.js              # Componente de autenticación
  ├── Dashboard.js          # Panel principal
  ├── Personal.js           # Módulo de personal
  ├── Maquinaria.js         # Módulo de maquinaria
  ├── Obras.js              # Módulo de obras
  ├── Madera.js             # Módulo de madera
  ├── Rodeos.js             # Módulo de rodeos
  ├── Documentos.js         # Módulo de documentos
  ├── ChangeHistory.js      # Historial de cambios
  ├── Settings.js           # Configuración
  └── forms/                # Formularios detallados
context/
  ├── AuthContext.js        # Contexto de autenticación
  └── ToastContext.js       # Contexto de notificaciones
services/
  └── api.js                # Cliente HTTP centralizado
utils/
  ├── validators.js         # Validaciones de formularios
  ├── reportGenerator.js    # Generación de PDFs
  └── constants.js          # Constantes globales
```

**Backend** (`backend/`)
```
server.js                # Punto de entrada
routes/
  └── auth.js            # Rutas de autenticación
controllers/
  └── authController.js  # Lógica de login
middleware/
  └── auth.js            # Middleware JWT
database.db             # Base de datos SQLite
```

#### 5. Debugging

**Frontend**
```bash
# Ver consola
Ctrl + Shift + I (en Electron)

# Ver errores
Revisar pestaña Console en DevTools
```

**Backend**
```bash
# Ver logs
Revisar output de terminal donde se ejecutó npm run dev
```

#### 6. Tecnologías principales

- **Frontend**: React 18, React Router, Axios
- **Backend**: Express.js, JWT, bcryptjs
- **Base de datos**: SQLite3
- **Desktop**: Electron, electron-builder
- **Reportes**: jsPDF, html2pdf, xlsx
- **Gráficos**: Recharts
- **UI**: Lucide React, Styled Components (inline)

---

## Troubleshooting

### Problema: "La aplicación se bloquea al abrir"
**Solución**:
1. Cerrar la aplicación
2. Esperar 30 segundos
3. Volver a abrir
4. Si persiste, desinstalar y reinstalar

### Problema: "No puedo conectarme al servidor"
**Solución**:
- Verificar conexión a internet
- Reiniciar el router
- Reiniciar la aplicación

### Problema: "Olvidé la contraseña"
**Solución**:
- Contactar al administrador del sistema
- Usar credenciales de respaldo si están disponibles

### Problema: "Los datos no se guardan"
**Solución**:
1. Verificar que llene todos los campos requeridos
2. Ver si hay mensajes de error (en rojo)
3. Esperar a que se muestre confirmación "Guardado exitosamente"
4. Si persiste, contactar al administrador

---

## Contacto y Soporte

Para problemas técnicos o sugerencias:
- **Email**: [contacto@alisar.com]
- **Teléfono**: [Número de soporte]
- **Portal de soporte**: [URL del portal]

---

**Versión**: 1.0.0  
**Última actualización**: Mayo 2026  
**Copyright**: ALISAR SRL
