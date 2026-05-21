# ALISAR - Cómo Crear el Ejecutable

**Este documento es para**: Administradores técnicos, desarrolladores, personas que quieran generar el instalador desde el código fuente.

---

## 📋 Resumen Rápido

```bash
# 1. Preparación (una sola vez)
npm install
npm install --prefix frontend
npm install --prefix backend

# 2. Buildear
node scripts/build-electron.js

# 3. Resultado
# Los instaladores se generarán en: dist/
# - ALISAR Setup.exe (instalador)
# - ALISAR.exe (portable)
```

---

## 🔧 Requisitos Previos

### Sistema Operativo
- **Windows 7, 8, 10 o 11** (64-bit)
- ⚠️ NO funciona en macOS o Linux directamente (necesita WSL2)

### Software Requerido

#### 1. Node.js
- **Versión mínima**: 14.0.0
- **Versión recomendada**: 16.x o 18.x
- **Descargar**: https://nodejs.org/
- **Verificar instalación**:
  ```bash
  node --version
  npm --version
  ```

#### 2. Git (Opcional, pero recomendado)
- Para clonar el repositorio
- **Descargar**: https://git-scm.com/
- **Verificar**:
  ```bash
  git --version
  ```

#### 3. Visual C++ Build Tools (Importante)
- Requerido para compilar módulos nativos (SQLite3)
- **Descargar**: https://visualstudio.microsoft.com/downloads/
- Seleccionar: "Desktop development with C++"
- ⚠️ Esto puede tomar 30+ minutos

#### 4. Python 3 (Requerido por node-gyp)
- Para compilar módulos nativos
- **Descargar**: https://www.python.org/
- **Verificar**:
  ```bash
  python --version
  ```

### Espacio en Disco
- **Mínimo para build**: 2GB
- **Recomendado**: 5GB

### Conexión a Internet
- Requerida para descargar dependencias
- Velocidad mínima: 2 Mbps (para no esperar horas)

---

## 📥 Paso 1: Preparar el Código Fuente

### Opción A: Desde USB o Carpeta Descargada

```bash
# 1. Copiar carpeta alisar-gestion a ubicación de trabajo
# Ejemplo: C:\Proyectos\alisar-gestion

# 2. Abrir PowerShell o CMD
cd C:\Proyectos\alisar-gestion

# 3. Verificar que existen las carpetas
dir
# Debe mostrar: frontend, backend, public, scripts, etc.
```

### Opción B: Desde GitHub (si tiene repositorio)

```bash
# Clonar repositorio
git clone https://github.com/alisar/alisar-gestion.git
cd alisar-gestion

# Actualizar a rama main/master
git fetch origin
git checkout main
```

---

## 📦 Paso 2: Instalar Dependencias

### 2.1 Verificar Node.js

```bash
node --version
npm --version
```

Debe mostrar versiones >= 14.0.0 para Node

### 2.2 Instalar Dependencias Raíz

```bash
# En la raíz del proyecto (alisar-gestion/)
npm install

# Esto toma 3-5 minutos
# Descarga: electron, electron-builder, etc.
```

**Esperado**: Sin errores críticos

### 2.3 Instalar Dependencias del Frontend

```bash
# En carpeta frontend/
npm install --prefix frontend

# Toma 2-3 minutos
# Descarga: React, axios, recharts, etc.
```

**Esperado**: Sin errores críticos

### 2.4 Instalar Dependencias del Backend

```bash
# En carpeta backend/
npm install --prefix backend

# Toma 1-2 minutos
# Descarga: Express, JWT, SQLite, etc.
```

**Esperado**: Sin errores críticos

### 2.5 Verificar Instalación

```bash
# Verificar que existe node_modules
dir node_modules | find "electron"

# Debe encontrar electron y electron-builder
```

Si ve mensajes de `npm WARN`, generalmente es OK. Si ve `npm ERR`, contactar soporte.

---

## 🏗️ Paso 3: Buildear la Aplicación

### Opción A: Usar Script Automatizado (Recomendado)

```bash
# En la raíz del proyecto
node scripts/build-electron.js

# El script hará:
# 1. Verificar requisitos
# 2. Instalar dependencias si faltan
# 3. Buildear frontend React
# 4. Verificar estructura
# 5. Buildear con Electron
# 6. Crear instaladores
```

**Tiempo esperado**: 5-15 minutos (depende de velocidad de internet)

