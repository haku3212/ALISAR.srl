# 🎯 ALISAR Desktop - Comienza Aquí

## ¡Bienvenido a ALISAR!

Este es tu primer punto de contacto con el sistema ALISAR. Este documento te guiará a través de los pasos siguientes.

---

## 📦 ¿Qué Tienes?

Tienes una **aplicación de escritorio profesional completamente funcional** para gestión de recursos forestales:

- ✅ **Código fuente completo** listo para modificar
- ✅ **Documentación exhaustiva** en varios idiomas  
- ✅ **Frontend React** moderno con 9 módulos
- ✅ **Backend Express** robusto con base de datos SQLite
- ✅ **Configuración Electron** para crear ejecutables
- ✅ **Datos de ejemplo** para pruebas

---

## 🚀 Inicio Rápido (5 minutos)

### Opción 1: Solo Ejecutar la Aplicación (Recomendado para usuarios)

```bash
# 1. Descargar archivo ejecutable
# Buscar en carpeta: dist/
# Archivo: ALISAR Setup.exe

# 2. Ejecutar
Doble-clic en ALISAR Setup.exe

# 3. Completar instalación (3 minutos)
# 4. Abrir desde Escritorio
# 5. Login: admin / riberalta
```

👉 **Seguir**: `INSTALLATION_GUIDE.md`

### Opción 2: Modificar el Código (Para desarrolladores)

```bash
# 1. Instalar Node.js (si no lo tienes)
# Descargar: https://nodejs.org/

# 2. Instalar dependencias
npm install
npm install --prefix frontend
npm install --prefix backend

# 3. Ejecutar en desarrollo
npm run dev

# 4. Abre navegador
http://localhost:3000

# 5. Login: admin / riberalta
```

👉 **Seguir**: `README_DEV.md`

### Opción 3: Crear Nuevo Ejecutable (Para administradores técnicos)

```bash
# 1. Instalar Node.js v14+
# 2. Instalar dependencias (ver Opción 2)
# 3. Ejecutar build
node scripts/build-electron.js

# 4. Obtener instaladores
# Los archivos estarán en: dist/
# - ALISAR Setup.exe
# - ALISAR.exe
```

👉 **Seguir**: `BUILD_EXECUTABLE.md`

---

## 📚 Documentación Disponible

| Documento | Para Quién | Tiempo |
|-----------|-----------|--------|
| **INSTALLATION_GUIDE.md** | Administradores, usuarios | 15 min |
| **QUICK_START.md** | Usuarios finales | 10 min |
| **README_DEV.md** | Desarrolladores | 30 min |
| **BUILD_EXECUTABLE.md** | Administradores técnicos | 20 min |
| **ELECTRON_SETUP.md** | Desarrolladores Electron | 20 min |
| **PROJECT_SUMMARY.md** | Gerentes, stakeholders | 15 min |
| **RELEASE_NOTES.md** | Todos (referencia) | 10 min |

---

## 🎯 Selecciona tu Rol

### 👤 Soy Usuario Final (quiero usar ALISAR)

```
1. Lee: INSTALLATION_GUIDE.md (sección "Para Usuarios Finales")
2. Lee: QUICK_START.md
3. Instala: ALISAR Setup.exe
4. Abre la aplicación
5. Login: admin / riberalta
6. ¡Comienza a usar!
```

**Tiempo total**: 20 minutos

---

### 👨‍💼 Soy Administrador de IT (instalación en empresa)

```
1. Lee: INSTALLATION_GUIDE.md (sección "Para Administradores")
2. Lee: PROJECT_SUMMARY.md
3. Instala en máquinas piloto
4. Realiza testing completo
5. Crea usuarios nuevos en Configuración
6. Capacita a usuarios finales
7. Deploy en producción
```

**Tiempo total**: 2-3 horas para setup completo

---

### 👨‍💻 Soy Desarrollador (necesito modificar código)

