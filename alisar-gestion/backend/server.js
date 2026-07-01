require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const createAuthRoutes = require('./routes/auth');
const { verifyToken, allowRoles } = require('./middleware/auth');

let db;

// Bloquea las peticiones a la API hasta que la base de datos esté lista,
// evitando el error intermitente "db is not defined" en el primer instante
// de arranque del servidor (las rutas se registran de forma síncrona pero
// la conexión a SQLite se abre de forma asíncrona).
app.use((req, res, next) => {
  if (!db) {
    return res.status(503).json({ msg: 'Servidor iniciando, intente nuevamente en unos segundos' });
  }
  next();
});

// 1. Inicialización de la Base de Datos Relacional Local
(async () => {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    // Asegurar que existan todas las tablas core
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            usuario TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            rol TEXT DEFAULT 'secretaria',
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
        CREATE TABLE IF NOT EXISTS rodeos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_rodeo TEXT NOT NULL,
            volumen_total REAL,
            responsable_rodeo TEXT NOT NULL,
            contrato_asociado TEXT,
            especie_principal TEXT,
            otras_especies TEXT,
            procedencia TEXT NOT NULL,
            ubicacion_origen TEXT,
            ubicacion_origen_coords TEXT,
            destino_final TEXT NOT NULL,
            ubicacion_destino TEXT,
            ubicacion_destino_coords TEXT,
            fecha_transporte TEXT,
            estado_operacion TEXT DEFAULT 'En Proceso',
            poat_numero TEXT,
            poat_vencimiento TEXT,
            otros_permisos TEXT,
            fecha_limite_permisos TEXT,
            observaciones TEXT
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
            asociado_rodeo TEXT,
            asociado_proyecto TEXT,
            asociado_maquinaria TEXT,
            asociado_campamento TEXT,
            referencia_archivo TEXT,
            url_documento TEXT,
            observaciones TEXT
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

    // Crear usuarios por defecto si no existen (admin y secretaria)
    const checkAdmin = await db.get("SELECT id FROM users WHERE usuario = 'admin'");
    if (!checkAdmin) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await db.run(
            'INSERT INTO users (nombre, usuario, password, rol, estado) VALUES (?, ?, ?, ?, ?)',
            ['Administrador', 'admin', hashedPassword, 'admin', 'activo']
        );
        console.log("🌱 Usuario administrador por defecto creado (admin / 123456).");
    }

    const checkSecretaria = await db.get("SELECT id FROM users WHERE usuario = 'secretaria'");
    if (!checkSecretaria) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await db.run(
            'INSERT INTO users (nombre, usuario, password, rol, estado) VALUES (?, ?, ?, ?, ?)',
            ['Secretaria', 'secretaria', hashedPassword, 'secretaria', 'activo']
        );
        console.log("🌱 Usuario secretaria por defecto creado (secretaria / 123456).");
    }

    // Inserción de datos semilla para Personal si la tabla está vacía
    const checkPersonal = await db.get('SELECT COUNT(*) as total FROM personal');
    if (checkPersonal.total === 0) {
        await db.run("INSERT INTO personal (nombre, cargo, celular) VALUES ('Carlos Mendoza', 'Operador de Motoniveladora', '78231456')");
        await db.run("INSERT INTO personal (nombre, cargo, celular) VALUES ('Luis Fernando Arce', 'Ingeniero de Residencia', '67129843')");
        console.log("🌱 Datos de personal inicializados.");
    }

    // Inserción de datos semilla para Obras
    const checkObras = await db.get('SELECT COUNT(*) as total FROM obras');
    if (checkObras.total === 0) {
        await db.run("INSERT INTO obras (nombre, avance, presupuesto) VALUES ('Mantenimiento Tramo Vial Riberalta', 45, '150,000 Bs')");
        await db.run("INSERT INTO obras (nombre, avance, presupuesto) VALUES ('Apertura de Sendas Campamento 1', 12, '85,000 Bs')");
        console.log("🌱 Datos de obras inicializados.");
    }

    // Inserción de datos semilla para Maquinaria
    const checkMaquinaria = await db.get('SELECT COUNT(*) as total FROM maquinaria');
    if (checkMaquinaria.total === 0) {
        await db.run("INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Motoniveladora CAT 140H', 'Motoniveladora', 'Operativo', '2025-10-15')");
        await db.run("INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Excavadora Komatsu PC200', 'Excavadora', 'Mantenimiento', '2025-09-20')");
        await db.run("INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES ('Volquete Scania 6x4', 'Volquete', 'Operativo', '2025-11-01')");
        console.log("🌱 Datos de maquinaria inicializados.");
    }

    // Inserción de datos semilla para Madera
    const checkMadera = await db.get('SELECT COUNT(*) as total FROM madera');
    if (checkMadera.total === 0) {
        await db.run("INSERT INTO madera (especie, piezas, volumen, campamento) VALUES ('Almendrillo', 45, '12.5 m3', 'Sena')");
        await db.run("INSERT INTO madera (especie, piezas, volumen, campamento) VALUES ('Tajibo', 30, '8.2 m3', 'Bella Unión')");
        console.log("🌱 Datos de madera inicializados.");
    }

    // Inserción de configuración por defecto
    const checkConfig = await db.get('SELECT COUNT(*) as total FROM config');
    if (checkConfig.total === 0) {
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_nombre', 'ALISAR SRL', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_ubicacion', 'Riberalta, Beni, Bolivia', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_moneda', 'Bs', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('empresa_idioma', 'es', 'string')");
        await db.run("INSERT INTO config (clave, valor, tipo) VALUES ('tema_modo', 'oscuro', 'string')");
        console.log("🌱 Configuración inicializada.");
    }

    console.log("✅ Base de Datos SQLite sincronizada correctamente.");

    // Configurar rutas autenticadas después de inicializar la BD
    app.use('/api/auth', createAuthRoutes(db));
})();

