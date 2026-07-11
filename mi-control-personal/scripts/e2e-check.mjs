// Verificación funcional de la aplicación Electron real: navega por todas las
// páginas, registra datos por la interfaz y guarda capturas de pantalla.
// Ejecutar con: xvfb-run -a node scripts/e2e-check.mjs [dirCapturas]
import { _electron as electron } from 'playwright-core';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const shotsDir = process.argv[2] ?? path.join(root, 'capturas');
fs.mkdirSync(shotsDir, { recursive: true });

// Perfil limpio para que la semilla inicial se cree desde cero
const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-e2e-'));

const app = await electron.launch({
  args: [root, '--no-sandbox', '--disable-gpu'],
  cwd: root,
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1', MCP_USER_DATA: userData }
});

const page = await app.firstWindow();
await page.setViewportSize({ width: 1280, height: 820 });
await page.waitForSelector('.sidebar', { timeout: 15000 });
await page.waitForSelector('.card-value', { timeout: 15000 });

let failures = 0;
async function expectText(text, label) {
  const found = await page.getByText(text, { exact: false }).first().isVisible().catch(() => false);
  console.log(found ? `  ✔ ${label}` : `  ✘ ${label} (no se encontró "${text}")`);
  if (!found) failures++;
}

async function shot(name) {
  await page.screenshot({ path: path.join(shotsDir, name) });
}

async function goTo(label) {
  await page.click(`.nav-item:has-text("${label}")`);
  await page.waitForTimeout(300);
}

console.log('Dashboard:');
await expectText('Meta de ahorro: Bs 7.000,00', 'meta inicial Bs 7.000');
await expectText('Horas pendientes de pago', 'tarjeta de horas pendientes');
await expectText('Bs 175,50', 'pago pendiente Bs 175,50 (13 h)');
await expectText('Pasajes por devolver', 'tarjeta de pasajes');
await shot('01-dashboard.png');

console.log('Horas trabajadas:');
await goTo('Horas trabajadas');
await expectText('Bs 13,50', 'tarifa por hora Bs 13,50');
await expectText('Pendiente de recibir', 'total pendiente');
await shot('02-horas.png');

// Registrar horas nuevas desde la interfaz
await page.click('button:has-text("Registrar horas")');
await page.waitForSelector('.modal');
await page.fill('.modal input[type="number"]', '4');
await page.fill('.modal input[placeholder="Opcional"]', 'prueba e2e');
await page.click('.modal button:has-text("Guardar")');
await page.waitForTimeout(400);
await expectText('prueba e2e', 'registro nuevo de 4 h visible');

// Marcar el primero como pagado
await page.click('table.data >> nth=0 >> button:has-text("Pagado") >> nth=0');
await page.waitForTimeout(400);
await expectText('Historial de pagos recibidos', 'sección de pagos recibidos');
await shot('03-horas-pagado.png');

console.log('Pasajes:');
await goTo('Pasajes');
await expectText('Pendiente de devolución', 'total pendiente de devolución');
await expectText('Bs 12,00', 'pasaje de Bs 12');
await shot('04-pasajes.png');

console.log('Ingresos:');
await goTo('Ingresos');
await expectText('Total ingresos', 'tarjeta total ingresos');
await expectText('horas', 'ingreso automático generado por horas pagadas');
await shot('05-ingresos.png');

console.log('Gastos:');
await goTo('Gastos');
await expectText('Coca-Cola 2 litros', 'gasto de ejemplo Coca-Cola');
await expectText('Bs 42,00', 'total de gastos Bs 42');
// Registrar un gasto por la interfaz
await page.click('button:has-text("Registrar gasto")');
await page.waitForSelector('.modal');
await page.fill('.modal input[placeholder="0.00"]', '20');
await page.fill('.modal input[placeholder="Ej: Almuerzo"]', 'Almuerzo e2e');
await page.click('.modal button:has-text("Guardar")');
await page.waitForTimeout(400);
await expectText('Almuerzo e2e', 'gasto nuevo registrado');
await shot('06-gastos.png');

console.log('Meta de ahorro:');
await goTo('Meta de ahorro');
await expectText('Promedio diario de ahorro', 'promedios de ahorro');
await shot('07-meta.png');

console.log('Presupuesto:');
await goTo('Presupuesto');
await page.click('button:has-text("Nuevo límite mensual")');
await page.waitForSelector('.modal');
await page.click('.modal button:has-text("Guardar")');
await page.waitForTimeout(400);
await shot('08-presupuesto.png');

console.log('Calendario:');
await goTo('Calendario');
await expectText('Pulsa un día', 'vista calendario');
await shot('09-calendario.png');

console.log('Historial:');
await goTo('Historial');
await page.fill('input[placeholder*="coca"]', 'coca');
await page.waitForTimeout(300);
await expectText('Coca-Cola 2 litros', 'búsqueda por texto funciona');
await shot('10-historial.png');

console.log('Reportes:');
await goTo('Reportes');
await expectText('Ingresos del mes', 'resumen mensual');
await expectText('Progreso de la meta', 'progreso de meta en reporte');
await shot('11-reportes.png');

console.log('Configuración (y tema oscuro):');
await goTo('Configuración');
await page.selectOption('.field:has(label:text("Tema")) select', 'oscuro');
await page.click('button:has-text("Guardar configuración")');
await page.waitForTimeout(500);
await shot('12-configuracion-oscuro.png');
const theme = await page.evaluate(() => document.documentElement.dataset.theme);
console.log(theme === 'oscuro' ? '  ✔ tema oscuro aplicado' : '  ✘ tema oscuro NO aplicado');
if (theme !== 'oscuro') failures++;

await goTo('Inicio');
await shot('13-dashboard-oscuro.png');

// Verificar persistencia: la base debe existir en el perfil
const dbFiles = [];
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.db')) dbFiles.push(p);
  }
};
walk(userData);
console.log(dbFiles.length > 0 ? `  ✔ base de datos SQLite creada (${path.basename(dbFiles[0])})` : '  ✘ no se creó la base de datos');
if (dbFiles.length === 0) failures++;

await app.close();
fs.rmSync(userData, { recursive: true, force: true });

if (failures > 0) {
  console.log(`\n${failures} verificaciones fallaron.`);
  process.exit(1);
}
console.log('\nTodas las verificaciones de interfaz pasaron. Capturas en:', shotsDir);