```
1. Lee: README_DEV.md
2. Lee: ELECTRON_SETUP.md (si modifcas Electron)
3. Clona/copia el repositorio
4. npm install (todas las carpetas)
5. npm run dev (para desarrollar)
6. Realiza cambios
7. npm run electron-pack (para crear ejecutable)
```

**Tiempo total**: 30 minutos para setup

---

### 🔧 Soy Administrador Técnico (compilación y distribución)

```
1. Lee: BUILD_EXECUTABLE.md
2. Lee: PROJECT_SUMMARY.md
3. Instala Node.js + dependencias
4. node scripts/build-electron.js
5. Testea los ejecutables en dist/
6. Distribuye ALISAR Setup.exe a usuarios
7. Proporciona INSTALLATION_GUIDE.md a usuarios
```

**Tiempo total**: 1-2 horas

---

## 🔑 Credenciales Iniciales

**⚠️ IMPORTANTE: CAMBIAR ESTAS EN PRIMERA EJECUCIÓN**

```
Usuario: admin
Contraseña: riberalta
```

Cambiar en: **Configuración > Seguridad > Cambiar Contraseña**

---

## ✨ Lo Que Puedes Hacer Ahora

### Módulos Disponibles (9 total)

```
📊 Dashboard
   └─ Panel de control con KPIs y gráficos

👥 Personal
   └─ Gestión de empleados y recursos humanos

⚙️ Maquinaria
   └─ Control de equipos y mantenimiento

🏗️ Obras
   └─ Seguimiento de proyectos forestales

🪵 Madera
   └─ Inventario de productos

🌲 Rodeos
   └─ Operaciones de extracción (NUEVO)

📋 Documentos
   └─ Permisos, certificados, contratos (NUEVO)

📈 Historial
   └─ Auditoría de cambios del sistema

⚙️ Configuración
   └─ Ajustes de la aplicación
```

---

## 🆘 ¿Necesitas Ayuda?

### Problema: No sé por dónde empezar
→ Busca tu rol en la sección "Selecciona tu Rol"

### Problema: Tengo error de instalación
→ Lee: `INSTALLATION_GUIDE.md` > Sección "Solución de Problemas"

### Problema: Necesito compilar desde código
→ Lee: `BUILD_EXECUTABLE.md` > Paso a Paso

### Problema: Quiero modificar funcionalidades
→ Lee: `README_DEV.md` > Sección "Estructura del Proyecto"

### Problema: No funciona algo
→ Lee: `QUICK_START.md` > Sección "Troubleshooting"

---

## 📊 Información del Sistema

| Aspecto | Valor |
|--------|-------|
| **Versión** | 1.0.0 |
| **Estado** | ✅ Listo para producción |
| **Plataforma** | Windows 7, 8, 10, 11 |
| **Requisitos Mínimos** | Windows 64-bit, 4GB RAM, 500MB disco |
| **Licencia** | ISC |
| **Desarrollado con** | React 18, Express.js, Electron |

---

## 🎯 Próximos Pasos Recomendados

### Hoy (dentro de 1 hora)
- [ ] Leer este documento
- [ ] Elegir tu rol y seguir instrucciones
- [ ] Instalar o ejecutar la aplicación

### Mañana (dentro de 24 horas)
- [ ] Explorar todos los módulos
- [ ] Crear registros de prueba
- [ ] Testear exportación Excel/PDF
- [ ] Cambiar contraseña de admin

### Esta Semana (días 2-7)
- [ ] Capacitar usuarios
- [ ] Instalar en máquinas de producción
- [ ] Migrar datos existentes
- [ ] Definir procesos operacionales

### Este Mes (semanas 2-4)
- [ ] Evaluación completa
- [ ] Feedback de usuarios
- [ ] Solución de problemas
- [ ] Optimización según necesidades

---

## 📁 Estructura de Carpetas Explicada

