require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

const createAuthRoutes = require('./routes/auth');
const { verifyToken } = require('./middleware/auth');

let db;

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
    `);

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

    console.log("✅ Base de Datos SQLite sincronizada correctamente.");

    // Configurar rutas autenticadas después de inicializar la BD
    app.use('/api/auth', createAuthRoutes(db));
})();

// 2. ENDPOINTS DE LA API REST

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

app.delete('/api/obras/:id', verifyToken, async (req, res) => {
    try {
        await db.run('DELETE FROM obras WHERE id = ?', [req.params.id]);
        res.json({ status: "Obra eliminada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/personal/:id', verifyToken, async (req, res) => {
    try {
        await db.run('DELETE FROM personal WHERE id = ?', [req.params.id]);
        res.json({ status: "Personal eliminado con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

app.delete('/api/maquinaria/:id', verifyToken, async (req, res) => {
    try {
        await db.run('DELETE FROM maquinaria WHERE id = ?', [req.params.id]);
        res.json({ status: "Maquinaria eliminada con éxito" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// 3. Lanzamiento del Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API activa en http://localhost:${PORT}`));