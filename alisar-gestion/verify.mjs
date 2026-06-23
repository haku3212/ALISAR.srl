import { _electron as electron } from 'playwright-core';
import * as fs from 'node:fs';
import * as path from 'node:path';

const APP_DIR = '/home/user/ALISAR.srl/alisar-gestion';
const SHOT_DIR = '/tmp/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const electronBin = path.join(APP_DIR, 'node_modules/electron/dist/electron');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ss = async (page, name) => {
  const f = path.join(SHOT_DIR, name + '.png');
  await page.screenshot({ path: f });
  console.log('screenshot:', f);
};

// Set React-controlled input value
const fillInput = (page, sel, val) => page.evaluate(([s, v]) => {
  const el = document.querySelector(s);
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, v);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}, [sel, val]);

async function run() {
  console.log('Launching Electron in production mode...');
  const app = await electron.launch({
    executablePath: electronBin,
    args: ['--no-sandbox', APP_DIR],
    env: { ...process.env, DISPLAY: process.env.DISPLAY || ':99', NODE_ENV: 'production' },
    timeout: 45000,
  });

  // production mode: electron.js spawns backend (10s timeout) then creates window
  await sleep(18000);

  const allWindows = app.windows();
  console.log('Total windows:', allWindows.length);
  for (const w of allWindows) console.log('  -', w.url());

  const page = allWindows.find(w =>
    !w.url().startsWith('devtools://') && !w.url().startsWith('chrome-error://')
  );

  if (!page) {
    console.log('ERROR: No usable window found (chrome-error = build missing or CSP issue)');
    const errPage = allWindows.find(w => w.url().startsWith('chrome-error://'));
    if (errPage) {
      const txt = await errPage.evaluate(() => document.body?.innerText).catch(() => '(unreadable)');
      console.log('chrome-error content:', txt.slice(0, 300));
    }
    await app.close();
    return;
  }

  console.log('Using page:', page.url());
  await ss(page, '01-login');

  // Read what's on screen
  const loginText = await page.evaluate(() => document.body.innerText).catch(() => '');
  console.log('Login page text:', loginText.slice(0, 200));

  // Wait for login form
  await page.waitForSelector('input[type="password"]', { timeout: 8000 }).catch(() => {});

  // --- Test 1: Wrong password ---
  await fillInput(page, 'input[type="text"], input:not([type="password"])', 'admin');
  await fillInput(page, 'input[type="password"]', 'wrongpassword');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]') || document.querySelector('form button');
    if (btn) btn.click();
  });
  await sleep(3000);
  await ss(page, '02-wrong-password');

  const afterWrongPwd = await page.evaluate(() => document.body.innerText).catch(() => '');
  const hasError = /error|inválid|incorr|contraseña|usuario/i.test(afterWrongPwd);
  const stillOnLogin = /iniciar|login|ingresar/i.test(afterWrongPwd);
  console.log('\n=== Test 1: Wrong password ===');
  console.log('Error message shown:', hasError ? '✅ YES' : '❌ NO');
  console.log('Still on login page:', stillOnLogin ? '✅ YES' : '❌ NO (may have redirected)');
  console.log('Page text:', afterWrongPwd.slice(0, 300));

  // --- Test 2: Login as admin ---
  await fillInput(page, 'input[type="text"], input:not([type="password"])', 'admin');
  await fillInput(page, 'input[type="password"]', 'admin123');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]') || document.querySelector('form button');
    if (btn) btn.click();
  });
  await sleep(4000);
  await ss(page, '03-admin-dashboard');

  const dashText = await page.evaluate(() => document.body.innerText).catch(() => '');
  const hasHistorial = /historial/i.test(dashText);
  const hasConfig = /configuraci/i.test(dashText);
  console.log('\n=== Test 2: Admin dashboard nav ===');
  console.log('Historial in nav:', hasHistorial ? '✅ YES' : '❌ NO');
  console.log('Configuración in nav:', hasConfig ? '✅ YES' : '❌ NO');
  console.log('Dashboard text:', dashText.slice(0, 400));

  await app.close();
  console.log('\nVerification complete. Screenshots in /tmp/shots/');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
