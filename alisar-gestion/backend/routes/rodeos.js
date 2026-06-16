const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createRodeosRoutes = (db, logAudit) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM rodeos ORDER BY fecha_rodeo DESC');
      res.json(rows);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener rodeos' });
    }
  });

  router.post('/', verifyToken, async (req, res) => {
    const {
      fecha_rodeo, volumen_total, responsable_rodeo,
      procedencia, destino_final, especie_principal,
      estado_operacion, lat, lng, descripcion
    } = req.body;

    if (!fecha_rodeo || !responsable_rodeo || !procedencia || !destino_final) {
      return res.status(400).json({ msg: 'Campos requeridos: fecha_rodeo, responsable_rodeo, procedencia, destino_final' });
    }

    try {
      const result = await db.run(
        `INSERT INTO rodeos
          (fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final,
           especie_principal, estado_operacion, lat, lng, descripcion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final,
          especie_principal, estado_operacion || 'Activo', lat, lng, descripcion]
      );
      await logAudit(req.user?.id, 'CREATE', 'rodeos', result.lastID, null, req.body);
      res.status(201).json({ status: 'Rodeo registrado con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar rodeo' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const {
      fecha_rodeo, volumen_total, responsable_rodeo,
      procedencia, destino_final, especie_principal,
      estado_operacion, lat, lng, descripcion
    } = req.body;

    if (!fecha_rodeo || !responsable_rodeo || !procedencia || !destino_final) {
      return res.status(400).json({ msg: 'Campos requeridos: fecha_rodeo, responsable_rodeo, procedencia, destino_final' });
    }

    try {
      const anterior = await db.get('SELECT * FROM rodeos WHERE id = ?', [req.params.id]);
      await db.run(
        `UPDATE rodeos SET
          fecha_rodeo = ?, volumen_total = ?, responsable_rodeo = ?,
          procedencia = ?, destino_final = ?, especie_principal = ?,
          estado_operacion = ?, lat = ?, lng = ?, descripcion = ?
         WHERE id = ?`,
        [fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final,
          especie_principal, estado_operacion, lat, lng, descripcion, req.params.id]
      );
      await logAudit(req.user?.id, 'UPDATE', 'rodeos', req.params.id, anterior, req.body);
      res.json({ status: 'Rodeo actualizado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar rodeo' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const anterior = await db.get('SELECT * FROM rodeos WHERE id = ?', [req.params.id]);
      await db.run('DELETE FROM rodeos WHERE id = ?', [req.params.id]);
      await logAudit(req.user?.id, 'DELETE', 'rodeos', req.params.id, anterior, null);
      res.json({ status: 'Rodeo eliminado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar rodeo' });
    }
  });

  return router;
};

module.exports = createRodeosRoutes;
