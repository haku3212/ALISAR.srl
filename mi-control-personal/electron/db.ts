import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database } from 'sql.js';
import {
  AppData, Budget, Category, Fare, FareInput, Goal, Movement, MovementInput,
  Settings, WorkEntry, WorkEntryInput
} from '../shared/types';

let db: Database;
let dbPath: string;
let saveTimer: NodeJS.Timeout | null = null;

const DEFAULT_SETTINGS: Settings = {
  user_name: 'Armando',
  currency: 'Bs',
  hourly_rate: 13.5,
  week_start: 'lunes',
  theme: 'claro',
  date_format: 'DD/MM/YYYY',
  auto_backup: true
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('ingreso','gasto')),
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  UNIQUE (type, name)
);
CREATE TABLE IF NOT EXISTS work_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  hours REAL NOT NULL,
  hourly_rate REAL NOT NULL,
  amount REAL NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','pagado')),
  paid_date TEXT
);
CREATE TABLE IF NOT EXISTS fares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  outbound REAL NOT NULL DEFAULT 0,
  inbound REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','devuelto')),
  refunded_date TEXT
);
CREATE TABLE IF NOT EXISTS incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  description TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Efectivo',
  note TEXT NOT NULL DEFAULT '',
  work_entry_id INTEGER
);
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  description TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Efectivo',
  note TEXT NOT NULL DEFAULT '',
  work_entry_id INTEGER
);
CREATE TABLE IF NOT EXISTS goal (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  start_date TEXT NOT NULL,
  target_date TEXT
);
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL UNIQUE REFERENCES categories(id),
  monthly_limit REAL NOT NULL
);
`;

const INCOME_CATEGORIES = ['Trabajo', 'Intereses', 'Reembolso de pasaje', 'Ingreso extra', 'Transferencia', 'Otros'];
const EXPENSE_CATEGORIES = ['Comida', 'Bebidas', 'Recargas', 'Transporte', 'Compras personales', 'Salud', 'Entretenimiento', 'Servicios', 'Otros'];

// ---------- utilidades ----------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isValidDate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function isValidTime(s: unknown): s is string {
  return typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

function isValidAmount(n: unknown): n is number {
  return typeof n === 'number' && isFinite(n) && n >= 0;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export class ValidationError extends Error {}

function all<T>(sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject() as T);
  stmt.free();
  return rows;
}

function get<T>(sql: string, params: any[] = []): T | undefined {
  return all<T>(sql, params)[0];
}

function run(sql: string, params: any[] = []): void {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  scheduleSave();
}

function lastId(): number {
  return get<{ id: number }>('SELECT last_insert_rowid() AS id')!.id;
}

// ---------- persistencia ----------

export function saveNow(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!db || !dbPath) return;
  const data = Buffer.from(db.export());
  const tmp = dbPath + '.tmp';
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, dbPath);
}

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}

function locateWasm(): ArrayBuffer {
  const candidates = [
    path.join(__dirname, '..', '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    require.resolve('sql.js/dist/sql-wasm.wasm')
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) {
        const buf = fs.readFileSync(c);
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
      }
    } catch {
      /* siguiente candidato */
    }
  }
  throw new Error('No se encontró sql-wasm.wasm');
}

export async function initDb(filePath: string): Promise<void> {
  dbPath = filePath;
  const SQL = await initSqlJs({ wasmBinary: locateWasm() });
  const exists = fs.existsSync(dbPath);
  db = exists ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
  db.run(SCHEMA);
  if (!exists) {
    seed();
    saveNow();
  }
}

// ---------- datos iniciales ----------

function isoDateOfThisWeek(weekday: number): string {
  // weekday: 1 = lunes ... 7 = domingo, dentro de la semana actual
  const now = new Date();
  const current = now.getDay() === 0 ? 7 : now.getDay();
  const d = new Date(now);
  d.setDate(now.getDate() + (weekday - current));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seed(): void {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
  }
  for (const name of INCOME_CATEGORIES) {
    run('INSERT INTO categories (type, name, is_default) VALUES (?, ?, 1)', ['ingreso', name]);
  }
  for (const name of EXPENSE_CATEGORIES) {
    run('INSERT INTO categories (type, name, is_default) VALUES (?, ?, 1)', ['gasto', name]);
  }
  run('INSERT INTO goal (id, name, target_amount, start_date, target_date) VALUES (1, ?, ?, ?, NULL)', [
    'Meta de ahorro', 7000, todayStr()
  ]);

  // Datos de ejemplo: horas trabajadas (martes 3h, miércoles 5h, jueves 5h)
  const rate = DEFAULT_SETTINGS.hourly_rate;
  const sample: Array<[number, number]> = [[2, 3], [3, 5], [4, 5]];
  for (const [weekday, hours] of sample) {
    run(
      `INSERT INTO work_entries (date, hours, hourly_rate, amount, note, status)
       VALUES (?, ?, ?, ?, ?, 'pendiente')`,
      [isoDateOfThisWeek(weekday), hours, rate, round2(hours * rate), 'Registro de ejemplo']
    );
  }

  // Pasaje del martes: ida Bs 6, vuelta Bs 6, pendiente de devolución
  run(
    `INSERT INTO fares (date, outbound, inbound, total, description, status)
     VALUES (?, 6, 6, 12, 'Pasaje al trabajo', 'pendiente')`,
    [isoDateOfThisWeek(2)]
  );

  // Gastos de ejemplo
  const bebidas = get<{ id: number }>(`SELECT id FROM categories WHERE type='gasto' AND name='Bebidas'`)!.id;
  run(
    `INSERT INTO expenses (date, category_id, description, amount, payment_method) VALUES (?, ?, ?, ?, 'Efectivo')`,
    [isoDateOfThisWeek(2), bebidas, 'Coca-Cola 2 litros', 15]
  );
  run(
    `INSERT INTO expenses (date, category_id, description, amount, payment_method) VALUES (?, ?, ?, ?, 'Efectivo')`,
    [isoDateOfThisWeek(3), bebidas, 'Coca personal y chocolate', 27]
  );
}

// ---------- settings ----------

export function getSettings(): Settings {
  const rows = all<{ key: string; value: string }>('SELECT key, value FROM settings');
  const s: any = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    try {
      s[r.key] = JSON.parse(r.value);
    } catch {
      s[r.key] = r.value;
    }
  }
  return s as Settings;
}

export function updateSettings(patch: Partial<Settings>): Settings {
  if (patch.hourly_rate !== undefined && (!isValidAmount(patch.hourly_rate) || patch.hourly_rate <= 0)) {
    throw new ValidationError('El valor por hora debe ser un número mayor a 0.');
  }
  for (const [key, value] of Object.entries(patch)) {
    run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
      key, JSON.stringify(value)
    ]);
  }
  return getSettings();
}

// ---------- categorías ----------

export function listCategories(): Category[] {
  return all<Category>('SELECT * FROM categories ORDER BY type, name');
}

export function createCategory(type: string, name: string): Category {
  const clean = String(name || '').trim();
  if (!clean) throw new ValidationError('El nombre de la categoría no puede estar vacío.');
  if (type !== 'ingreso' && type !== 'gasto') throw new ValidationError('Tipo de categoría inválido.');
  const dup = get<Category>('SELECT * FROM categories WHERE type = ? AND LOWER(name) = LOWER(?)', [type, clean]);
  if (dup) throw new ValidationError(`Ya existe la categoría "${clean}".`);
  run('INSERT INTO categories (type, name, is_default) VALUES (?, ?, 0)', [type, clean]);
  return get<Category>('SELECT * FROM categories WHERE id = ?', [lastId()])!;
}

export function deleteCategory(id: number): void {
  const cat = get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  if (!cat) throw new ValidationError('La categoría no existe.');
  if (cat.is_default) throw new ValidationError('No se pueden eliminar las categorías iniciales.');
  const used =
    get<{ n: number }>('SELECT COUNT(*) AS n FROM incomes WHERE category_id = ?', [id])!.n +
    get<{ n: number }>('SELECT COUNT(*) AS n FROM expenses WHERE category_id = ?', [id])!.n;
  if (used > 0) throw new ValidationError('No se puede eliminar: la categoría tiene movimientos registrados.');
  run('DELETE FROM budgets WHERE category_id = ?', [id]);
  run('DELETE FROM categories WHERE id = ?', [id]);
}

// ---------- horas trabajadas ----------

function computeHours(input: WorkEntryInput): number {
  if (input.start_time && input.end_time) {
    if (!isValidTime(input.start_time) || !isValidTime(input.end_time)) {
      throw new ValidationError('Las horas deben tener formato HH:MM.');
    }
    const [sh, sm] = input.start_time.split(':').map(Number);
    const [eh, em] = input.end_time.split(':').map(Number);
    let minutes = eh * 60 + em - (sh * 60 + sm);
    if (minutes <= 0) throw new ValidationError('La hora de salida debe ser posterior a la hora de entrada.');
    const brk = input.break_minutes ?? 0;
    if (brk < 0 || !isFinite(brk)) throw new ValidationError('El descanso no puede ser negativo.');
    minutes -= brk;
    if (minutes <= 0) throw new ValidationError('El descanso no puede ser mayor o igual al tiempo trabajado.');
    return round2(minutes / 60);
  }
  const h = input.hours;
  if (typeof h !== 'number' || !isFinite(h) || h <= 0 || h > 24) {
    throw new ValidationError('Ingresa una cantidad de horas válida (entre 0 y 24) o la hora de entrada y salida.');
  }
  return round2(h);
}

function validateWorkInput(input: WorkEntryInput): { hours: number } {
  if (!isValidDate(input.date)) throw new ValidationError('La fecha no es válida.');
  return { hours: computeHours(input) };
}

export function listWorkEntries(): WorkEntry[] {
  return all<WorkEntry>('SELECT * FROM work_entries ORDER BY date DESC, id DESC');
}

export function createWorkEntry(input: WorkEntryInput): WorkEntry {
  const { hours } = validateWorkInput(input);
  const dup = get<WorkEntry>(
    `SELECT * FROM work_entries WHERE date = ? AND hours = ? AND IFNULL(start_time,'') = IFNULL(?,'') AND note = ?`,
    [input.date, hours, input.start_time ?? '', input.note ?? '']
  );
  if (dup) throw new ValidationError('Ya existe un registro idéntico de horas para esa fecha.');
  const rate = getSettings().hourly_rate;
  run(
    `INSERT INTO work_entries (date, start_time, end_time, break_minutes, hours, hourly_rate, amount, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.date, input.start_time ?? null, input.end_time ?? null, input.break_minutes ?? 0,
      hours, rate, round2(hours * rate), (input.note ?? '').trim()
    ]
  );
  return get<WorkEntry>('SELECT * FROM work_entries WHERE id = ?', [lastId()])!;
}

