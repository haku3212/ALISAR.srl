require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db/init');

const app = express();

// Solo permite peticiones desde el frontend local
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3002').split(',');
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('CORS no permitido: ' + origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Inicializar BD y luego registrar todas las rutas
initDB().then(() => {
    app.use('/api/auth',       require('./routes/auth')(require('./db/init').getDB()));
    app.use('/api/maquinaria', require('./routes/maquinaria'));
    app.use('/api/obras',      require('./routes/obras'));
    app.use('/api/personal',   require('./routes/personal'));
    app.use('/api/madera',     require('./routes/madera'));
    app.use('/api/audit',      require('./routes/audit'));
    app.use('/api/config',     require('./routes/config'));

    // Backup: descarga directa del archivo SQLite
    const { verifyToken } = require('./middleware/auth');
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.db');
    app.get('/api/backup', verifyToken, (req, res) => {
        const filename = `backup_alisar_${new Date().toISOString().slice(0, 10)}.db`;
        res.download(dbPath, filename, err => {
            if (err) { console.error('Error en backup:', err); res.status(500).end(); }
        });
    });

    const PORT = process.env.PORT || process.env.BACKEND_PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 API activa en http://localhost:${PORT}`));
}).catch(err => {
    console.error('❌ Error al inicializar la base de datos:', err);
    process.exit(1);
});
