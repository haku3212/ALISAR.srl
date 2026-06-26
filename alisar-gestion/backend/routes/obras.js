const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

// Campos permitidos para escritura (evita que el cliente envíe campos arbitrarios)
const CAMPOS = [
    'nombre', 'avance', 'presupuesto', 'codigo', 'descripcion', 'tipo', 'cliente',
    'provincia', 'municipio', 'localidad', 'direccion_exacta', 'ubicacion_obra',
    'ubicacion_obra_coords', 'fase_actual', 'responsable_tecnico', 'supervisor',
    'contratista', 'personal_asignado', 'monto_ejecutado', 'inicio_planeado',
    'fin_planeado', 'inicio_real', 'fin_real', 'observaciones', 'estado',
    // Gastos desglosados por categoría
    'gasto_diesel', 'gasto_mantenimiento', 'gasto_materiales', 'gasto_mano_obra', 'gasto_otros'
];

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

    if (isNaN(avance) || Number(avance) < 0 || Number(avance) > 100) {
        return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }

    try {
        const data = filtrar(req.body);
        const cols = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const result = await getDB().run(
            `INSERT INTO obras (${cols}) VALUES (${placeholders})`,
            Object.values(data)
        );
        await logAudit(req.user?.id, 'CREATE', 'obras', result.lastID, null, data);
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

    if (isNaN(avance) || Number(avance) < 0 || Number(avance) > 100) {
        return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Obra no encontrada' });

        const data = filtrar(req.body);
        const setCols = Object.keys(data).map(k => `${k} = ?`).join(', ');
        await getDB().run(
            `UPDATE obras SET ${setCols} WHERE id = ?`,
            [...Object.values(data), req.params.id]
        );
        await logAudit(req.user?.id, 'UPDATE', 'obras', req.params.id, anterior, data);
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

// Solo guarda campos que están en la lista permitida
const filtrar = (body) => {
    const result = {};
    CAMPOS.forEach(campo => {
        if (body[campo] !== undefined) result[campo] = body[campo];
    });
    return result;
};

module.exports = router;