export function updateWorkEntry(id: number, input: WorkEntryInput): WorkEntry {
  const existing = get<WorkEntry>('SELECT * FROM work_entries WHERE id = ?', [id]);
  if (!existing) throw new ValidationError('El registro de horas no existe.');
  if (existing.status === 'pagado') throw new ValidationError('No se puede editar un registro ya pagado. Márcalo como pendiente primero.');
  const { hours } = validateWorkInput(input);
  run(
    `UPDATE work_entries SET date = ?, start_time = ?, end_time = ?, break_minutes = ?, hours = ?, amount = ?, note = ?
     WHERE id = ?`,
    [
      input.date, input.start_time ?? null, input.end_time ?? null, input.break_minutes ?? 0,
      hours, round2(hours * existing.hourly_rate), (input.note ?? '').trim(), id
    ]
  );
  return get<WorkEntry>('SELECT * FROM work_entries WHERE id = ?', [id])!;
}

export function deleteWorkEntry(id: number): void {
  const existing = get<WorkEntry>('SELECT * FROM work_entries WHERE id = ?', [id]);
  if (!existing) throw new ValidationError('El registro de horas no existe.');
  run('DELETE FROM incomes WHERE work_entry_id = ?', [id]);
  run('DELETE FROM work_entries WHERE id = ?', [id]);
}