```
alisar-gestion/
│
├── 🎯 ESTE_ARCHIVO.md        ← Estás aquí
├── *.md                       ← Documentación (¡lee estos!)
│
├── dist/                      ← EJECUTABLES (si existen)
│   ├── ALISAR Setup.exe      ← Instalador para usuarios
│   └── ALISAR.exe            ← Portable (sin instalación)
│
├── frontend/                  ← Aplicación React
│   ├── src/                  ← Código fuente React
│   ├── build/                ← Build para producción
│   └── package.json          ← Dependencias React
│
├── backend/                   ← Servidor Express
│   ├── server.js             ← Punto de entrada
│   ├── database.db           ← Base de datos SQLite
│   └── package.json          ← Dependencias Node
│
├── public/                    ← Configuración Electron
│   ├── electron.js           ← Main process
│   └── preload.js            ← Security context
│
├── scripts/                   ← Automatización
│   └── build-electron.js     ← Script de compilación
│
├── node_modules/            ← Librerías (generadas)
├── package.json             ← Configuración raíz
└── .gitignore              ← Archivos ignorados por Git
```

---

## 🔄 Flujo Típico de Uso

```
1. INSTALAR
   ALISAR Setup.exe → Instalar en Windows
   ↓
2. ABRIR
   Click en icono → Aplicación inicia
   ↓
3. LOGIN
   Usuario: admin / Contraseña: riberalta
   ↓
4. EXPLORAR
   Dashboard → Navegar módulos
   ↓
5. USAR
   Crear registros → Buscar → Exportar
   ↓
6. CONFIGURAR (opcional)
   Cambiar usuarios → Ajustar parámetros
```

---

## ⚙️ Configuración Técnica Rápida

### Para Ejecutar en Desarrollo

```bash
# 1. Instalar Node.js desde https://nodejs.org/
# 2. Abrir PowerShell/CMD
# 3. Navegar a carpeta del proyecto
cd C:\ruta\alisar-gestion

# 4. Instalar dependencias
npm install
npm install --prefix frontend
npm install --prefix backend

# 5. Ejecutar
npm run dev

# 6. Abrir navegador
http://localhost:3000
```

---

## 📞 Contacto y Soporte

Si necesitas ayuda:

| Método | Contacto |
|--------|----------|
| 📧 Email | soporte@alisar.com |
| 📞 Teléfono | +591 3 XXXXXXX |
| 💻 Portal Web | https://alisar.com/help |
| 🕐 Horario | Lunes-Viernes, 8:00-17:00 |

**Incluye en tu consulta:**
- Descripción clara del problema
- Versión de ALISAR (Configuración > Acerca de)
- Pasos para reproducir el error
- Captura de pantalla (si aplica)

---

## ✅ Checklist de Inicio

Antes de comenzar, verifica:

- [ ] Tienes este archivo (estás leyéndolo ✓)
- [ ] Tienes acceso a los otros documentos .md
- [ ] Sabes qué rol tienes (usuario/admin/dev)
- [ ] Tienes acceso a computadora Windows
- [ ] (Para dev) Tienes Node.js instalado
- [ ] (Para instalar) Tienes permisos de administrador

---

## 🎊 ¡Listo para Comenzar!

Ya tienes todo lo que necesitas. 

**Selecciona tu rol arriba y sigue las instrucciones específicas para ti.**

Si algo no está claro, consulta la **documentación relevante** o **contacta a soporte**.

---

## 📝 Información Importante

**Este sistema es:**
- ✅ Completamente funcional
- ✅ Listo para uso en producción
- ✅ Seguro y confiable
- ✅ Documentado exhaustivamente
- ✅ Fácil de instalar y usar

**Versión**: 1.0.0  
**Fecha**: Mayo 2026  
**Estado**: Lanzamiento oficial

---

## 🌟 ¡Disfruta usando ALISAR!

Gracias por elegir nuestro sistema. Esperamos que sea una herramienta valiosa para tu empresa.

Si tienes sugerencias de mejora, ¡nos encantaría escucharlas!

---

**¿Por dónde empiezo?**

👆 **Busca tu rol en la sección "Selecciona tu Rol" y sigue las instrucciones.**

---

© 2026 ALISAR SRL. Todos los derechos reservados.
