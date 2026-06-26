require('dotenv').config();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

const initDB = async () => {
    db = await open({
        filename: process.env.DATABASE_PATH || './database.db',
        driver: sqlite3.Database
    });

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
        CREATE TABLE IF NOT EXISTS personal (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cargo TEXT,
            celular TEXT,
            estado TEXT DEFAULT 'Activo'
        );
        CREATE TABLE IF NOT EXISTS madera (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            especie TEXT NOT NULL,
            piezas INTEGER,
            volumen TEXT,
            campamento TEXT
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

    await seedData();
    console.log('✅ Base de Datos SQLite sincronizada correctamente.');
    return db;
};

const seedData = async () => {
    const checkPersonal = await db.get('SELECT COUNT(*) as total FROM personal');
    if (checkPersonal.total === 0) {
        await db.run("INSERT INTO personal (nombre, cargo, celular) VALUES ('Carlos Mendoza', 'Operador de Motoniveladora', '78231456')");
        await db.run("INSERT INTO personal (nombre, cargo, celular) VALUES ('Luis Fernando Arce', 'Ingeniero de Residencia', '67129843')");
        console.log('🌱 Datos de personal inicializados.');
    }

    const checkObras = await db.get('SELECT COUNT(*) as total FROM obras');
    if (checkObras.total === 0) {
        await db.run("INSERT INTO obras (nombre, avance, presupuesto) VALUES ('Mantenimiento Tramo Vial Riberalta', 45, '150,000 Bs')");
        await db.run("INSERT INTO obras (nombre, avance, presupuesto) VALUES ('Apertura de Sendas Campamento 1', 12, '85,000 Bs')");
        console.log('🌱 Datos de obras inicializados.');
    }

    const checkMaquinaria = await db.get('SELECT COUNT(*) as total FROM maquinaria');
    if (checkMaquinaria.total === 0) {
        await db.run("INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Motoniveladora CAT 140H', 'Motoniveladora', 'Operativo', '2025-10-15')");
        await db.run("INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Excavadora Komatsu PC200', 'Excavadora', 'Mantenimiento', '2025-09-20')");
        await db.run("INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Volquete Scania 6x4', 'Volquete', 'Operativo', '2025-11-01')");
        console.log('🌱 Datos de maquinaria inicializados.');
    }

    const checkMadera = await db.get('SELECT COUNT(*) as total FROM madera');
    if (checkMadera.total === 0) {
        await db.run("INSERT INTO madera (especie, piezas, volumen, campamento) VALUES ('Almendrillo', 45, '12.5 m3', 'Sena')");
        await db.run("INSERT INTO madera (especie, piezas, volumen, campamento) VALUES ('Tajibo', 30, '8.2 m3', 'Bella Unión')");
        console.log('🌱 Datos de madera inicializados.');
    }

    const checkConfig = await db.get('SELECT COUNT(*) as total FROM config');
    if (checkConfig.total === 0) {
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_nombre', 'ALISAR SRL', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_ubicacion', 'Riberalta, Beni, Bolivia', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_moneda', 'Bs', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_idioma', 'es', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('tema_modo', 'oscuro', 'string')");
        console.log('🌱 Configuración inicializada.');
    }
};

const logAudit = async (usuario, accion, tabla, registro_id, valores_anteriores, valores_nuevos) => {
    try {
        await db.run(
            'INSERT INTO audit_logs (usuario, accion, tabla, registro_id, valores_anteriores, valores_nuevos) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario || 'sistema', accion, tabla, registro_id, JSON.stringify(valores_anteriores), JSON.stringify(valores_nuevos)]
        );
    } catch (err) {
        console.error('Error registrando audit log:', err);
    }
};

const getDB = () => db;

module.exports = { initDB, getDB, logAudit };