export function setWorkEntryPaid(id: number, paid: boolean): WorkEntry {
  const entry = get<WorkEntry>('SELECT * FROM work_entries WHERE id = ?', [id]);
  if (!entry) throw new ValidationError('El registro de horas no existe.');
  if (paid && entry.status === 'pendiente') {
    const today = todayStr();
    run(`UPDATE work_entries SET status = 'pagado', paid_date = ? WHERE id = ?`, [today, id]);
    const cat = get<{ id: number }>(`SELECT id FROM categories WHERE type='ingreso' AND name='Trabajo'`)!;
    run(
      `INSERT INTO incomes (date, category_id, description, amount, payment_method, note, work_entry_id)
       VALUES (?, ?, ?, ?, 'Efectivo', 'Generado automáticamente al marcar horas como pagadas', ?)`,
      [today, cat.id, `Pago por ${entry.hours} h trabajadas el ${entry.date}`, entry.amount, id]
    );
  } else if (!paid && entry.status === 'pagado') {
    run(`UPDATE work_entries SET status = 'pendiente', paid_date = NULL WHERE id = ?`, [id]);
    run('DELETE FROM incomes WHERE work_entry_id = ?', [id]);
  }
  return get<WorkEntry>('SELECT * FROM work_entries WHERE id = ?', [id])!;
}

