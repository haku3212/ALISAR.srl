import { contextBridge, ipcRenderer } from 'electron';

const invoke = (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('api', {
  getAll: () => invoke('data:getAll'),

  updateSettings: (patch: unknown) => invoke('settings:update', patch),

  createCategory: (type: string, name: string) => invoke('categories:create', type, name),
  deleteCategory: (id: number) => invoke('categories:delete', id),

  createWorkEntry: (input: unknown) => invoke('work:create', input),
  updateWorkEntry: (id: number, input: unknown) => invoke('work:update', id, input),
  deleteWorkEntry: (id: number) => invoke('work:delete', id),
  setWorkEntryPaid: (id: number, paid: boolean) => invoke('work:setPaid', id, paid),

  createFare: (input: unknown) => invoke('fares:create', input),
  updateFare: (id: number, input: unknown) => invoke('fares:update', id, input),
  deleteFare: (id: number) => invoke('fares:delete', id),
  setFareStatus: (id: number, refunded: boolean) => invoke('fares:setStatus', id, refunded),

  createMovement: (type: string, input: unknown) => invoke('movements:create', type, input),
  updateMovement: (type: string, id: number, input: unknown) => invoke('movements:update', type, id, input),
  deleteMovement: (type: string, id: number) => invoke('movements:delete', type, id),

  updateGoal: (patch: unknown) => invoke('goal:update', patch),

  upsertBudget: (categoryId: number, limit: number) => invoke('budgets:upsert', categoryId, limit),
  deleteBudget: (id: number) => invoke('budgets:delete', id),

  createBackup: () => invoke('backup:create'),
  listBackups: () => invoke('backup:list'),
  openBackupFolder: () => invoke('backup:openFolder'),
  restoreBackup: () => invoke('backup:restore'),
  exportDb: () => invoke('backup:exportDb'),

  saveFile: (defaultName: string, base64: string, extension: string, filterName: string) =>
    invoke('file:save', defaultName, base64, extension, filterName),
  exportPdf: (defaultName: string) => invoke('file:exportPdf', defaultName)
});
