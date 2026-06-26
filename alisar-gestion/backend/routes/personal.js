const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const rows = await getDB().all('SELECT * FROM personal');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { nombre, cargo, celular } = req.body;

    if (!nombre || !cargo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }

    try {
        const result = await getDB().run(
            'INSERT INTO personal (nombre, cargo, celular) VALUES (?, ?, ?)',
            [nombre, cargo, celular]
        );
        await logAudit(req.user?.id, 'CREATE', 'personal', result.lastID, null, { nombre, cargo, celular });
        res.status(201).json({ status: 'Personal registrado con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, cargo, celular } = req.body;

    if (!nombre || !cargo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM personal WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Personal no encontrado' });

        await getDB().run(
            'UPDATE personal SET nombre = ?, cargo = ?, celular = ? WHERE id = ?',
            [nombre, cargo, celular, req.params.id]
        );
        await logAudit(req.user?.id, 'UPDATE', 'personal', req.params.id, anterior, { nombre, cargo, celular });
        res.json({ status: 'Personal actualizado con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const anterior = await getDB().get('SELECT * FROM personal WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Personal no encontrado' });

        await getDB().run('DELETE FROM personal WHERE id = ?', [req.params.id]);
        await logAudit(req.user?.id, 'DELETE', 'personal', req.params.id, anterior, null);
        res.json({ status: 'Personal eliminado con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

module.exports = router;