// ---------- pasajes ----------

function validateFare(input: FareInput): void {
  if (!isValidDate(input.date)) throw new ValidationError('La fecha del pasaje no es válida.');
  if (!isValidAmount(input.outbound) || !isValidAmount(input.inbound)) {
    throw new ValidationError('Los montos del pasaje deben ser números mayores o iguales a 0.');
  }
  if (input.outbound + input.inbound <= 0) throw new ValidationError('El total del pasaje debe ser mayor a 0.');
}

export function listFares(): Fare[] {
  return all<Fare>('SELECT * FROM fares ORDER BY date DESC, id DESC');
}

export function createFare(input: FareInput): Fare {
  validateFare(input);
  const total = round2(input.outbound + input.inbound);
  const dup = get<Fare>('SELECT * FROM fares WHERE date = ? AND total = ? AND description = ?', [
    input.date, total, (input.description ?? '').trim()
  ]);
  if (dup) throw new ValidationError('Ya existe un pasaje idéntico registrado para esa fecha.');
  run('INSERT INTO fares (date, outbound, inbound, total, description) VALUES (?, ?, ?, ?, ?)', [
    input.date, round2(input.outbound), round2(input.inbound), total, (input.description ?? '').trim()
  ]);
  return get<Fare>('SELECT * FROM fares WHERE id = ?', [lastId()])!;
}

export function updateFare(id: number, input: FareInput): Fare {
  const existing = get<Fare>('SELECT * FROM fares WHERE id = ?', [id]);
  if (!existing) throw new ValidationError('El pasaje no existe.');
  validateFare(input);
  run('UPDATE fares SET date = ?, outbound = ?, inbound = ?, total = ?, description = ? WHERE id = ?', [
    input.date, round2(input.outbound), round2(input.inbound), round2(input.outbound + input.inbound),
    (input.description ?? '').trim(), id
  ]);
  return get<Fare>('SELECT * FROM fares WHERE id = ?', [id])!;
}

export function deleteFare(id: number): void {
  const existing = get<Fare>('SELECT * FROM fares WHERE id = ?', [id]);
  if (!existing) throw new ValidationError('El pasaje no existe.');
  run('DELETE FROM fares WHERE id = ?', [id]);
}

