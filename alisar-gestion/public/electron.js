/**
 * ALISAR Desktop - Electron Main Process
 * Gestión de la aplicación Electron, ventanas, y proceso del backend
 */

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// Detectar si estamos en modo desarrollo
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

let mainWindow;
let backendProcess;

/**
 * Crear la ventana principal de la aplicación
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    ...(process.platform !== 'linux' && { icon: path.join(__dirname, 'assets', 'icon.png') })
  });

  // Determinar URL para cargar
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../frontend/build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Abrir DevTools en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Crear menú
  createMenu();
}

/**
 * Crear menú de la aplicación
 */
function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reload();
          }
        },
        {
          label: 'Herramientas de Desarrollo',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de ALISAR',
          click: () => {
            // Aquí se puede mostrar un diálogo de About
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Iniciar el servidor backend
 */
function startBackend() {
  return new Promise((resolve, reject) => {
    const backendDir = path.join(__dirname, '../backend');
    const isProduction = !isDev;

    // Determinar el comando según el SO
    const nodeExe = process.platform === 'win32' ? 'node.exe' : 'node';
    const backendScript = path.join(backendDir, 'server.js');

    console.log(`Iniciando backend desde: ${backendScript}`);

    // Spawn el proceso del backend
    backendProcess = spawn(nodeExe, [backendScript], {
      cwd: backendDir,
      stdio: 'pipe',
      shell: process.platform === 'win32'
    });

    // Capturar salida del backend
    backendProcess.stdout.on('data', (data) => {
      console.log(`[BACKEND] ${data}`);
      // Resolver cuando el backend está listo
      if (data.toString().includes('API activa') || data.toString().includes('listening')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[BACKEND ERROR] ${data}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Error al iniciar backend:', err);
      reject(err);
    });

    // Timeout de 10 segundos para que el backend inicie
    setTimeout(() => {
      resolve(); // Resolver de todas formas después de 10 segundos
    }, 10000);
  });
}

/**
 * Manejo de IPC - Comunicación entre procesos
 */
ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

/**
 * Event: Aplicación lista
 */
app.on('ready', async () => {
  try {
    if (isDev) {
      // En desarrollo el backend ya está corriendo (npm run dev lo levanta)
      createWindow();
    } else {
      await startBackend();
      console.log('Backend iniciado correctamente');
      createWindow();
    }
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    setTimeout(() => app.quit(), 1000);
  }
});

/**
 * Event: Todas las ventanas cerradas
 */
app.on('window-all-closed', () => {
  // En macOS, las aplicaciones generalmente permanecen activas
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Event: Aplicación activada (macOS)
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Event: Antes de cerrar
 */
app.on('before-quit', () => {
  if (backendProcess) {
    console.log('Deteniendo backend...');
    backendProcess.kill();
  }
});

/**
 * Manejar excepciones no capturadas
 */
process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
});
