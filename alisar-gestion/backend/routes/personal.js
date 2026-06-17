const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createPersonalRoutes = (db, logAudit) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM personal');
      res.json(rows);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener personal' });
    }
  });

  router.post('/', verifyToken, async (req, res) => {
    const { nombre, cargo, celular, estado, email, departamento, fecha_ingreso, tipo_contrato } = req.body;
    if (!nombre || !cargo) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }
    try {
      const result = await db.run(
        `INSERT INTO personal (nombre, cargo, celular, estado, email, departamento, fecha_ingreso, tipo_contrato)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, cargo, celular, estado || 'Activo', email, departamento, fecha_ingreso, tipo_contrato]
      );
      await logAudit(req.user?.id, 'CREATE', 'personal', result.lastID, null, req.body);
      res.status(201).json({ status: 'Personal registrado con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar personal' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, cargo, celular, estado, email, departamento, fecha_ingreso, tipo_contrato } = req.body;
    if (!nombre || !cargo) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }
    try {
      const anterior = await db.get('SELECT * FROM personal WHERE id = ?', [req.params.id]);
      await db.run(
        `UPDATE personal SET nombre = ?, cargo = ?, celular = ?, estado = ?, email = ?,
         departamento = ?, fecha_ingreso = ?, tipo_contrato = ? WHERE id = ?`,
        [nombre, cargo, celular, estado || 'Activo', email, departamento, fecha_ingreso, tipo_contrato, req.params.id]
      );
      await logAudit(req.user?.id, 'UPDATE', 'personal', req.params.id, anterior, req.body);
      res.json({ status: 'Personal actualizado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar personal' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const anterior = await db.get('SELECT * FROM personal WHERE id = ?', [req.params.id]);
      await db.run('DELETE FROM personal WHERE id = ?', [req.params.id]);
      await logAudit(req.user?.id, 'DELETE', 'personal', req.params.id, anterior, null);
      res.json({ status: 'Personal eliminado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar personal' });
    }
  });

  return router;
};

module.exports = createPersonalRoutes;
