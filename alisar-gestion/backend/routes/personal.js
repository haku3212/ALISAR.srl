const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDB, logAudit } = require('../db/init');

const router = express.Router();

const CAMPOS = [
    'nombre', 'cargo', 'celular', 'estado', 'cedula', 'email', 'fecha_nacimiento',
    'genero', 'departamento', 'fecha_ingreso', 'salario', 'tipo_contrato',
    'contacto_emergencia_nombre', 'contacto_emergencia_relacion', 'contacto_emergencia_tel',
    'direccion', 'ubicacion_coordenadas', 'notas'
];

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
    const { nombre, cargo } = req.body;

    if (!nombre || !cargo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }

    try {
        const data = filtrar(req.body);
        const cols = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const result = await getDB().run(
            `INSERT INTO personal (${cols}) VALUES (${placeholders})`,
            Object.values(data)
        );
        await logAudit(req.user?.id, 'CREATE', 'personal', result.lastID, null, data);
        res.status(201).json({ status: 'Personal registrado con éxito' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, cargo } = req.body;

    if (!nombre || !cargo) {
        return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }

    try {
        const anterior = await getDB().get('SELECT * FROM personal WHERE id = ?', [req.params.id]);
        if (!anterior) return res.status(404).json({ msg: 'Personal no encontrado' });

        const data = filtrar(req.body);
        const setCols = Object.keys(data).map(k => `${k} = ?`).join(', ');
        await getDB().run(
            `UPDATE personal SET ${setCols} WHERE id = ?`,
            [...Object.values(data), req.params.id]
        );
        await logAudit(req.user?.id, 'UPDATE', 'personal', req.params.id, anterior, data);
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

const filtrar = (body) => {
    const result = {};
    CAMPOS.forEach(campo => {
        if (body[campo] !== undefined) result[campo] = body[campo];
    });
    return result;
};

module.exports = router;
