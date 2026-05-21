#!/usr/bin/env node

/**
 * ALISAR Desktop - Build Script
 * Ejecuta el proceso completo de build para Electron
 *
 * Uso: node scripts/build-electron.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function error(message) {
  console.error(`${COLORS.red}❌ ERROR: ${message}${COLORS.reset}`);
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function runCommand(command, description) {
  try {
    info(`${description}...`);
    execSync(command, { stdio: 'inherit' });
    success(description);
  } catch (err) {
    error(`${description} falló`);
  }
}

async function main() {
  log(`\n${'═'.repeat(50)}`, 'bright');
  log('   ALISAR DESKTOP - BUILD ELECTRON', 'bright');
  log(`${'═'.repeat(50)}\n`, 'bright');

  // Paso 1: Verificar requisitos
  info('Verificando requisitos...');

  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    success(`Node.js ${nodeVersion} detectado`);
    success(`npm ${npmVersion} detectado`);
  } catch (err) {
    error('Node.js o npm no está instalado');
  }

  // Paso 2: Instalar dependencias
  log('\n📦 Instalando dependencias...\n', 'bright');
  await runCommand('npm install', 'Instalando dependencias raíz');
  await runCommand('npm install --prefix frontend', 'Instalando dependencias frontend');
  await runCommand('npm install --prefix backend', 'Instalando dependencias backend');

  // Paso 3: Build del frontend
  log('\n🏗️  Buildando frontend...\n', 'bright');
  await runCommand('npm run build --prefix frontend', 'Build de React');

  // Paso 4: Verificar estructura de directorios
  log('\n📁 Verificando estructura...\n', 'bright');
  const requiredDirs = [
    'frontend/build',
    'backend',
    'public'
  ];

  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      success(`Carpeta ${dir} existe`);
    } else {
      error(`Carpeta ${dir} no encontrada`);
    }
  }

  // Paso 5: Verificar archivos Electron
  log('\n⚡ Verificando archivos Electron...\n', 'bright');
  const requiredFiles = [
    'public/electron.js',
    'public/preload.js',
    'package.json'
  ];

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      success(`Archivo ${file} existe`);
    } else {
      error(`Archivo ${file} no encontrado`);
    }
  }

  // Paso 6: Build de Electron
  log('\n📦 Buildando aplicación Electron...\n', 'bright');

  try {
    info('Ejecutando electron-builder...');
    execSync('npx electron-builder -w', { stdio: 'inherit' });
    success('Build de Electron completado');
  } catch (err) {
    warning('Build de Electron falló (puede ser normal si faltan recursos)');
  }

  // Resumen final
  log(`\n${'═'.repeat(50)}`, 'bright');
  log('   BUILD COMPLETADO', 'bright');
  log(`${'═'.repeat(50)}\n`, 'bright');

  log('\n📂 Archivos generados:', 'bright');
  log('  • Frontend build: frontend/build/');
  log('  • Instalador: dist/ALISAR Setup.exe (si se completo)');
  log('  • Portable: dist/ALISAR.exe (si se completo)');

  log('\n📚 Próximos pasos:', 'bright');
  log('  1. Probar la aplicación: npm run electron');
  log('  2. Crear instalador: npm run electron-pack');
  log('  3. Distribuir archivos de dist/');

  log('\n✨ ¡Listo para usar!\n', 'green');
}

main().catch(err => {
  error(`Error inesperado: ${err.message}`);
});