**Salida esperada**:
```
==================================================
   ALISAR DESKTOP - BUILD ELECTRON
==================================================

ℹ️  Verificando requisitos...
✅ Node.js v16.x.x detectado
✅ npm v8.x.x detectado

📦 Instalando dependencias...
✅ Instalando dependencias raíz
✅ Instalando dependencias frontend
✅ Instalando dependencias backend

🏗️  Buildando frontend...
Compiled successfully.

📁 Verificando estructura...
✅ Carpeta frontend/build existe
✅ Carpeta backend existe
✅ Carpeta public existe

⚡ Verificando archivos Electron...
✅ Archivo public/electron.js existe
✅ Archivo public/preload.js existe
✅ Archivo package.json existe

📦 Buildando aplicación Electron...
✅ Build de Electron completado

==================================================
   BUILD COMPLETADO
==================================================

📂 Archivos generados:
  • Frontend build: frontend/build/
  • Instalador: dist/ALISAR Setup.exe
  • Portable: dist/ALISAR.exe

📚 Próximos pasos:
  1. Probar la aplicación: npm run electron
  2. Crear instalador: npm run electron-pack
  3. Distribuir archivos de dist/
```

### Opción B: Build Manual Paso a Paso

```bash
# Paso 1: Buildear frontend
npm run build --prefix frontend

# Esperar a que se complete (2-3 minutos)
# Debe generar: frontend/build/

# Paso 2: Verificar build
dir frontend\build
# Debe mostrar carpeta "static" y archivos HTML

# Paso 3: Crear ejecutables
npm run electron-pack

# Esperar (puede tomar 5-10 minutos)
# Generará archivos en dist/
```

---

## 🎯 Paso 4: Verificar Resultado

### Verificar que se crearon los archivos

```bash
# Navegar a carpeta dist
cd dist
dir

# Debe mostrar algo como:
# - ALISAR Setup.exe (80-120 MB)
# - ALISAR.exe (80-120 MB)
# - builder-effective-config.yaml
# Otros archivos de soporte
```

### Tamaño esperado

| Archivo | Tamaño |
|---------|--------|
| ALISAR Setup.exe | 100-150 MB |
| ALISAR.exe | 100-150 MB |

Si los archivos son muy pequeños (< 10MB), algo salió mal.

---

## ✅ Paso 5: Probar la Aplicación

### Probar Ejecutable Portable

```bash
# Desde carpeta dist/
.\ALISAR.exe

# Debe abrir ventana de aplicación
# Esperar 5-10 segundos a que inicie
# Debería ver: Pantalla de login
```

### Probar Instalador

```bash
# Desde carpeta dist/
.\ALISAR Setup.exe

# Debe abrir asistente de instalación
# Completar la instalación
# Ejecutar desde Inicio o Escritorio
```

### Verificación de Funcionalidad

Una vez que se abre la aplicación:

- [ ] Se muestra pantalla de login
- [ ] Ingresar usuario: `admin` / contraseña: `riberalta`
- [ ] Click en "Ingresar"
- [ ] Aparece Dashboard (debe esperar 3-5 segundos)
- [ ] Todos los módulos visibles en menú lateral
- [ ] Click en "Personal" - debe cargar datos
- [ ] Sin errores en consola (Ctrl+Shift+I)

Si todo funciona: ¡La compilación fue exitosa! ✅

---

## 🚀 Paso 6: Distribuir los Instaladores

### Archivos para Distribuir

Copiar desde `dist/` a ubicación de distribución:

1. **ALISAR Setup.exe** (Recomendado para usuarios)
   - Instalador estándar
   - Crea accesos directos
   - Actualización automática
   - Archivo: ~120 MB

2. **ALISAR.exe** (Alternativa portable)
   - No requiere instalación
   - Ejecutar directamente
   - Para usuarios técnicos
   - Archivo: ~120 MB

### Métodos de Distribución

#### Opción 1: Mediante USB
```
USB:
├── ALISAR Setup.exe
├── INSTALLATION_GUIDE.md
├── QUICK_START.md
└── README.txt (instrucciones básicas)
```

#### Opción 2: Mediante Descarga en Línea
- Crear carpeta en servidor/nube
- Subir `ALISAR Setup.exe`
- Compartir link de descarga
- Recomendación: Google Drive, Dropbox, etc.

#### Opción 3: Mediante Email
- Dividir en archivos pequeños (si es necesario)
- O compartir link de descarga
- Incluir documentación

### Documentación a Incluir

Para cada entrega, incluir:

```
Carpeta de Distribución:
├── ALISAR Setup.exe               ← Ejecutable principal
├── ALISAR.exe                     ← Alternativa portable
├── INSTALLATION_GUIDE.md          ← Guía de instalación
├── QUICK_START.md                 ← Inicio rápido
├── RELEASE_NOTES.md               ← Notas de versión
└── README.txt                     ← Instrucciones en español
```

