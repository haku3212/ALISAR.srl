require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

// ─── IMPORTAR RUTAS ───────────────────────────────────────────────────────────
const createAuthRoutes      = require('./routes/auth');
const createPersonalRoutes  = require('./routes/personal');
const createMaquinariaRoutes = require('./routes/maquinaria');
const createObrasRoutes     = require('./routes/obras');
const createMaderaRoutes    = require('./routes/madera');
const createRodeosRoutes    = require('./routes/rodeos');
const createDocumentosRoutes = require('./routes/documentos');
const createAuditRoutes     = require('./routes/audit');
const createConfigRoutes    = require('./routes/config');
const createBackupRoutes    = require('./routes/backup');
const createPasswordRoutes  = require('./routes/password');
const { createLogAudit }    = require('./utils/audit');

// ─── INICIALIZACIÓN ───────────────────────────────────────────────────────────
(async () => {
  const db = await open({ filename: './database.db', driver: sqlite3.Database });

  // Crear todas las tablas si no existen
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT DEFAULT 'residente',
      estado TEXT DEFAULT 'activo',
      fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS personal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cargo TEXT,
      celular TEXT,
      estado TEXT DEFAULT 'Activo'
    );
    CREATE TABLE IF NOT EXISTS maquinaria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT,
      estado TEXT,
      ultimaRevision TEXT
    );
    CREATE TABLE IF NOT EXISTS obras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      avance INTEGER DEFAULT 0,
      presupuesto TEXT
    );
    CREATE TABLE IF NOT EXISTS madera (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      especie TEXT NOT NULL,
      piezas INTEGER,
      volumen TEXT,
      campamento TEXT
    );
    CREATE TABLE IF NOT EXISTS rodeos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha_rodeo TEXT NOT NULL,
      volumen_total REAL,
      responsable_rodeo TEXT NOT NULL,
      procedencia TEXT NOT NULL,
      destino_final TEXT NOT NULL,
      especie_principal TEXT,
      estado_operacion TEXT DEFAULT 'Activo',
      lat REAL,
      lng REAL,
      descripcion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento TEXT NOT NULL,
      numero_documento TEXT NOT NULL,
      entidad_emisora TEXT NOT NULL,
      responsable TEXT,
      fecha_emision TEXT NOT NULL,
      fecha_vencimiento TEXT NOT NULL,
      periodo_validez TEXT,
      asociado_rodeo INTEGER,
      descripcion TEXT,
      estado TEXT DEFAULT 'Vigente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT,
      accion TEXT NOT NULL,
      tabla TEXT NOT NULL,
      registro_id INTEGER,
      valores_anteriores TEXT,
      valores_nuevos TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clave TEXT UNIQUE NOT NULL,
      valor TEXT,
      tipo TEXT DEFAULT 'string',
      actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Datos semilla — solo si las tablas están vacías
  const seeds = {
    personal: [
      "INSERT INTO personal (nombre, cargo, celular) VALUES ('Carlos Mendoza', 'Operador de Motoniveladora', '78231456')",
      "INSERT INTO personal (nombre, cargo, celular) VALUES ('Luis Fernando Arce', 'Ingeniero de Residencia', '67129843')"
    ],
    obras: [
      "INSERT INTO obras (nombre, avance, presupuesto) VALUES ('Mantenimiento Tramo Vial Riberalta', 45, '150,000 Bs')",
      "INSERT INTO obras (nombre, avance, presupuesto) VALUES ('Apertura de Sendas Campamento 1', 12, '85,000 Bs')"
    ],
    maquinaria: [
      "INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Motoniveladora CAT 140H', 'Motoniveladora', 'Operativo', '2025-10-15')",
      "INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Excavadora Komatsu PC200', 'Excavadora', 'Mantenimiento', '2025-09-20')",
      "INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Volquete Scania 6x4', 'Volquete', 'Operativo', '2025-11-01')"
    ],
    madera: [
      "INSERT INTO madera (especie, piezas, volumen, campamento) VALUES ('Almendrillo', 45, '12.5 m3', 'Sena')",
      "INSERT INTO madera (especie, piezas, volumen, campamento) VALUES ('Tajibo', 30, '8.2 m3', 'Bella Unión')"
    ],
    config: [
      "INSERT INTO config (clave, valor, tipo) VALUES ('empresa_nombre', 'ALISAR SRL', 'string')",
      "INSERT INTO config (clave, valor, tipo) VALUES ('empresa_ubicacion', 'Riberalta, Beni, Bolivia', 'string')",
      "INSERT INTO config (clave, valor, tipo) VALUES ('empresa_moneda', 'Bs', 'string')",
      "INSERT INTO config (clave, valor, tipo) VALUES ('empresa_idioma', 'es', 'string')",
      "INSERT INTO config (clave, valor, tipo) VALUES ('tema_modo', 'oscuro', 'string')"
    ]
  };

  for (const [tabla, inserts] of Object.entries(seeds)) {
    const { total } = await db.get(`SELECT COUNT(*) as total FROM ${tabla}`);
    if (total === 0) {
      for (const sql of inserts) await db.run(sql);
      console.log(`🌱 Datos de ${tabla} inicializados.`);
    }
  }

  console.log('✅ Base de Datos SQLite sincronizada correctamente.');

  // ─── MONTAR RUTAS ─────────────────────────────────────────────────────────
  const logAudit = createLogAudit(db);

  app.use('/api/auth',       createAuthRoutes(db));
  app.use('/api/auth',       createPasswordRoutes(db, logAudit));
  app.use('/api/personal',   createPersonalRoutes(db, logAudit));
  app.use('/api/maquinaria', createMaquinariaRoutes(db, logAudit));
  app.use('/api/obras',      createObrasRoutes(db, logAudit));
  app.use('/api/madera',     createMaderaRoutes(db, logAudit));
  app.use('/api/rodeos',     createRodeosRoutes(db, logAudit));
  app.use('/api/documentos', createDocumentosRoutes(db, logAudit));
  app.use('/api/audit',      createAuditRoutes(db));
  app.use('/api/config',     createConfigRoutes(db));
  app.use('/api/backup',     createBackupRoutes(db));

  // ─── INICIAR SERVIDOR ─────────────────────────────────────────────────────
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 API activa en http://localhost:${PORT}`));
})();
