# ALISAR Desktop - Guía de Desarrollo

## 🎯 Descripción General

ALISAR es un sistema integral de gestión de recursos forestales construido con tecnologías modernas:
- **Frontend**: React 18 con React Router y Recharts
- **Backend**: Express.js con autenticación JWT
- **Base de datos**: SQLite3
- **Desktop**: Electron con electron-builder
- **Reportes**: jsPDF y XLSX

---

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd alisar-gestion

# Instalar dependencias
npm install

# Instalar dependencias por carpeta
npm install --prefix frontend
npm install --prefix backend

# (Opcional) Instalar dependencias de desarrollo
npm install --save-dev concurrently wait-on
```

### Desarrollo

```bash
# Ejecutar frontend + backend juntos
npm run dev

# Ejecutar solo frontend (localhost:3000)
npm start --prefix frontend

# Ejecutar solo backend (localhost:4000)
npm start --prefix backend

# Ejecutar con Electron
npm run electron-dev
```

### Build Producción

```bash
# Build del frontend
npm run build --prefix frontend

# Build con Electron-Builder
npm run build
npm run electron-pack

# O ejecutar script de construcción
node scripts/build-electron.js
```

---

## 📁 Estructura del Proyecto

```
alisar-gestion/
│
├── frontend/                          # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js              # Autenticación
│   │   │   ├── Dashboard.js          # Panel principal
│   │   │   ├── Personal.js           # Módulo RH
│   │   │   ├── Maquinaria.js         # Módulo equipos
│   │   │   ├── Obras.js              # Módulo proyectos
│   │   │   ├── Madera.js             # Módulo inventario
│   │   │   ├── Rodeos.js             # Módulo operaciones
│   │   │   ├── Documentos.js         # Módulo permisos
│   │   │   ├── ChangeHistory.js      # Auditoría
│   │   │   ├── Settings.js           # Configuración
│   │   │   ├── forms/
│   │   │   │   ├── FormPersonalDetallado.js
│   │   │   │   ├── FormMaquinariaDetallado.js
│   │   │   │   ├── FormObrasDetallado.js
│   │   │   │   ├── FormMaderaDetallado.js
│   │   │   │   ├── FormRodeoDetallado.js
│   │   │   │   └── FormDocumentosDetallado.js
│   │   │   └── common/
│   │   │       ├── Modal.js
│   │   │       ├── LoadingSpinner.js
│   │   │       ├── ErrorMessage.js
│   │   │       ├── SearchBar.js
│   │   │       ├── FormInput.js
│   │   │       ├── Toast.js
│   │   │       └── ToastContainer.js
│   │   ├── context/
│   │   │   ├── AuthContext.js        # Autenticación global
│   │   │   └── ToastContext.js       # Notificaciones
│   │   ├── services/
│   │   │   └── api.js                # Cliente HTTP
│   │   ├── utils/
│   │   │   ├── validators.js         # Validaciones
│   │   │   ├── reportGenerator.js    # Generación PDF
│   │   │   └── theme.js              # Colores corporativos
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── package.json
│   └── build/                         # Generado por npm run build
│
├── backend/                           # Servidor Express
│   ├── server.js                     # Punto de entrada
│   ├── routes/
│   │   └── auth.js                   # Rutas autenticación
│   ├── controllers/
│   │   └── authController.js         # Lógica login
│   ├── middleware/
│   │   └── auth.js                   # JWT verificación
│   ├── database.db                   # SQLite (generado)
│   ├── reset.js                      # Script reseteo BD
│   └── package.json
│
├── public/                            # Archivos Electron
│   ├── electron.js                   # Proceso principal
│   ├── preload.js                    # Seguridad context
│   └── assets/
│       ├── icon.png
│       └── tray.png
│
├── scripts/
│   └── build-electron.js             # Script de build
│
├── dist/                             # Generado: instaladores
│   ├── ALISAR Setup.exe
│   └── ALISAR.exe
│
├── package.json                      # Configuración raíz
├── .gitignore
├── ELECTRON_SETUP.md                 # Guía Electron
├── INSTALLATION_GUIDE.md             # Guía instalación
├── QUICK_START.md                    # Inicio rápido
└── README_DEV.md                     # Este archivo
```

---

## 🔧 Configuración

### Variables de Entorno

Crear `.env` en raíz del proyecto:

```env
# Backend
NODE_ENV=development
BACKEND_PORT=4000
DATABASE_PATH=./database.db