// 2. FUNCIONES AUXILIARES

// Registrar cambios en audit log
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

// 3. ENDPOINTS DE LA API REST

// --- Módulo: Maquinaria ---
app.get('/api/maquinaria', verifyToken, async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM maquinaria');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Obras ---
app.get('/api/obras', verifyToken, async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM obras');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.post('/api/obras', verifyToken, async (req, res) => {
    const { nombre, avance, presupuesto } = req.body;

    if (!nombre || avance === undefined || !presupuesto) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }

    if (isNaN(avance) || avance < 0 || avance > 100) {
        return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }

    try {
        await db.run('INSERT INTO obras (nombre, avance, presupuesto) VALUES (?, ?, ?)', [nombre, avance, presupuesto]);
        res.json({ status: "Obra registrada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Personal ---
app.get('/api/personal', verifyToken, async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM personal');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.post('/api/personal', verifyToken, async (req, res) => {
    const { nombre, cargo, celular } = req.body;

    if (!nombre || !cargo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }

    try {
        await db.run('INSERT INTO personal (nombre, cargo, celular) VALUES (?, ?, ?)', [nombre, cargo, celular]);
        res.json({ status: "Personal registrado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/obras/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        await db.run('DELETE FROM obras WHERE id = ?', [req.params.id]);
        res.json({ status: "Obra eliminada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/personal/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        await db.run('DELETE FROM personal WHERE id = ?', [req.params.id]);
        res.json({ status: "Personal eliminado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/maquinaria/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        await db.run('DELETE FROM maquinaria WHERE id = ?', [req.params.id]);
        res.json({ status: "Maquinaria eliminada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// PUT endpoints para actualizar registros
app.put('/api/personal/:id', verifyToken, async (req, res) => {
    const { nombre, cargo, celular } = req.body;

    if (!nombre || !cargo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }

    try {
        await db.run('UPDATE personal SET nombre = ?, cargo = ?, celular = ? WHERE id = ?',
            [nombre, cargo, celular, req.params.id]);
        res.json({ status: "Personal actualizado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.put('/api/obras/:id', verifyToken, async (req, res) => {
    const { nombre, avance, presupuesto } = req.body;

    if (!nombre || avance === undefined || !presupuesto) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }

    if (isNaN(avance) || avance < 0 || avance > 100) {
        return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }

    try {
        await db.run('UPDATE obras SET nombre = ?, avance = ?, presupuesto = ? WHERE id = ?',
            [nombre, avance, presupuesto, req.params.id]);
        res.json({ status: "Obra actualizada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.put('/api/maquinaria/:id', verifyToken, async (req, res) => {
    const { nombre, tipo, estado, ultimaRevision } = req.body;

    if (!nombre || !tipo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }

    try {
        await db.run('UPDATE maquinaria SET nombre = ?, tipo = ?, estado = ?, ultimaRevision = ? WHERE id = ?',
            [nombre, tipo, estado, ultimaRevision, req.params.id]);
        res.json({ status: "Maquinaria actualizada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// POST y endpoints para Maquinaria
app.post('/api/maquinaria', verifyToken, async (req, res) => {
    const { nombre, tipo, estado, ultimaRevision } = req.body;

    if (!nombre || !tipo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }

    try {
        await db.run('INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES (?, ?, ?, ?)',
            [nombre, tipo, estado, ultimaRevision]);
        res.json({ status: "Maquinaria registrada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Madera ---
app.get('/api/madera', verifyToken, async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM madera');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.post('/api/madera', verifyToken, async (req, res) => {
    const { especie, piezas, volumen, campamento } = req.body;

    if (!especie || !piezas || !volumen || !campamento) {
        return res.status(400).json({ msg: 'Campos requeridos: especie, piezas, volumen, campamento' });
    }

    try {
        await db.run('INSERT INTO madera (especie, piezas, volumen, campamento) VALUES (?, ?, ?, ?)',
            [especie, piezas, volumen, campamento]);
        res.json({ status: "Rodeo registrado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.put('/api/madera/:id', verifyToken, async (req, res) => {
    const { especie, piezas, volumen, campamento } = req.body;

    if (!especie || !piezas || !volumen || !campamento) {
        return res.status(400).json({ msg: 'Campos requeridos: especie, piezas, volumen, campamento' });
    }

    try {
        await db.run('UPDATE madera SET especie = ?, piezas = ?, volumen = ?, campamento = ? WHERE id = ?',
            [especie, piezas, volumen, campamento, req.params.id]);
        res.json({ status: "Rodeo actualizado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/madera/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        await db.run('DELETE FROM madera WHERE id = ?', [req.params.id]);
        res.json({ status: "Rodeo eliminado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Rodeos ---
app.get('/api/rodeos', verifyToken, async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM rodeos');
        const parsed = rows.map(r => ({
            ...r,
            ubicacion_origen_coords: r.ubicacion_origen_coords ? JSON.parse(r.ubicacion_origen_coords) : null,
            ubicacion_destino_coords: r.ubicacion_destino_coords ? JSON.parse(r.ubicacion_destino_coords) : null
        }));
        res.json(parsed);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.post('/api/rodeos', verifyToken, async (req, res) => {
    const {
        fecha_rodeo, volumen_total, responsable_rodeo, contrato_asociado,
        especie_principal, otras_especies, procedencia, ubicacion_origen, ubicacion_origen_coords,
        destino_final, ubicacion_destino, ubicacion_destino_coords, fecha_transporte, estado_operacion,
        poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones
    } = req.body;

    if (!fecha_rodeo || !volumen_total || !responsable_rodeo || !procedencia || !destino_final) {
        return res.status(400).json({ msg: 'Campos requeridos: fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final' });
    }

    try {
        await db.run(
            `INSERT INTO rodeos (
                fecha_rodeo, volumen_total, responsable_rodeo, contrato_asociado,
                especie_principal, otras_especies, procedencia, ubicacion_origen, ubicacion_origen_coords,
                destino_final, ubicacion_destino, ubicacion_destino_coords, fecha_transporte, estado_operacion,
                poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fecha_rodeo, volumen_total, responsable_rodeo, contrato_asociado,
                especie_principal, otras_especies, procedencia, ubicacion_origen,
                ubicacion_origen_coords ? JSON.stringify(ubicacion_origen_coords) : null,
                destino_final, ubicacion_destino,
                ubicacion_destino_coords ? JSON.stringify(ubicacion_destino_coords) : null,
                fecha_transporte, estado_operacion || 'En Proceso',
                poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones
            ]
        );
        res.json({ status: "Rodeo registrado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.put('/api/rodeos/:id', verifyToken, async (req, res) => {
    const {
        fecha_rodeo, volumen_total, responsable_rodeo, contrato_asociado,
        especie_principal, otras_especies, procedencia, ubicacion_origen, ubicacion_origen_coords,
        destino_final, ubicacion_destino, ubicacion_destino_coords, fecha_transporte, estado_operacion,
        poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones
    } = req.body;

    if (!fecha_rodeo || !volumen_total || !responsable_rodeo || !procedencia || !destino_final) {
        return res.status(400).json({ msg: 'Campos requeridos: fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final' });
    }

    try {
        await db.run(
            `UPDATE rodeos SET
                fecha_rodeo = ?, volumen_total = ?, responsable_rodeo = ?, contrato_asociado = ?,
                especie_principal = ?, otras_especies = ?, procedencia = ?, ubicacion_origen = ?, ubicacion_origen_coords = ?,
                destino_final = ?, ubicacion_destino = ?, ubicacion_destino_coords = ?, fecha_transporte = ?, estado_operacion = ?,
                poat_numero = ?, poat_vencimiento = ?, otros_permisos = ?, fecha_limite_permisos = ?, observaciones = ?
            WHERE id = ?`,
            [
                fecha_rodeo, volumen_total, responsable_rodeo, contrato_asociado,
                especie_principal, otras_especies, procedencia, ubicacion_origen,
                ubicacion_origen_coords ? JSON.stringify(ubicacion_origen_coords) : null,
                destino_final, ubicacion_destino,
                ubicacion_destino_coords ? JSON.stringify(ubicacion_destino_coords) : null,
                fecha_transporte, estado_operacion,
                poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones,
                req.params.id
            ]
        );
        res.json({ status: "Rodeo actualizado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/rodeos/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        await db.run('DELETE FROM rodeos WHERE id = ?', [req.params.id]);
        res.json({ status: "Rodeo eliminado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Documentos ---
app.get('/api/documentos', verifyToken, async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM documentos');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.post('/api/documentos', verifyToken, async (req, res) => {
    const {
        tipo_documento, numero_documento, entidad_emisora, responsable,
        fecha_emision, fecha_vencimiento, periodo_validez,
        asociado_rodeo, asociado_proyecto, asociado_maquinaria, asociado_campamento,
        referencia_archivo, url_documento, observaciones
    } = req.body;

    if (!tipo_documento || !numero_documento || !entidad_emisora || !fecha_emision || !fecha_vencimiento) {
        return res.status(400).json({ msg: 'Campos requeridos: tipo_documento, numero_documento, entidad_emisora, fecha_emision, fecha_vencimiento' });
    }

    try {
        await db.run(
            `INSERT INTO documentos (
                tipo_documento, numero_documento, entidad_emisora, responsable,
                fecha_emision, fecha_vencimiento, periodo_validez,
                asociado_rodeo, asociado_proyecto, asociado_maquinaria, asociado_campamento,
                referencia_archivo, url_documento, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tipo_documento, numero_documento, entidad_emisora, responsable,
                fecha_emision, fecha_vencimiento, periodo_validez,
                asociado_rodeo, asociado_proyecto, asociado_maquinaria, asociado_campamento,
                referencia_archivo, url_documento, observaciones
            ]
        );
        res.json({ status: "Documento registrado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.put('/api/documentos/:id', verifyToken, async (req, res) => {
    const {
        tipo_documento, numero_documento, entidad_emisora, responsable,
        fecha_emision, fecha_vencimiento, periodo_validez,
        asociado_rodeo, asociado_proyecto, asociado_maquinaria, asociado_campamento,
        referencia_archivo, url_documento, observaciones
    } = req.body;

    if (!tipo_documento || !numero_documento || !entidad_emisora || !fecha_emision || !fecha_vencimiento) {
        return res.status(400).json({ msg: 'Campos requeridos: tipo_documento, numero_documento, entidad_emisora, fecha_emision, fecha_vencimiento' });
    }

    try {
        await db.run(
            `UPDATE documentos SET
                tipo_documento = ?, numero_documento = ?, entidad_emisora = ?, responsable = ?,
                fecha_emision = ?, fecha_vencimiento = ?, periodo_validez = ?,
                asociado_rodeo = ?, asociado_proyecto = ?, asociado_maquinaria = ?, asociado_campamento = ?,
                referencia_archivo = ?, url_documento = ?, observaciones = ?
            WHERE id = ?`,
            [
                tipo_documento, numero_documento, entidad_emisora, responsable,
                fecha_emision, fecha_vencimiento, periodo_validez,
                asociado_rodeo, asociado_proyecto, asociado_maquinaria, asociado_campamento,
                referencia_archivo, url_documento, observaciones,
                req.params.id
            ]
        );
        res.json({ status: "Documento actualizado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/documentos/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        await db.run('DELETE FROM documentos WHERE id = ?', [req.params.id]);
        res.json({ status: "Documento eliminado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Auditoría ---
app.get('/api/audit', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        const logs = await db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
        res.json(logs);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Configuración ---
app.get('/api/config', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        const configs = await db.all('SELECT * FROM config');
        const result = {};
        configs.forEach(config => {
            result[config.clave] = config.valor;
        });
        res.json(result);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.put('/api/config/:clave', verifyToken, allowRoles('admin'), async (req, res) => {
    const { valor } = req.body;
    const { clave } = req.params;

    if (!valor) {
        return res.status(400).json({ msg: 'Campo requerido: valor' });
    }

    try {
        await db.run(
            'INSERT INTO config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, actualizado = CURRENT_TIMESTAMP',
            [clave, valor]
        );
        res.json({ status: "Configuración actualizada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// --- Módulo: Gestión de Usuarios (solo admin) ---
app.get('/api/users', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        const rows = await db.all('SELECT id, nombre, usuario, rol, estado, fechaCreacion FROM users');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.post('/api/users', verifyToken, allowRoles('admin'), async (req, res) => {
    const { nombre, usuario, password, rol } = req.body;

    if (!nombre || !usuario || !password) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, usuario, password' });
    }

    if (!['admin', 'secretaria'].includes(rol)) {
        return res.status(400).json({ msg: "El rol debe ser 'admin' o 'secretaria'" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (nombre, usuario, password, rol, estado) VALUES (?, ?, ?, ?, ?)',
            [nombre, usuario, hashedPassword, rol, 'activo']
        );
        res.json({ status: "Usuario creado con éxito" });
    } catch (err) {
        if (err.message?.includes('UNIQUE')) {
            return res.status(400).json({ msg: 'Ese nombre de usuario ya existe' });
        }
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.put('/api/users/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    const { nombre, rol, estado, password } = req.body;

    if (!nombre || !rol) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, rol' });
    }

    if (!['admin', 'secretaria'].includes(rol)) {
        return res.status(400).json({ msg: "El rol debe ser 'admin' o 'secretaria'" });
    }

    try {
        // Evita que el propio administrador se quite el rol de admin (bloqueo accidental)
        if (Number(req.params.id) === req.user.id && rol !== 'admin') {
            return res.status(400).json({ msg: 'No puede quitarse a sí mismo el rol de administrador' });
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run('UPDATE users SET nombre = ?, rol = ?, estado = ?, password = ? WHERE id = ?',
                [nombre, rol, estado || 'activo', hashedPassword, req.params.id]);
        } else {
            await db.run('UPDATE users SET nombre = ?, rol = ?, estado = ? WHERE id = ?',
                [nombre, rol, estado || 'activo', req.params.id]);
        }
        res.json({ status: "Usuario actualizado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/users/:id', verifyToken, allowRoles('admin'), async (req, res) => {
    try {
        if (Number(req.params.id) === req.user.id) {
            return res.status(400).json({ msg: 'No puede eliminar su propio usuario' });
        }

        const target = await db.get('SELECT rol FROM users WHERE id = ?', [req.params.id]);
        if (target?.rol === 'admin') {
            const { total } = await db.get("SELECT COUNT(*) as total FROM users WHERE rol = 'admin'");
            if (total <= 1) {
                return res.status(400).json({ msg: 'No puede eliminar al único administrador del sistema' });
            }
        }

        await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ status: "Usuario eliminado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// 3. Lanzamiento del Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API activa en http://localhost:${PORT}`));