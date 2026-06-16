const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createDocumentosRoutes = (db, logAudit) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM documentos ORDER BY fecha_vencimiento ASC');
      res.json(rows);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
  });

  router.post('/', verifyToken, async (req, res) => {
    const {
      tipo_documento, numero_documento, entidad_emisora,
      responsable, fecha_emision, fecha_vencimiento,
      periodo_validez, asociado_rodeo, descripcion
    } = req.body;

    if (!tipo_documento || !numero_documento || !entidad_emisora || !fecha_emision || !fecha_vencimiento) {
      return res.status(400).json({
        msg: 'Campos requeridos: tipo_documento, numero_documento, entidad_emisora, fecha_emision, fecha_vencimiento'
      });
    }

    if (new Date(fecha_vencimiento) <= new Date(fecha_emision)) {
      return res.status(400).json({ msg: 'La fecha de vencimiento debe ser posterior a la fecha de emisión' });
    }

    try {
      const hoy = new Date();
      const vencimiento = new Date(fecha_vencimiento);
      const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
      let estado = 'Vigente';
      if (diasRestantes < 0) estado = 'Vencido';
      else if (diasRestantes <= 30) estado = 'Por vencer';

      const result = await db.run(
        `INSERT INTO documentos
          (tipo_documento, numero_documento, entidad_emisora, responsable,
           fecha_emision, fecha_vencimiento, periodo_validez, asociado_rodeo,
           descripcion, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tipo_documento, numero_documento, entidad_emisora, responsable,
          fecha_emision, fecha_vencimiento, periodo_validez, asociado_rodeo,
          descripcion, estado]
      );
      await logAudit(req.user?.id, 'CREATE', 'documentos', result.lastID, null, req.body);
      res.status(201).json({ status: 'Documento registrado con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar documento' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const {
      tipo_documento, numero_documento, entidad_emisora,
      responsable, fecha_emision, fecha_vencimiento,
      periodo_validez, asociado_rodeo, descripcion
    } = req.body;

    if (!tipo_documento || !numero_documento || !entidad_emisora || !fecha_emision || !fecha_vencimiento) {
      return res.status(400).json({
        msg: 'Campos requeridos: tipo_documento, numero_documento, entidad_emisora, fecha_emision, fecha_vencimiento'
      });
    }

    try {
      const hoy = new Date();
      const vencimiento = new Date(fecha_vencimiento);
      const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
      let estado = 'Vigente';
      if (diasRestantes < 0) estado = 'Vencido';
      else if (diasRestantes <= 30) estado = 'Por vencer';

      const anterior = await db.get('SELECT * FROM documentos WHERE id = ?', [req.params.id]);
      await db.run(
        `UPDATE documentos SET
          tipo_documento = ?, numero_documento = ?, entidad_emisora = ?,
          responsable = ?, fecha_emision = ?, fecha_vencimiento = ?,
          periodo_validez = ?, asociado_rodeo = ?, descripcion = ?, estado = ?
         WHERE id = ?`,
        [tipo_documento, numero_documento, entidad_emisora, responsable,
          fecha_emision, fecha_vencimiento, periodo_validez, asociado_rodeo,
          descripcion, estado, req.params.id]
      );
      await logAudit(req.user?.id, 'UPDATE', 'documentos', req.params.id, anterior, req.body);
      res.json({ status: 'Documento actualizado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar documento' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const anterior = await db.get('SELECT * FROM documentos WHERE id = ?', [req.params.id]);
      await db.run('DELETE FROM documentos WHERE id = ?', [req.params.id]);
      await logAudit(req.user?.id, 'DELETE', 'documentos', req.params.id, anterior, null);
      res.json({ status: 'Documento eliminado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar documento' });
    }
  });

  return router;
};

module.exports = createDocumentosRoutes;
