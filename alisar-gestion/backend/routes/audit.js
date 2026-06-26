const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB } = require('../db/init');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const logs = await getDB().all('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
        res.json(logs);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

module.exports = router;