---

## 🔄 Proceso Completo Ejemplo

### Escenario: Primera Compilación

```bash
# 1. Abrir PowerShell como Administrador
#    Presionar Win+R
#    Escribir: powershell
#    Ctrl+Shift+Enter (ejecutar como admin)

# 2. Navegar a carpeta del proyecto
cd C:\Proyectos\alisar-gestion

# 3. Ejecutar build automático
node scripts/build-electron.js

# (Esperar 10-15 minutos)

# 4. Verificar resultado
dir dist

# 5. Probar ejecutable
.\dist\ALISAR.exe

# 6. Si funciona, copiar instaladores
Copy-Item dist\ALISAR*.exe D:\Distribución\
```

**Tiempo total**: ~20 minutos (incluyendo descargas)

---

## ⚠️ Solución de Problemas

### Problema 1: "command not found: npm"

**Causa**: Node.js no está instalado

**Solución**:
1. Descargar Node.js desde https://nodejs.org/
2. Instalar (acepta opciones por defecto)
3. Reiniciar PowerShell/CMD
4. Intentar de nuevo: `npm --version`

### Problema 2: "Error: Cannot find module 'electron'"

**Causa**: Dependencias no instaladas correctamente

**Solución**:
```bash
# Limpiar e reinstalar
rm -r node_modules package-lock.json
npm install
```

### Problema 3: "Error building native module"

**Causa**: Visual C++ Build Tools no instalado

**Solución**:
1. Descargar Visual Studio Build Tools
2. Instalar "Desktop development with C++"
3. Reiniciar
4. Reintentar build

### Problema 4: "ALISAR.exe genera archivo vacío"

**Causa**: Build incompleto

**Solución**:
```bash
# Limpiar carpeta dist
rm -r dist

# Rebuild desde cero
node scripts/build-electron.js
```

### Problema 5: "No se abre la aplicación"

**Causa**: Backend no inicia correctamente

**Solución**:
1. Verificar puerto 4000 disponible: `netstat -ano | findstr :4000`
2. Si está en uso, matar proceso: `taskkill /PID <PID> /F`
3. Ejecutar aplicación nuevamente

---

## 🔐 Información Sensible

### Variables de Entorno

Antes de hacer build final:

```bash
# Crear .env en raíz
echo NODE_ENV=production >> .env
echo JWT_SECRET=your_secret_key >> .env
```

⚠️ **IMPORTANTE**: 
- Cambiar `JWT_SECRET` con valor seguro
- No usar valores de desarrollo en producción
- No commitar `.env` a GitHub

---

## 📊 Verificación Técnica

### Verificar Integridad del Build

```bash
# Verificar que estructura es correcta
dir dist

# Verificar tamaño
$file = Get-Item 'dist\ALISAR Setup.exe'
$file.Length / 1MB  # Debe ser > 100 MB
```

### Verificar Archivos de Recurso

```bash
# Verificar frontend build
dir frontend\build\static

# Debe haber carpetas:
# - js/
# - css/
```

---

## 📈 Optimizaciones Futuras

### Para Siguiente Versión

- [ ] Reducir tamaño del instalador (comprensión)
- [ ] Actualización automática
- [ ] Código ofuscado en producción
- [ ] Validación de integridad de archivos

### Mejoras para Desarrollo

- [ ] CI/CD automatizado (GitHub Actions)
- [ ] Notarización en macOS
- [ ] Firma digital de ejecutables
- [ ] Distribución vía Microsoft Store

---

## 🆘 Contacto para Problemas de Build

Si el build falla después de seguir estos pasos:

1. **Documentar el error**:
   - Captura de pantalla del error
   - Comando que falló
   - Versiones instaladas (`npm --version`, `node --version`)

2. **Contactar soporte**:
   - Email: soporte@alisar.com
   - Proporcionar error exacto
   - Información del SO

3. **Esperar respuesta**:
   - Tiempo estimado: 24 horas hábil
   - Alternativa: descargar ejecutable precompilado

---

## ✨ Conclusión

Con estos pasos, deberías poder:
1. ✅ Instalar Node.js y dependencias
2. ✅ Buildear la aplicación React
3. ✅ Crear ejecutables con Electron
4. ✅ Distribuir a usuarios finales
5. ✅ Solucionar problemas comunes

**Tiempo estimado total**: 20-30 minutos en máquina rápida

Para preguntas técnicas o cambios en el código, consulta `README_DEV.md`

---

**Versión**: 1.0.0  
**Última actualización**: Mayo 2026  
**Próxima revisión**: Julio 2026

---

¡Éxito con tu build! 🎉

Cualquier pregunta: soporte@alisar.com
