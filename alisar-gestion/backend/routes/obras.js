const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const rows = await getDB().all('SELECT * FROM obras');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { nombre, avance, presupuesto } = req.body;

    if (!nombre || avance === undefined || avance === null || !presupuesto) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }

    if (isNaN(avance) || avance < 0 || avance > 100) {
        return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }

    try {
        const result = await getDB().run(
            'INSERT INTO obras (nombre, avance, presupuesto) VALUES (?, ?, ?)',
            [nombre, avance, presupuesto]
        );
        await logAudit(req.user?.id, 'CREATE', 'obras', result.lastID, null, { nombre, avance, presupuesto });
        res.status(201).json({ status: 'Obra registrada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, avance, presupuesto } = req.body;

    if (!nombre || avance === undefined || avance === null || !presupuesto) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }

    if (isNaN(avance) || avance < 0 || avance > 100) {
        return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Obra no encontrada' });

        await getDB().run(
            'UPDATE obras SET nombre = ?, avance = ?, presupuesto = ? WHERE id = ?',
            [nombre, avance, presupuesto, req.params.id]
        );
        await logAudit(req.user?.id, 'UPDATE', 'obras', req.params.id, anterior, { nombre, avance, presupuesto });
        res.json({ status: 'Obra actualizada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const anterior = await getDB().get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Obra no encontrada' });

        await getDB().run('DELETE FROM obras WHERE id = ?', [req.params.id]);
        await logAudit(req.user?.id, 'DELETE', 'obras', req.params.id, anterior, null);
        res.json({ status: 'Obra eliminada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

module.exports = router;
