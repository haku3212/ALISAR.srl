const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const rows = await getDB().all('SELECT * FROM maquinaria');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { nombre, tipo, estado, ultimaRevision } = req.body;

    if (!nombre || !tipo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }

    try {
        const result = await getDB().run(
            'INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES (?, ?, ?, ?)',
            [nombre, tipo, estado, ultimaRevision]
        );
        await logAudit(req.user?.id, 'CREATE', 'maquinaria', result.lastID, null, { nombre, tipo, estado, ultimaRevision });
        res.status(201).json({ status: 'Maquinaria registrada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, tipo, estado, ultimaRevision } = req.body;

    if (!nombre || !tipo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM maquinaria WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Maquinaria no encontrada' });

        await getDB().run(
            'UPDATE maquinaria SET nombre = ?, tipo = ?, estado = ?, ultimaRevision = ? WHERE id = ?',
            [nombre, tipo, estado, ultimaRevision, req.params.id]
        );
        await logAudit(req.user?.id, 'UPDATE', 'maquinaria', req.params.id, anterior, { nombre, tipo, estado, ultimaRevision });
        res.json({ status: 'Maquinaria actualizada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const anterior = await getDB().get('SELECT * FROM maquinaria WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Maquinaria no encontrada' });

        await getDB().run('DELETE FROM maquinaria WHERE id = ?', [req.params.id]);
        await logAudit(req.user?.id, 'DELETE', 'maquinaria', req.params.id, anterior, null);
        res.json({ status: 'Maquinaria eliminada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

module.exports = router;
