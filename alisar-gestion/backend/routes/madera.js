const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

const CAMPOS = [
    'especie', 'piezas', 'volumen', 'campamento', 'nombre_comun', 'nombre_cientifico',
    'procedencia', 'destino', 'tipo_corte', 'largo', 'ancho', 'espesor', 'cantidad',
    'peso_estimado', 'grado_calidad', 'estado_conservacion', 'humedad', 'defectos',
    'fecha_aserrado', 'fecha_recepcion', 'precio_unitario', 'valor_total',
    'ubicacion_campamento', 'ubicacion_exacta', 'notas',
    'responsable', 'obra_asociada', 'permiso_forestal', 'fecha_vencimiento_permiso',
    'comprador', 'precio_venta',
    'nombre', 'contratante', 'segunda_parte', 'estado_contrato',
    'ing_forestal', 'jefe_campamento', 'personal_asignado', 'maquinaria_asignada',
    'obs_campamento', 'zona_extraccion', 'punto_medio', 'fecha_inicio_tumba',
    'fecha_llegada_punto_medio', 'obs_extraccion', 'num_piezas', 'obs_clasificacion',
    'aserradero_destino', 'fecha_entrega_aserradero', 'responsable_recepcion', 'obs_entrega'
];

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
    const { especie } = req.body;
    const piezas = req.body.piezas;

    if (!especie || piezas === undefined || piezas === null) {
        return res.status(400).json({ msg: 'Campos requeridos: especie, piezas' });
    }

    try {
        const data = filtrar(req.body);
        const cols = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const result = await getDB().run(
            `INSERT INTO madera (${cols}) VALUES (${placeholders})`,
            Object.values(data)
        );
        await logAudit(req.user?.id, 'CREATE', 'madera', result.lastID, null, data);
        res.status(201).json({ status: 'Madera registrada con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { especie } = req.body;
    const piezas = req.body.piezas;

    if (!especie || piezas === undefined || piezas === null) {
        return res.status(400).json({ msg: 'Campos requeridos: especie, piezas' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM madera WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Registro de madera no encontrado' });

        const data = filtrar(req.body);
        const setCols = Object.keys(data).map(k => `${k} = ?`).join(', ');
        await getDB().run(
            `UPDATE madera SET ${setCols} WHERE id = ?`,
            [...Object.values(data), req.params.id]
        );
        await logAudit(req.user?.id, 'UPDATE', 'madera', req.params.id, anterior, data);
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

const filtrar = (body) => {
    const result = {};
    CAMPOS.forEach(campo => {
        if (body[campo] !== undefined) result[campo] = body[campo];
    });
    return result;
};

module.exports = router;
