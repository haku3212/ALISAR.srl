/**
 * ALISAR Desktop - Preload Script
 * Proporciona acceso seguro a APIs de Electron desde el frontend
 */

const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al contexto del renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path')
});

// Detectar si estamos en Electron
contextBridge.exposeInMainWorld('isElectron', true);
