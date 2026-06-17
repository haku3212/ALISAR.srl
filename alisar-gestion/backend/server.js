require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no está definido en las variables de entorno.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '5mb' }));

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
      estado TEXT DEFAULT 'Activo',
      email TEXT,
      departamento TEXT,
      fecha_ingreso TEXT,
      tipo_contrato TEXT
    );
    CREATE TABLE IF NOT EXISTS maquinaria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT,
      estado TEXT,
      ultimaRevision TEXT,
      modelo TEXT,
      anio TEXT,
      numero_serie TEXT,
      horas_operacion TEXT,
      operador_asignado TEXT
    );
    CREATE TABLE IF NOT EXISTS obras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      avance INTEGER DEFAULT 0,
      presupuesto TEXT,
      tipo TEXT,
      cliente TEXT,
      descripcion TEXT,
      responsable_tecnico TEXT,
      inicio_planeado TEXT,
      fin_planeado TEXT,
      observaciones TEXT
    );
    CREATE TABLE IF NOT EXISTS madera (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      especie TEXT NOT NULL,
      piezas INTEGER,
      volumen TEXT,
      campamento TEXT,
      procedencia TEXT,
      destino TEXT,
      tipo_corte TEXT
    );
    CREATE TABLE IF NOT EXISTS rodeos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha_rodeo TEXT NOT NULL,
      volumen_total REAL,
      responsable_rodeo TEXT NOT NULL,
      procedencia TEXT NOT NULL,
      destino_final TEXT NOT NULL,
      especie_principal TEXT,
      otras_especies TEXT,
      contrato_asociado TEXT,
      ubicacion_origen TEXT,
      ubicacion_origen_coords TEXT,
      ubicacion_destino TEXT,
      ubicacion_destino_coords TEXT,
      fecha_transporte TEXT,
      estado_operacion TEXT DEFAULT 'Activo',
      lat REAL,
      lng REAL,
      descripcion TEXT,
      poat_numero TEXT,
      poat_vencimiento TEXT,
      otros_permisos TEXT,
      fecha_limite_permisos TEXT,
      observaciones TEXT,
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
      asociado_proyecto TEXT,
      asociado_maquinaria TEXT,
      asociado_campamento TEXT,
      referencia_archivo TEXT,
      url_documento TEXT,
      descripcion TEXT,
      observaciones TEXT,
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

  // Migración: agrega columnas nuevas a tablas existentes (ignora si ya existen)
  const addCol = async (table, col, def) => {
    try { await db.run(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch (_) {}
  };
  await addCol('rodeos', 'otras_especies', 'TEXT');
  await addCol('rodeos', 'contrato_asociado', 'TEXT');
  await addCol('rodeos', 'ubicacion_origen', 'TEXT');
  await addCol('rodeos', 'ubicacion_origen_coords', 'TEXT');
  await addCol('rodeos', 'ubicacion_destino', 'TEXT');
  await addCol('rodeos', 'ubicacion_destino_coords', 'TEXT');
  await addCol('rodeos', 'fecha_transporte', 'TEXT');
  await addCol('rodeos', 'poat_numero', 'TEXT');
  await addCol('rodeos', 'poat_vencimiento', 'TEXT');
  await addCol('rodeos', 'otros_permisos', 'TEXT');
  await addCol('rodeos', 'fecha_limite_permisos', 'TEXT');
  await addCol('rodeos', 'observaciones', 'TEXT');
  await addCol('documentos', 'asociado_proyecto', 'TEXT');
  await addCol('documentos', 'asociado_maquinaria', 'TEXT');
  await addCol('documentos', 'asociado_campamento', 'TEXT');
  await addCol('documentos', 'referencia_archivo', 'TEXT');
  await addCol('documentos', 'url_documento', 'TEXT');
  await addCol('documentos', 'observaciones', 'TEXT');
  await addCol('obras', 'tipo', 'TEXT');
  await addCol('obras', 'cliente', 'TEXT');
  await addCol('obras', 'descripcion', 'TEXT');
  await addCol('obras', 'responsable_tecnico', 'TEXT');
  await addCol('obras', 'inicio_planeado', 'TEXT');
  await addCol('obras', 'fin_planeado', 'TEXT');
  await addCol('obras', 'observaciones', 'TEXT');
  await addCol('personal', 'email', 'TEXT');
  await addCol('personal', 'departamento', 'TEXT');
  await addCol('personal', 'fecha_ingreso', 'TEXT');
  await addCol('personal', 'tipo_contrato', 'TEXT');
  await addCol('maquinaria', 'modelo', 'TEXT');
  await addCol('maquinaria', 'anio', 'TEXT');
  await addCol('maquinaria', 'numero_serie', 'TEXT');
  await addCol('maquinaria', 'horas_operacion', 'TEXT');
  await addCol('maquinaria', 'operador_asignado', 'TEXT');
  await addCol('madera', 'procedencia', 'TEXT');
  await addCol('madera', 'destino', 'TEXT');
  await addCol('madera', 'tipo_corte', 'TEXT');

  await db.run(`CREATE INDEX IF NOT EXISTS idx_audit_tabla ON audit_logs(tabla, registro_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_docs_estado ON documentos(estado, fecha_vencimiento)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_maq_estado ON maquinaria(estado)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_personal_estado ON personal(estado)`);

  // Datos semilla — solo si las tablas están vacías
  const bcrypt = require('bcryptjs');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const seeds = {
    users: [
      `INSERT INTO users (nombre, usuario, password, rol) VALUES ('Administrador', 'admin', '${adminHash}', 'admin')`
    ],
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
    rodeos: [
      `INSERT INTO rodeos (fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final, especie_principal, contrato_asociado, estado_operacion, poat_numero, poat_vencimiento, observaciones)
       VALUES ('2026-03-15', 48.5, 'Juan Pablo Suárez', 'Comunidad San Miguel Norte', 'Aserradero El Pino - Riberalta', 'mara', 'CTR-2026-001', 'Completado', 'POAT-2026-001', '2026-12-31', 'Primera operación del año. Sin incidentes.')`,
      `INSERT INTO rodeos (fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final, especie_principal, otras_especies, contrato_asociado, estado_operacion, poat_numero, poat_vencimiento)
       VALUES ('2026-05-10', 62.0, 'Carlos Mendoza', 'Campamento Bella Unión - Sector B', 'Depósito Central Riberalta', 'cedro', 'Almendrillo, Mara', 'CTR-2026-002', 'Entregado', 'POAT-2026-001', '2026-12-31')`
    ],
    documentos: [
      `INSERT INTO documentos (tipo_documento, numero_documento, entidad_emisora, responsable, fecha_emision, fecha_vencimiento, periodo_validez, descripcion, estado)
       VALUES ('POAT', 'POAT-2026-001', 'ABT - Autoridad de Fiscalización y Control Social de Bosques', 'Ing. Luis Fernando Arce', '2026-01-10', '2026-12-31', '1', 'Plan Operativo Anual Forestal para extracción en zona norte Riberalta', 'Vigente')`,
      `INSERT INTO documentos (tipo_documento, numero_documento, entidad_emisora, responsable, fecha_emision, fecha_vencimiento, periodo_validez, descripcion, estado)
       VALUES ('contrato', 'CTR-2026-001', 'Municipalidad de Riberalta', 'Dr. Roberto Vaca', '2026-02-01', '2026-06-30', '0.5', 'Contrato de provisión de madera para obras municipales', 'Vigente')`
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
