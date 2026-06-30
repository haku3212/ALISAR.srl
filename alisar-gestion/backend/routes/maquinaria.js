const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

const CAMPOS = [
    'nombre', 'tipo', 'estado', 'ultimaRevision', 'modelo', 'anio', 'numero_serie',
    'placa', 'potencia', 'capacidad_carga', 'consumo_combustible', 'tipo_combustible',
    'ancho_trabajo', 'profundidad_maxima', 'horas_operacion', 'mantenimiento_proximo',
    'costo_mantenimiento_anual', 'documento_adquisicion', 'fecha_vencimiento_garantia',
    'numero_garantia', 'operador_asignado', 'ubicacion_equipo', 'ubicacion_coords',
    'ultima_revision', 'notas',
    // Campos operativos reales
    'obra_asignada', 'fecha_traslado', 'litros_diesel_total', 'historial_fallas'
];

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
    const { nombre, tipo } = req.body;

    if (!nombre || !tipo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }

    try {
        const data = filtrar(req.body);
        const cols = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const result = await getDB().run(
            `INSERT INTO maquinaria (${cols}) VALUES (${placeholders})`,
            Object.values(data)
        );
        await logAudit(req.user?.user?.id, 'CREATE', 'maquinaria', result.lastID, null, data);
        res.status(201).json({ status: 'Maquinaria registrada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, tipo } = req.body;

    if (!nombre || !tipo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM maquinaria WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Maquinaria no encontrada' });

        const data = filtrar(req.body);
        const setCols = Object.keys(data).map(k => `${k} = ?`).join(', ');
        await getDB().run(
            `UPDATE maquinaria SET ${setCols} WHERE id = ?`,
            [...Object.values(data), req.params.id]
        );
        await logAudit(req.user?.user?.id, 'UPDATE', 'maquinaria', req.params.id, anterior, data);
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
        await logAudit(req.user?.user?.id, 'DELETE', 'maquinaria', req.params.id, anterior, null);
        res.json({ status: 'Maquinaria eliminada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

const filtrar = (body) => {
    const result = {};
    CAMPOS.forEach(campo => {
        if (body[campo] !== undefined) result[campo] = body[campo];
    });
    return result;
};

module.exports = router;
