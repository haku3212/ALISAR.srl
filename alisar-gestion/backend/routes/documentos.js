const express = require('express');
const { verifyToken } = require('../middleware/auth');

const computeEstado = (dVencimiento) => {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const venc = new Date(dVencimiento.toISOString().split('T')[0] + 'T00:00:00');
  const dias = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
  if (dias < 0) return 'Vencido';
  if (dias <= 30) return 'Por vencer';
  return 'Vigente';
};

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
      periodo_validez, asociado_rodeo, asociado_proyecto,
      asociado_maquinaria, asociado_campamento,
      referencia_archivo, url_documento, descripcion, observaciones
    } = req.body;

    if (!tipo_documento?.trim() || !numero_documento?.trim() || !entidad_emisora?.trim() || !fecha_emision?.toString().trim() || !fecha_vencimiento?.toString().trim()) {
      return res.status(400).json({
        msg: 'Campos requeridos: tipo_documento, numero_documento, entidad_emisora, fecha_emision, fecha_vencimiento'
      });
    }

    const dEmision = new Date(fecha_emision);
    const dVencimiento = new Date(fecha_vencimiento);
    if (isNaN(dEmision.getTime()) || isNaN(dVencimiento.getTime())) {
      return res.status(400).json({ msg: 'Formato de fecha inválido' });
    }
    if (dVencimiento < dEmision) {
      return res.status(400).json({ msg: 'La fecha de vencimiento debe ser igual o posterior a la fecha de emisión' });
    }

    try {
      const estado = computeEstado(dVencimiento);
      const result = await db.run(
        `INSERT INTO documentos
          (tipo_documento, numero_documento, entidad_emisora, responsable,
           fecha_emision, fecha_vencimiento, periodo_validez, asociado_rodeo,
           asociado_proyecto, asociado_maquinaria, asociado_campamento,
           referencia_archivo, url_documento, descripcion, observaciones, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tipo_documento, numero_documento, entidad_emisora, responsable,
          fecha_emision, fecha_vencimiento, periodo_validez, asociado_rodeo,
          asociado_proyecto, asociado_maquinaria, asociado_campamento,
          referencia_archivo, url_documento, descripcion, observaciones, estado]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'CREATE', 'documentos', result.lastID, null, req.body);
      res.status(201).json({ status: 'Documento registrado con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar documento' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    const {
      tipo_documento, numero_documento, entidad_emisora,
      responsable, fecha_emision, fecha_vencimiento,
      periodo_validez, asociado_rodeo, asociado_proyecto,
      asociado_maquinaria, asociado_campamento,
      referencia_archivo, url_documento, descripcion, observaciones
    } = req.body;

    if (!tipo_documento?.trim() || !numero_documento?.trim() || !entidad_emisora?.trim() || !fecha_emision?.toString().trim() || !fecha_vencimiento?.toString().trim()) {
      return res.status(400).json({
        msg: 'Campos requeridos: tipo_documento, numero_documento, entidad_emisora, fecha_emision, fecha_vencimiento'
      });
    }

    const dEmision = new Date(fecha_emision);
    const dVencimiento = new Date(fecha_vencimiento);
    if (isNaN(dEmision.getTime()) || isNaN(dVencimiento.getTime())) {
      return res.status(400).json({ msg: 'Formato de fecha inválido' });
    }
    if (dVencimiento < dEmision) {
      return res.status(400).json({ msg: 'La fecha de vencimiento debe ser igual o posterior a la fecha de emisión' });
    }

    try {
      const estado = computeEstado(dVencimiento);
      const anterior = await db.get('SELECT * FROM documentos WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run(
        `UPDATE documentos SET
          tipo_documento = ?, numero_documento = ?, entidad_emisora = ?,
          responsable = ?, fecha_emision = ?, fecha_vencimiento = ?,
          periodo_validez = ?, asociado_rodeo = ?,
          asociado_proyecto = ?, asociado_maquinaria = ?, asociado_campamento = ?,
          referencia_archivo = ?, url_documento = ?,
          descripcion = ?, observaciones = ?, estado = ?
         WHERE id = ?`,
        [tipo_documento, numero_documento, entidad_emisora, responsable,
          fecha_emision, fecha_vencimiento, periodo_validez, asociado_rodeo,
          asociado_proyecto, asociado_maquinaria, asociado_campamento,
          referencia_archivo, url_documento, descripcion, observaciones, estado,
          id]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'UPDATE', 'documentos', id, anterior, req.body);
      res.json({ status: 'Documento actualizado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar documento' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ msg: 'Solo administradores pueden eliminar registros' });
    }

    try {
      const anterior = await db.get('SELECT * FROM documentos WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run('DELETE FROM documentos WHERE id = ?', [id]);
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'DELETE', 'documentos', id, anterior, null);
      res.json({ status: 'Documento eliminado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar documento' });
    }
  });

  return router;
};

module.exports = createDocumentosRoutes;
