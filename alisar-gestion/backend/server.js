const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// 1. Inicialización de la Base de Datos Relacional Local
(async () => {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    // Asegurar que existan todas las tablas core
    await db.exec(
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
    );

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
})();

// 2. ENDPOINTS DE LA API REST

// --- Módulo: Maquinaria ---
app.get('/api/maquinaria', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM maquinaria');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Módulo: Obras ---
app.get('/api/obras', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM obras');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/obras', async (req, res) => {
    const { nombre, avance, presupuesto } = req.body;
    try {
        await db.run('INSERT INTO obras (nombre, avance, presupuesto) VALUES (?, ?, ?)', [nombre, avance, presupuesto]);
        res.json({ status: "Obra registrada con éxito" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Módulo: Personal ---
app.get('/api/personal', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM personal');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Lanzamiento del Servidor
const PORT = 4000;
app.listen(PORT, () => console.log(🚀 API activa y escuchando en http://localhost:));