import type {
  ApiResult, AppData, BackupInfo, Budget, Category, Fare, FareInput, Goal,
  Movement, MovementInput, Settings, WorkEntry, WorkEntryInput
} from '../shared/types';

interface Api {
  getAll(): Promise<ApiResult<AppData>>;
  updateSettings(patch: Partial<Settings>): Promise<ApiResult<Settings>>;
  createCategory(type: string, name: string): Promise<ApiResult<Category>>;
  deleteCategory(id: number): Promise<ApiResult<void>>;
  createWorkEntry(input: WorkEntryInput): Promise<ApiResult<WorkEntry>>;
  updateWorkEntry(id: number, input: WorkEntryInput): Promise<ApiResult<WorkEntry>>;
  deleteWorkEntry(id: number): Promise<ApiResult<void>>;
  setWorkEntryPaid(id: number, paid: boolean): Promise<ApiResult<WorkEntry>>;
  createFare(input: FareInput): Promise<ApiResult<Fare>>;
  updateFare(id: number, input: FareInput): Promise<ApiResult<Fare>>;
  deleteFare(id: number): Promise<ApiResult<void>>;
  setFareStatus(id: number, refunded: boolean): Promise<ApiResult<Fare>>;
  createMovement(type: 'ingreso' | 'gasto', input: MovementInput): Promise<ApiResult<Movement>>;
  updateMovement(type: 'ingreso' | 'gasto', id: number, input: MovementInput): Promise<ApiResult<Movement>>;
  deleteMovement(type: 'ingreso' | 'gasto', id: number): Promise<ApiResult<void>>;
  updateGoal(patch: Partial<Goal>): Promise<ApiResult<Goal>>;
  upsertBudget(categoryId: number, limit: number): Promise<ApiResult<Budget>>;
  deleteBudget(id: number): Promise<ApiResult<void>>;
  createBackup(): Promise<ApiResult<string>>;
  listBackups(): Promise<ApiResult<BackupInfo[]>>;
  openBackupFolder(): Promise<ApiResult<void>>;
  restoreBackup(): Promise<ApiResult<AppData | null>>;
  exportDb(): Promise<ApiResult<string | null>>;
  saveFile(defaultName: string, base64: string, extension: string, filterName: string): Promise<ApiResult<string | null>>;
  exportPdf(defaultName: string): Promise<ApiResult<string | null>>;
}

export const api: Api = (window as any).api;
