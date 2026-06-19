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
    if (!nombre?.trim() || !cargo?.trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }
    try {
      const result = await db.run(
        `INSERT INTO personal (nombre, cargo, celular, estado, email, departamento, fecha_ingreso, tipo_contrato)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, cargo, celular, estado || 'Activo', email, departamento, fecha_ingreso, tipo_contrato]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'CREATE', 'personal', result.lastID, null, req.body);
      res.status(201).json({ status: 'Personal registrado con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar personal' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    const { nombre, cargo, celular, estado, email, departamento, fecha_ingreso, tipo_contrato } = req.body;
    if (!nombre?.trim() || !cargo?.trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, cargo' });
    }
    try {
      const anterior = await db.get('SELECT * FROM personal WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run(
        `UPDATE personal SET nombre = ?, cargo = ?, celular = ?, estado = ?, email = ?,
         departamento = ?, fecha_ingreso = ?, tipo_contrato = ? WHERE id = ?`,
        [nombre, cargo, celular, estado || 'Activo', email, departamento, fecha_ingreso, tipo_contrato, id]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'UPDATE', 'personal', id, anterior, req.body);
      res.json({ status: 'Personal actualizado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar personal' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ msg: 'Solo administradores pueden eliminar registros' });
    }

    try {
      const anterior = await db.get('SELECT * FROM personal WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run('DELETE FROM personal WHERE id = ?', [id]);
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'DELETE', 'personal', id, anterior, null);
      res.json({ status: 'Personal eliminado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar personal' });
    }
  });

  return router;
};

module.exports = createPersonalRoutes;