# Frontend
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENVIRONMENT=development

# JWT
JWT_SECRET=your_development_secret_key

# Google Maps (opcional)
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### electron.json

Configurado en `package.json`:

```json
"build": {
  "appId": "com.alisar.desktop",
  "productName": "ALISAR",
  "win": {
    "target": ["nsis", "portable"]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

---

## 📚 Guías Específicas

### Frontend

#### Agregar Nuevo Componente

```javascript
// src/components/NuevoModulo.js
import React, { useState, useMemo } from 'react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import Modal from './common/Modal';
import FormNuevoModuloDetallado from './forms/FormNuevoModuloDetallado';

const NuevoModulo = () => {
  const { data, loading, error, create, update, delete: deleteItem } = useCRUD(
    dataService.getNuevoModulo,
    dataService.createNuevoModulo,
    dataService.updateNuevoModulo,
    dataService.deleteNuevoModulo
  );
  
  const [showModal, setShowModal] = useState(false);
  
  // ... resto del componente
};

export default NuevoModulo;
```

#### Agregar Nueva Ruta API

```javascript
// frontend/src/services/api.js

export const dataService = {
  // Nuevo módulo
  getNuevoModulo: () => api.get('/nuevo-modulo'),
  createNuevoModulo: (data) => api.post('/nuevo-modulo', data),
  updateNuevoModulo: (id, data) => api.put(`/nuevo-modulo/${id}`, data),
  deleteNuevoModulo: (id) => api.delete(`/nuevo-modulo/${id}`),
};
```

#### Usar Toast Notifications

```javascript
import { useToast } from '../context/ToastContext';

const MiComponente = () => {
  const toast = useToast();
  
  const handleSave = async () => {
    try {
      await dataService.createPersonal(formData);
      toast.success('Registro creado exitosamente');
    } catch (error) {
      toast.error('Error al crear registro');
    }
  };
};
```

### Backend

#### Agregar Nuevo Endpoint

```javascript
// backend/server.js

