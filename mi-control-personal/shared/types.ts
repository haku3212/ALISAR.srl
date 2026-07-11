// Tipos compartidos entre el proceso main de Electron y el renderer (React).

export type WorkStatus = 'pendiente' | 'pagado';
export type FareStatus = 'pendiente' | 'devuelto';
export type CategoryType = 'ingreso' | 'gasto';

export interface WorkEntry {
  id: number;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM
  end_time: string | null; // HH:MM
  break_minutes: number;
  hours: number; // horas trabajadas (calculadas o ingresadas directamente)
  hourly_rate: number; // tarifa vigente al registrar
  amount: number; // hours * hourly_rate
  note: string;
  status: WorkStatus;
  paid_date: string | null;
}

export interface WorkEntryInput {
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  break_minutes?: number;
  hours?: number | null; // si no se dan horarios, se ingresa directo
  note?: string;
}

export interface Fare {
  id: number;
  date: string;
  outbound: number; // pasaje de ida
  inbound: number; // pasaje de vuelta
  total: number;
  description: string;
  status: FareStatus;
  refunded_date: string | null;
}

export interface FareInput {
  date: string;
  outbound: number;
  inbound: number;
  description?: string;
}

export interface Category {
  id: number;
  type: CategoryType;
  name: string;
  is_default: number; // 1 = categoría inicial del sistema
}

export interface Movement {
  id: number;
  date: string;
  category_id: number;
  description: string;
  amount: number;
  payment_method: string;
  note: string;
  work_entry_id: number | null; // ingresos generados al marcar horas como pagadas
}

export interface MovementInput {
  date: string;
  category_id: number;
  description?: string;
  amount: number;
  payment_method?: string;
  note?: string;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  start_date: string;
  target_date: string | null; // fecha objetivo opcional
}

export interface Budget {
  id: number;
  category_id: number;
  monthly_limit: number;
}

export interface Settings {
  user_name: string;
  currency: string; // "Bs"
  hourly_rate: number;
  week_start: 'lunes' | 'domingo';
  theme: 'claro' | 'oscuro';
  date_format: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  auto_backup: boolean;
}

export interface BackupInfo {
  file: string;
  path: string;
  date: string; // ISO
  size: number;
}

export interface AppData {
  settings: Settings;
  categories: Category[];
  workEntries: WorkEntry[];
  fares: Fare[];
  incomes: Movement[];
  expenses: Movement[];
  goal: Goal;
  budgets: Budget[];
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
