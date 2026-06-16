const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createMaquinariaRoutes = (db, logAudit) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM maquinaria');
      res.json(rows);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener maquinaria' });
    }
  });

  router.post('/', verifyToken, async (req, res) => {
    const { nombre, tipo, estado, ultimaRevision } = req.body;
    if (!nombre || !tipo) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }
    try {
      const result = await db.run(
        'INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision) VALUES (?, ?, ?, ?)',
        [nombre, tipo, estado, ultimaRevision]
      );
      await logAudit(req.user?.id, 'CREATE', 'maquinaria', result.lastID, null, req.body);
      res.status(201).json({ status: 'Maquinaria registrada con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar maquinaria' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, tipo, estado, ultimaRevision } = req.body;
    if (!nombre || !tipo) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }
    try {
      const anterior = await db.get('SELECT * FROM maquinaria WHERE id = ?', [req.params.id]);
      await db.run(
        'UPDATE maquinaria SET nombre = ?, tipo = ?, estado = ?, ultimaRevision = ? WHERE id = ?',
        [nombre, tipo, estado, ultimaRevision, req.params.id]
      );
      await logAudit(req.user?.id, 'UPDATE', 'maquinaria', req.params.id, anterior, req.body);
      res.json({ status: 'Maquinaria actualizada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar maquinaria' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const anterior = await db.get('SELECT * FROM maquinaria WHERE id = ?', [req.params.id]);
      await db.run('DELETE FROM maquinaria WHERE id = ?', [req.params.id]);
      await logAudit(req.user?.id, 'DELETE', 'maquinaria', req.params.id, anterior, null);
      res.json({ status: 'Maquinaria eliminada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar maquinaria' });
    }
  });

  return router;
};

module.exports = createMaquinariaRoutes;