export function setFareStatus(id: number, refunded: boolean): Fare {
  const existing = get<Fare>('SELECT * FROM fares WHERE id = ?', [id]);
  if (!existing) throw new ValidationError('El pasaje no existe.');
  if (refunded) {
    run(`UPDATE fares SET status = 'devuelto', refunded_date = ? WHERE id = ?`, [todayStr(), id]);
  } else {
    run(`UPDATE fares SET status = 'pendiente', refunded_date = NULL WHERE id = ?`, [id]);
  }
  return get<Fare>('SELECT * FROM fares WHERE id = ?', [id])!;
}

// ---------- ingresos y gastos ----------

function validateMovement(input: MovementInput, type: 'ingreso' | 'gasto'): void {
  if (!isValidDate(input.date)) throw new ValidationError('La fecha no es válida.');
  if (!isValidAmount(input.amount) || input.amount <= 0) {
    throw new ValidationError('El monto debe ser un número mayor a 0.');
  }
  const cat = get<Category>('SELECT * FROM categories WHERE id = ?', [input.category_id]);
  if (!cat || cat.type !== type) throw new ValidationError('Selecciona una categoría válida.');
}

function movementTable(type: 'ingreso' | 'gasto'): string {
  return type === 'ingreso' ? 'incomes' : 'expenses';
}

export function listMovements(type: 'ingreso' | 'gasto'): Movement[] {
  return all<Movement>(`SELECT * FROM ${movementTable(type)} ORDER BY date DESC, id DESC`);
}

