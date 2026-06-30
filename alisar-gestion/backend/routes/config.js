const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const configs = await getDB().all('SELECT * FROM config');
        const result = {};
        configs.forEach(c => { result[c.clave] = c.valor; });
        res.json(result);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:clave', verifyToken, async (req, res) => {
    const { valor } = req.body;
    const { clave } = req.params;

    // Permite valor vacío "" pero no undefined ni null
    if (valor === undefined || valor === null) {
        return res.status(400).json({ msg: 'Campo requerido: valor' });
    }

    try {
        await getDB().run(
            'INSERT INTO config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, actualizado = CURRENT_TIMESTAMP',
            [clave, valor]
        );
        await logAudit(req.user?.user?.id, 'UPDATE', 'config', null, { clave }, { clave, valor });
        res.json({ status: 'Configuración actualizada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

module.exports = router;
