const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createObrasRoutes = (db, logAudit) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM obras');
      res.json(rows);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener obras' });
    }
  });

  router.post('/', verifyToken, async (req, res) => {
    const { nombre, avance, presupuesto, tipo, cliente, descripcion, responsable_tecnico, inicio_planeado, fin_planeado, observaciones } = req.body;
    if (!nombre || avance === undefined || !presupuesto) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }
    if (isNaN(avance) || avance < 0 || avance > 100) {
      return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }
    try {
      const result = await db.run(
        `INSERT INTO obras (nombre, avance, presupuesto, tipo, cliente, descripcion, responsable_tecnico, inicio_planeado, fin_planeado, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, avance, presupuesto, tipo, cliente, descripcion, responsable_tecnico, inicio_planeado, fin_planeado, observaciones]
      );
      await logAudit(req.user?.id, 'CREATE', 'obras', result.lastID, null, req.body);
      res.status(201).json({ status: 'Obra registrada con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar obra' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, avance, presupuesto, tipo, cliente, descripcion, responsable_tecnico, inicio_planeado, fin_planeado, observaciones } = req.body;
    if (!nombre || avance === undefined || !presupuesto) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }
    if (isNaN(avance) || avance < 0 || avance > 100) {
      return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }
    try {
      const anterior = await db.get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run(
        `UPDATE obras SET nombre = ?, avance = ?, presupuesto = ?, tipo = ?, cliente = ?, descripcion = ?,
         responsable_tecnico = ?, inicio_planeado = ?, fin_planeado = ?, observaciones = ? WHERE id = ?`,
        [nombre, avance, presupuesto, tipo, cliente, descripcion, responsable_tecnico, inicio_planeado, fin_planeado, observaciones, req.params.id]
      );
      await logAudit(req.user?.id, 'UPDATE', 'obras', req.params.id, anterior, req.body);
      res.json({ status: 'Obra actualizada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar obra' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const anterior = await db.get('SELECT * FROM obras WHERE id = ?', [req.params.id]);
      await db.run('DELETE FROM obras WHERE id = ?', [req.params.id]);
      await logAudit(req.user?.id, 'DELETE', 'obras', req.params.id, anterior, null);
      res.json({ status: 'Obra eliminada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar obra' });
    }
  });

  return router;
};

module.exports = createObrasRoutes;