// GET all
app.get('/api/nuevo-modulo', verifyToken, async (req, res) => {
  try {
    const result = await db.all('SELECT * FROM nuevo_modulo');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
app.post('/api/nuevo-modulo', verifyToken, async (req, res) => {
  const { campo1, campo2 } = req.body;
  
  if (!campo1 || !campo2) {
    return res.status(400).json({ error: 'Campos requeridos' });
  }
  
  try {
    const result = await db.run(
      'INSERT INTO nuevo_modulo (campo1, campo2) VALUES (?, ?)',
      [campo1, campo2]
    );
    res.json({ id: result.lastID, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
app.put('/api/nuevo-modulo/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { campo1, campo2 } = req.body;
  
  try {
    await db.run(
      'UPDATE nuevo_modulo SET campo1 = ?, campo2 = ? WHERE id = ?',
      [campo1, campo2, id]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/api/nuevo-modulo/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.run('DELETE FROM nuevo_modulo WHERE id = ?', [id]);
    res.json({ status: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

#### Crear Nueva Tabla

```javascript
// En server.js, en la sección de inicialización de BD

await db.exec(`
  CREATE TABLE IF NOT EXISTS nuevo_modulo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campo1 TEXT NOT NULL,
    campo2 TEXT,
    campo3 REAL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campo1)
  );
`);
```

### Electron

#### Agregar IPC Handler

```javascript
// public/electron.js

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  };
});
```

#### Usar desde Frontend

```javascript
// frontend/src/components/SomeComponent.js

const getSystemInfo = async () => {
  if (window.isElectron) {
    const info = await window.electronAPI.getSystemInfo?.();
    console.log(info);
  }
};
```

---

## 🧪 Testing

### Frontend

```bash
# Crear componente de test
touch src/components/NuevoComponente.test.js

# Ejecutar tests
npm test --prefix frontend
```

### Backend

```bash
# Test manual del endpoint
curl -X GET http://localhost:4000/api/personal \
  -H "Authorization: Bearer <token>"
```

---

## 📦 Build y Deploy

### Desarrollo

```bash
# Dev mode con hot reload
npm run dev

# O en ventana separada
npm start --prefix frontend
npm start --prefix backend
```

### Producción

```bash
# 1. Build frontend
npm run build --prefix frontend

# 2. Build con Electron
npm run build

# 3. Crear instalador
npm run electron-pack

# Los instaladores están en: dist/
```

### Docker (Opcional)

```bash
# Crear imagen Docker
docker build -t alisar:latest .

# Ejecutar contenedor
docker run -p 3000:3000 -p 4000:4000 alisar:latest
```

---

## 🐛 Debugging

### Frontend DevTools

```bash
# En Electron (automático)
npm run electron-dev

# En navegador
npm start --prefix frontend
# Abrir: http://localhost:3000
# F12 para DevTools
```

### Backend Console

```bash
# Los logs aparecen en la terminal donde se ejecutó
npm start --prefix backend

# Para más verbosidad
DEBUG=* npm start --prefix backend
```

### SQLite Browser

```bash
# Usar herramienta visual
sqlite3 backend/database.db

# O usar aplicación: sqlitebrowser (requiere instalación)
```

---

## 📋 Checklists

### Antes de hacer Commit

- [ ] Sin errores en consola (frontend y backend)
- [ ] Sin warnings importantes
- [ ] Código formateado (2 espacios de indentación)
- [ ] Comentarios donde sea necesario
- [ ] Probado en desarrollo
- [ ] Actualizar CHANGELOG si es necesario

### Antes de hacer Build

- [ ] Todos los tests pasando
- [ ] Sin errores de linting
- [ ] Versión actualizada en package.json
- [ ] .env.example actualizado
- [ ] README actualizado si hay cambios

### Antes de Release

- [ ] Testear instalador en máquina limpia
- [ ] Verificar todos los módulos funcionan
- [ ] Probar CRUD completo
- [ ] Probar exportación Excel/PDF
- [ ] Crear documento de cambios (CHANGELOG)
- [ ] Versionar con git tags

---

## 🔐 Seguridad

### Best Practices

1. **Credenciales**:
   - Nunca comitear `.env`
   - Cambiar JWT_SECRET en producción
   - Usar credenciales fuertes

2. **Validación**:
   - Validar en frontend (UX)
   - Validar en backend (seguridad)
   - Usar HTTPS en producción

3. **Datos**:
   - No guardar contraseñas en texto plano
   - Usar bcrypt para hashing
   - Sanitizar inputs

4. **API**:
   - Verificar JWT en todos los endpoints
   - CORS configurado correctamente
   - Rate limiting (futuro)

---

## 📝 Git Workflow

```bash
# Crear rama feature
git checkout -b feature/nombre-feature

# Hacer cambios y commits
git add .
git commit -m "feat: descripción del cambio"

# Push a origen
git push origin feature/nombre-feature

# Crear pull request en GitHub/GitLab
# Merge a main/master después de review
```

### Commit Message Format

```
<type>: <descripción>

<cuerpo (opcional)>

<footer (opcional)>
```

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato/estilo
- `refactor`: Refactor sin cambios funcionales
- `perf`: Mejoras de performance
- `test`: Agregar tests
- `chore`: Cambios en build/config

---

## 📚 Recursos

- [React 18 Docs](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Guide](https://www.electron.build)

---

## 🤝 Contribuyendo

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

ISC

---

## 👥 Autores

- **Proyecto**: ALISAR SRL
- **Desarrollo**: [Desarrolladores]
- **Última actualización**: Mayo 2026

---

## ❓ FAQ

**P: ¿Qué versión de Node requiere?**
R: Node 14+ (probado en 16 y 18)

**P: ¿Puedo usar MongoDB en lugar de SQLite?**
R: El código base está para SQLite, pero se puede adaptar

**P: ¿Cómo agrego Google Maps?**
R: Habilitar API en Google Cloud, agregar key en .env

**P: ¿Funciona en macOS?**
R: Sí, pero instalador es para Windows actualmente

**P: ¿Cómo actualizo la versión?**
R: Cambiar `version` en package.json y hacer rebuild

---

¿Preguntas? Contactar al equipo de desarrollo.
