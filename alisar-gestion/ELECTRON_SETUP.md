# ALISAR Desktop - Configuración Electron

## Descripción

ALISAR Desktop es una aplicación de escritorio profesional desarrollada con Electron, React y Express. Integra el frontend moderno con el backend robusto en un ejecutable único para Windows.

## Requisitos Previos

- **Node.js**: v14 o superior (verificar con `node --version`)
- **npm**: v6 o superior (incluido con Node.js)
- **Windows**: 7 o superior (para usuarios finales)
- **RAM**: Mínimo 512MB
- **Espacio en disco**: Mínimo 500MB para la instalación

## Instalación para Desarrollo

### 1. Clonar o descargar el proyecto
```bash
cd alisar-gestion
```

### 2. Instalar dependencias
```bash
# Instalar dependencias raíz
npm install

# Instalar dependencias del frontend
cd frontend
npm install
cd ..

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 3. Ejecutar en modo desarrollo
```bash
# Opción 1: Ejecutar Electron con frontend en desarrollo
npm run electron-dev

# Opción 2: Ejecutar frontend y backend por separado (sin Electron)
npm run dev
```

## Construcción del Ejecutable

### 1. Buildear la aplicación
```bash
npm run build
```

Este comando:
- Crea una build optimizada del frontend (React)
- Prepara los archivos del backend
- Crea el paquete Electron

### 2. Crear el instalador
```bash
npm run electron-pack
```

O para crear solo un ejecutable portable:
```bash
npm run electron-build
```

### 3. Distribuir a usuarios
Los instaladores se generarán en la carpeta `dist/`:
- **ALISAR Setup.exe**: Instalador tradicional (recomendado)
- **ALISAR.exe**: Ejecutable portable (no requiere instalación)

## Estructura del Proyecto

```
alisar-gestion/
├── public/
│   ├── electron.js           # Proceso principal de Electron
│   ├── preload.js            # Script de preload (seguridad)
│   └── assets/               # Iconos y recursos
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── context/          # Context API
│   │   ├── services/         # Servicios (API)
│   │   └── utils/            # Utilidades
│   └── build/                # Build producción (generado)
├── backend/
│   ├── server.js             # Servidor Express
│   ├── routes/               # Rutas API
│   ├── controllers/          # Lógica de negocio
│   └── database.db           # Base de datos SQLite
├── package.json              # Configuración Electron y scripts
└── ELECTRON_SETUP.md         # Este archivo
```

## Scripts disponibles

| Script | Descripción |
|--------|------------|
| `npm run dev` | Ejecuta frontend y backend en paralelo |
| `npm run electron-dev` | Ejecuta Electron en modo desarrollo |
| `npm run build` | Buildea frontend y backend para producción |
| `npm run electron-pack` | Crea los instaladores (NSIS + Portable) |
| `npm run electron-build` | Crea solo instalador NSIS |
| `npm start` | Inicia solo el frontend |

## Configuración de Electron

### electron.js - Características principales

1. **Gestión de ventanas**: Crea y maneja la ventana principal
2. **Backend integrado**: Inicia automáticamente el servidor Express
3. **IPC Communication**: Comunica frontend y main process
4. **Menú de aplicación**: Menú File, View, Help
5. **DevTools**: Disponible en modo desarrollo

### preload.js - APIs expuestas

```javascript
window.electronAPI.getPlatform()   // Obtener SO
window.electronAPI.getVersion()    // Obtener versión de app
window.electronAPI.getAppPath()    // Obtener ruta de app
window.isElectron                  // Detectar si estamos en Electron
```

## Instalación para Usuarios Finales

### Instalador (ALISAR Setup.exe)

1. Descargar `ALISAR Setup.exe` desde la carpeta `dist/`
2. Ejecutar el instalador
3. Seleccionar carpeta de instalación
4. Completar la instalación
5. Se crea automáticamente un acceso directo en Inicio/Escritorio

### Ejecutable Portable (ALISAR.exe)

1. Descargar `ALISAR.exe` desde la carpeta `dist/`
2. No requiere instalación - ejecutar directamente
3. Crear acceso directo si se desea

## Solución de Problemas

### La aplicación no inicia
- Verificar que el puerto 4000 está disponible (backend)
- Verificar que el puerto 3000 está disponible en desarrollo
- Revisar los logs en consola (Ctrl+Shift+I en desarrollo)

### Backend no inicia
- Asegurarse de que la carpeta `backend` existe con `server.js`
- Verificar permisos de lectura/escritura en la carpeta
- Revisar si SQLite está correctamente inicializado

### Puerto ya en uso
```bash
# Windows - Encontrar proceso usando puerto 4000
netstat -ano | findstr :4000

# Matar el proceso (reemplazar PID)
taskkill /PID <PID> /F
```

### Frontend no carga en Electron
- Asegurar que el build de React fue generado (`frontend/build/`)
- Ejecutar `npm run build` nuevamente
- Limpiar caché: eliminar carpeta `node_modules` y `package-lock.json`

## Comandos para Build Completo

```bash
# Opción 1: Build automático
npm run electron-pack

# Opción 2: Build paso a paso
npm run build                    # Buildea frontend
npm run electron-build           # Crea instalador
npm run dist                     # Crea todos los formatos

# Opción 3: Solo ejecutable portable
npm run pack
```

## Configuración de electron-builder

El archivo `package.json` contiene la configuración de `electron-builder`:

```json
"build": {
  "appId": "com.alisar.desktop",
  "productName": "ALISAR",
  "win": {
    "target": ["nsis", "portable"]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

## Variables de Entorno

Crear un archivo `.env` en la raíz para configurar:

```env
NODE_ENV=production
REACT_APP_API_URL=http://localhost:4000
REACT_APP_BACKEND_PORT=4000
```

## Licencia

ISC

## Soporte

Para reportar problemas o sugerencias, contactar a ALISAR SRL.

## Versión

v1.0.0 - Mayo 2026
