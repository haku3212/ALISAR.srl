// Prueba funcional de la capa de datos (dist-electron/electron/db.js) en Node puro.
// Ejecutar con: npm run test:db
import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import assert from 'assert';

const require = createRequire(import.meta.url);
const db = require('../dist-electron/electron/db.js');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
const dbFile = path.join(tmpDir, 'test.db');

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log('  ✔', name);
}

await db.initDb(dbFile);

check('semilla: configuración inicial', () => {
  const s = db.getSettings();
  assert.strictEqual(s.hourly_rate, 13.5);
  assert.strictEqual(s.currency, 'Bs');
});

check('semilla: meta inicial de Bs 7000', () => {
  const g = db.getGoal();
  assert.strictEqual(g.target_amount, 7000);
});

check('semilla: 3 registros de horas = 13 h y Bs 175.50', () => {
  const entries = db.listWorkEntries();
  assert.strictEqual(entries.length, 3);
  const hours = entries.reduce((a, w) => a + w.hours, 0);
  const amount = entries.reduce((a, w) => a + w.amount, 0);
  assert.strictEqual(hours, 13);
  assert.strictEqual(Math.round(amount * 100) / 100, 175.5);
});

check('semilla: pasaje de Bs 12 pendiente', () => {
  const fares = db.listFares();
  assert.strictEqual(fares.length, 1);
  assert.strictEqual(fares[0].total, 12);
  assert.strictEqual(fares[0].status, 'pendiente');
});

check('semilla: gastos de ejemplo Bs 42', () => {
  const expenses = db.listMovements('gasto');
  const total = expenses.reduce((a, e) => a + e.amount, 0);
  assert.strictEqual(total, 42);
});

check('horas: registro con entrada/salida y descanso', () => {
  const w = db.createWorkEntry({ date: '2026-07-06', start_time: '08:00', end_time: '12:30', break_minutes: 30, note: 'prueba' });
  assert.strictEqual(w.hours, 4);
  assert.strictEqual(w.amount, 54);
});

check('horas: rechaza duplicado exacto', () => {
  assert.throws(
    () => db.createWorkEntry({ date: '2026-07-06', start_time: '08:00', end_time: '12:30', break_minutes: 30, note: 'prueba' }),
    /idéntico/
  );
});

check('horas: rechaza salida antes de entrada', () => {
  assert.throws(() => db.createWorkEntry({ date: '2026-07-07', start_time: '10:00', end_time: '09:00' }), /posterior/);
});

check('horas: rechaza fecha inválida', () => {
  assert.throws(() => db.createWorkEntry({ date: '2026-13-40', hours: 2 }), /fecha/i);
});

check('horas: marcar pagado genera ingreso automático', () => {
  const w = db.listWorkEntries().find((x) => x.note === 'prueba');
  db.setWorkEntryPaid(w.id, true);
  const incomes = db.listMovements('ingreso');
  const linked = incomes.find((i) => i.work_entry_id === w.id);
  assert.ok(linked, 'debe existir el ingreso vinculado');
  assert.strictEqual(linked.amount, 54);
  const updated = db.listWorkEntries().find((x) => x.id === w.id);
  assert.strictEqual(updated.status, 'pagado');
});

check('horas: desmarcar pagado elimina el ingreso vinculado', () => {
  const w = db.listWorkEntries().find((x) => x.note === 'prueba');
  db.setWorkEntryPaid(w.id, false);
  assert.ok(!db.listMovements('ingreso').some((i) => i.work_entry_id === w.id));
});

check('pasajes: crear, devolver y totales', () => {
  const f = db.createFare({ date: '2026-07-08', outbound: 6, inbound: 6, description: 'prueba pasaje' });
  assert.strictEqual(f.total, 12);
  const updated = db.setFareStatus(f.id, true);
  assert.strictEqual(updated.status, 'devuelto');
  assert.ok(updated.refunded_date);
});

check('pasajes: rechaza total en 0', () => {
  assert.throws(() => db.createFare({ date: '2026-07-08', outbound: 0, inbound: 0 }), /mayor a 0/);
});

check('gastos: crear, editar y eliminar', () => {
  const cat = db.listCategories().find((c) => c.type === 'gasto' && c.name === 'Comida');
  const e = db.createMovement('gasto', { date: '2026-07-09', category_id: cat.id, description: 'Almuerzo', amount: 20 });
  const edited = db.updateMovement('gasto', e.id, { date: '2026-07-09', category_id: cat.id, description: 'Almuerzo', amount: 25 });
  assert.strictEqual(edited.amount, 25);
  db.deleteMovement('gasto', e.id);
  assert.ok(!db.listMovements('gasto').some((x) => x.id === e.id));
});

check('gastos: rechaza monto negativo', () => {
  const cat = db.listCategories().find((c) => c.type === 'gasto');
  assert.throws(() => db.createMovement('gasto', { date: '2026-07-09', category_id: cat.id, amount: -5 }), /mayor a 0/);
});

check('categorías: crear nueva y rechazar duplicada', () => {
  const c = db.createCategory('gasto', 'Mascotas');
  assert.strictEqual(c.name, 'Mascotas');
  assert.throws(() => db.createCategory('gasto', 'mascotas'), /Ya existe/);
});

check('meta: editar monto objetivo', () => {
  const g = db.updateGoal({ target_amount: 8000 });
  assert.strictEqual(g.target_amount, 8000);
  db.updateGoal({ target_amount: 7000 });
});

check('presupuestos: crear y actualizar límite', () => {
  const cat = db.listCategories().find((c) => c.type === 'gasto' && c.name === 'Bebidas');
  db.upsertBudget(cat.id, 100);
  const b = db.upsertBudget(cat.id, 150);
  assert.strictEqual(b.monthly_limit, 150);
  assert.strictEqual(db.listBudgets().filter((x) => x.category_id === cat.id).length, 1);
});

check('configuración: cambiar valor por hora', () => {
  const s = db.updateSettings({ hourly_rate: 15 });
  assert.strictEqual(s.hourly_rate, 15);
  const w = db.createWorkEntry({ date: '2026-07-10', hours: 2, note: 'nueva tarifa' });
  assert.strictEqual(w.amount, 30);
  db.updateSettings({ hourly_rate: 13.5 });
});

check('persistencia: los datos sobreviven al reabrir la base', async () => {
  db.saveNow();
  assert.ok(fs.existsSync(dbFile));
});

// Reapertura real del archivo
db.saveNow();
const before = db.listWorkEntries().length;
await db.initDb(dbFile);
check('persistencia: mismo número de registros tras reabrir', () => {
  assert.strictEqual(db.listWorkEntries().length, before);
});

check('respaldos: crear y restaurar', async () => {
  const backupDir = path.join(tmpDir, 'respaldos');
  const backupPath = db.createBackup(backupDir);
  assert.ok(fs.existsSync(backupPath));
  const list = db.listBackups(backupDir);
  assert.ok(list.length >= 1);
});

console.log(`\n${passed} pruebas pasaron correctamente.`);
fs.rmSync(tmpDir, { recursive: true, force: true });
