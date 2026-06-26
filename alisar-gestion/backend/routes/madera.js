const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const rows = await getDB().all('SELECT * FROM madera');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { especie, piezas, volumen, campamento } = req.body;

    // Verificar piezas con !== undefined para permitir el valor 0
    if (!especie || piezas === undefined || piezas === null || !volumen || !campamento) {
        return res.status(400).json({ msg: 'Campos requeridos: especie, piezas, volumen, campamento' });
    }

    try {
        const result = await getDB().run(
            'INSERT INTO madera (especie, piezas, volumen, campamento) VALUES (?, ?, ?, ?)',
            [especie, piezas, volumen, campamento]
        );
        await logAudit(req.user?.id, 'CREATE', 'madera', result.lastID, null, { especie, piezas, volumen, campamento });
        res.status(201).json({ status: 'Madera registrada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { especie, piezas, volumen, campamento } = req.body;

    if (!especie || piezas === undefined || piezas === null || !volumen || !campamento) {
        return res.status(400).json({ msg: 'Campos requeridos: especie, piezas, volumen, campamento' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM madera WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Registro de madera no encontrado' });

        await getDB().run(
            'UPDATE madera SET especie = ?, piezas = ?, volumen = ?, campamento = ? WHERE id = ?',
            [especie, piezas, volumen, campamento, req.params.id]
        );
        await logAudit(req.user?.id, 'UPDATE', 'madera', req.params.id, anterior, { especie, piezas, volumen, campamento });
        res.json({ status: 'Madera actualizada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const anterior = await getDB().get('SELECT * FROM madera WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Registro de madera no encontrado' });

        await getDB().run('DELETE FROM madera WHERE id = ?', [req.params.id]);
        await logAudit(req.user?.id, 'DELETE', 'madera', req.params.id, anterior, null);
        res.json({ status: 'Madera eliminada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

module.exports = router;
