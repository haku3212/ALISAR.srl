require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db/init');

const app = express();

// Solo permite peticiones desde el frontend local
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

    const PORT = process.env.PORT || process.env.BACKEND_PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 API activa en http://localhost:${PORT}`));
}).catch(err => {
    console.error('❌ Error al inicializar la base de datos:', err);
    process.exit(1);
});
