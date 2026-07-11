import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as db from './db';

let mainWindow: BrowserWindow | null = null;

// Permite aislar los datos en pruebas automatizadas
if (process.env.MCP_USER_DATA) {
  app.setPath('userData', process.env.MCP_USER_DATA);
}

function backupDir(): string {
  return path.join(app.getPath('userData'), 'respaldos');
}

function wrap<T>(fn: (...args: any[]) => T | Promise<T>) {
  return async (_event: Electron.IpcMainInvokeEvent, ...args: any[]) => {
    try {
      return { ok: true, data: await fn(...args) };
    } catch (err: any) {
      const message =
        err instanceof db.ValidationError
          ? err.message
          : 'Ocurrió un error inesperado: ' + (err?.message ?? String(err));
      return { ok: false, error: message };
    }
  };
}

function registerIpc(): void {
  ipcMain.handle('data:getAll', wrap(() => db.getAppData()));

  ipcMain.handle('settings:update', wrap((patch) => db.updateSettings(patch)));

  ipcMain.handle('categories:create', wrap((type, name) => db.createCategory(type, name)));
  ipcMain.handle('categories:delete', wrap((id) => db.deleteCategory(id)));

  ipcMain.handle('work:create', wrap((input) => db.createWorkEntry(input)));
  ipcMain.handle('work:update', wrap((id, input) => db.updateWorkEntry(id, input)));
  ipcMain.handle('work:delete', wrap((id) => db.deleteWorkEntry(id)));
  ipcMain.handle('work:setPaid', wrap((id, paid) => db.setWorkEntryPaid(id, paid)));

  ipcMain.handle('fares:create', wrap((input) => db.createFare(input)));
  ipcMain.handle('fares:update', wrap((id, input) => db.updateFare(id, input)));
  ipcMain.handle('fares:delete', wrap((id) => db.deleteFare(id)));
  ipcMain.handle('fares:setStatus', wrap((id, refunded) => db.setFareStatus(id, refunded)));

  ipcMain.handle('movements:create', wrap((type, input) => db.createMovement(type, input)));
  ipcMain.handle('movements:update', wrap((type, id, input) => db.updateMovement(type, id, input)));
  ipcMain.handle('movements:delete', wrap((type, id) => db.deleteMovement(type, id)));

  ipcMain.handle('goal:update', wrap((patch) => db.updateGoal(patch)));

  ipcMain.handle('budgets:upsert', wrap((categoryId, limit) => db.upsertBudget(categoryId, limit)));
  ipcMain.handle('budgets:delete', wrap((id) => db.deleteBudget(id)));

  ipcMain.handle('backup:create', wrap(() => db.createBackup(backupDir())));
  ipcMain.handle('backup:list', wrap(() => db.listBackups(backupDir())));
  ipcMain.handle('backup:openFolder', wrap(() => {
    fs.mkdirSync(backupDir(), { recursive: true });
    shell.openPath(backupDir());
  }));

  ipcMain.handle('backup:restore', wrap(async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Selecciona el respaldo a restaurar',
      defaultPath: backupDir(),
      filters: [{ name: 'Base de datos SQLite', extensions: ['db'] }],
      properties: ['openFile']
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    // Respaldo de seguridad automático antes de restaurar
    db.createBackup(backupDir());
    await db.restoreBackup(result.filePaths[0]);
    return db.getAppData();
  }));

  ipcMain.handle('backup:exportDb', wrap(async () => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Exportar base de datos',
      defaultPath: 'mi-control-personal.db',
      filters: [{ name: 'Base de datos SQLite', extensions: ['db'] }]
    });
    if (result.canceled || !result.filePath) return null;
    db.saveNow();
    fs.copyFileSync(db.getDbPath(), result.filePath);
    return result.filePath;
  }));

  // Guarda un archivo generado por el renderer (CSV o Excel en base64)
  ipcMain.handle('file:save', wrap(async (defaultName: string, base64: string, extension: string, filterName: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Guardar archivo',
      defaultPath: defaultName,
      filters: [{ name: filterName, extensions: [extension] }]
    });
    if (result.canceled || !result.filePath) return null;
    fs.writeFileSync(result.filePath, Buffer.from(base64, 'base64'));
    return result.filePath;
  }));

  // Exporta la vista actual como PDF
  ipcMain.handle('file:exportPdf', wrap(async (defaultName: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Exportar PDF',
      defaultPath: defaultName,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    if (result.canceled || !result.filePath) return null;
    const pdf = await mainWindow!.webContents.printToPDF({
      printBackground: true,
      pageSize: 'Letter',
      margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
    });
    fs.writeFileSync(result.filePath, pdf);
    return result.filePath;
  }));
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Mi Control Personal',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    await mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(async () => {
  const dataDir = app.getPath('userData');
  fs.mkdirSync(dataDir, { recursive: true });
  await db.initDb(path.join(dataDir, 'mi-control-personal.db'));
  registerIpc();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  try {
    db.saveNow();
    const settings = db.getSettings();
    if (settings.auto_backup) {
      db.createBackup(backupDir());
      // Conservar solo los 20 respaldos automáticos más recientes
      const backups = db.listBackups(backupDir());
      for (const old of backups.slice(20)) fs.unlinkSync(old.path);
    }
  } catch {
    /* nunca impedir el cierre de la aplicación */
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