export function createMovement(type: 'ingreso' | 'gasto', input: MovementInput): Movement {
  validateMovement(input, type);
  const t = movementTable(type);
  const dup = get<Movement>(
    `SELECT * FROM ${t} WHERE date = ? AND amount = ? AND description = ? AND category_id = ?`,
    [input.date, input.amount, (input.description ?? '').trim(), input.category_id]
  );
  if (dup) throw new ValidationError('Ya existe un movimiento idéntico para esa fecha. Revisa si es un duplicado.');
  run(
    `INSERT INTO ${t} (date, category_id, description, amount, payment_method, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.date, input.category_id, (input.description ?? '').trim(), round2(input.amount),
      input.payment_method ?? 'Efectivo', (input.note ?? '').trim()
    ]
  );
  return get<Movement>(`SELECT * FROM ${t} WHERE id = ?`, [lastId()])!;
}

export function updateMovement(type: 'ingreso' | 'gasto', id: number, input: MovementInput): Movement {
  const t = movementTable(type);
  const existing = get<Movement>(`SELECT * FROM ${t} WHERE id = ?`, [id]);
  if (!existing) throw new ValidationError('El movimiento no existe.');
  if (existing.work_entry_id) {
    throw new ValidationError('Este ingreso fue generado desde las horas trabajadas; edítalo desde esa sección.');
  }
  validateMovement(input, type);
  run(
    `UPDATE ${t} SET date = ?, category_id = ?, description = ?, amount = ?, payment_method = ?, note = ? WHERE id = ?`,
    [
      input.date, input.category_id, (input.description ?? '').trim(), round2(input.amount),
      input.payment_method ?? 'Efectivo', (input.note ?? '').trim(), id
    ]
  );
  return get<Movement>(`SELECT * FROM ${t} WHERE id = ?`, [id])!;
}

export function deleteMovement(type: 'ingreso' | 'gasto', id: number): void {
  const t = movementTable(type);
  const existing = get<Movement>(`SELECT * FROM ${t} WHERE id = ?`, [id]);
  if (!existing) throw new ValidationError('El movimiento no existe.');
  if (existing.work_entry_id) {
    throw new ValidationError('Este ingreso está vinculado a horas trabajadas; desmárcalas como pagadas para eliminarlo.');
  }
  run(`DELETE FROM ${t} WHERE id = ?`, [id]);
}

// ---------- meta ----------

export function getGoal(): Goal {
  return get<Goal>('SELECT * FROM goal WHERE id = 1')!;
}

export function updateGoal(patch: { name?: string; target_amount?: number; start_date?: string; target_date?: string | null }): Goal {
  const current = getGoal();
  const name = (patch.name ?? current.name).trim() || 'Meta de ahorro';
  const target = patch.target_amount ?? current.target_amount;
  if (!isValidAmount(target) || target <= 0) throw new ValidationError('El monto de la meta debe ser mayor a 0.');
  const start = patch.start_date ?? current.start_date;
  if (!isValidDate(start)) throw new ValidationError('La fecha de inicio no es válida.');
  const targetDate = patch.target_date === undefined ? current.target_date : patch.target_date;
  if (targetDate !== null && !isValidDate(targetDate)) throw new ValidationError('La fecha objetivo no es válida.');
  run('UPDATE goal SET name = ?, target_amount = ?, start_date = ?, target_date = ? WHERE id = 1', [
    name, round2(target), start, targetDate
  ]);
  return getGoal();
}

// ---------- presupuestos ----------

export function listBudgets(): Budget[] {
  return all<Budget>('SELECT * FROM budgets ORDER BY id');
}

export function upsertBudget(categoryId: number, monthlyLimit: number): Budget {
  if (!isValidAmount(monthlyLimit) || monthlyLimit <= 0) {
    throw new ValidationError('El límite mensual debe ser mayor a 0.');
  }
  const cat = get<Category>('SELECT * FROM categories WHERE id = ?', [categoryId]);
  if (!cat || cat.type !== 'gasto') throw new ValidationError('Selecciona una categoría de gasto válida.');
  run(
    `INSERT INTO budgets (category_id, monthly_limit) VALUES (?, ?)
     ON CONFLICT(category_id) DO UPDATE SET monthly_limit = excluded.monthly_limit`,
    [categoryId, round2(monthlyLimit)]
  );
  return get<Budget>('SELECT * FROM budgets WHERE category_id = ?', [categoryId])!;
}

export function deleteBudget(id: number): void {
  run('DELETE FROM budgets WHERE id = ?', [id]);
}

// ---------- carga completa ----------

export function getAppData(): AppData {
  return {
    settings: getSettings(),
    categories: listCategories(),
    workEntries: listWorkEntries(),
    fares: listFares(),
    incomes: listMovements('ingreso'),
    expenses: listMovements('gasto'),
    goal: getGoal(),
    budgets: listBudgets()
  };
}

// ---------- respaldos ----------

export function getDbPath(): string {
  return dbPath;
}

export function createBackup(backupDir: string): string {
  saveNow();
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dest = path.join(backupDir, `respaldo-${stamp}.db`);
  fs.copyFileSync(dbPath, dest);
  return dest;
}

export function listBackups(backupDir: string): Array<{ file: string; path: string; date: string; size: number }> {
  if (!fs.existsSync(backupDir)) return [];
  return fs
    .readdirSync(backupDir)
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const p = path.join(backupDir, f);
      const st = fs.statSync(p);
      return { file: f, path: p, date: st.mtime.toISOString(), size: st.size };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function restoreBackup(sourcePath: string): Promise<void> {
  if (!fs.existsSync(sourcePath)) throw new ValidationError('El archivo de respaldo no existe.');
  const bytes = fs.readFileSync(sourcePath);
  // Validar que sea una base de datos de esta aplicación antes de reemplazar.
  const SQL = await initSqlJs({ wasmBinary: locateWasm() });
  const candidate = new SQL.Database(bytes);
  try {
    const tables = candidate.exec(`SELECT name FROM sqlite_master WHERE type='table'`);
    const names = tables.length ? tables[0].values.map((v) => String(v[0])) : [];
    for (const required of ['work_entries', 'fares', 'incomes', 'expenses', 'goal']) {
      if (!names.includes(required)) {
        throw new ValidationError('El archivo seleccionado no es un respaldo válido de Mi Control Personal.');
      }
    }
  } finally {
    candidate.close();
  }
  db.close();
  db = new SQL.Database(bytes);
  db.run(SCHEMA);
  saveNow();
}
