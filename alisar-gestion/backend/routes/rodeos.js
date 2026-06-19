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
      procedencia, destino_final, especie_principal, otras_especies,
      contrato_asociado, ubicacion_origen, ubicacion_origen_coords,
      ubicacion_destino, ubicacion_destino_coords, fecha_transporte,
      estado_operacion, lat, lng, descripcion,
      poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones
    } = req.body;

    if (!fecha_rodeo?.toString().trim() || !responsable_rodeo?.trim() || !procedencia?.trim() || !destino_final?.trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: fecha_rodeo, responsable_rodeo, procedencia, destino_final' });
    }

    if (volumen_total !== undefined && volumen_total !== '' && (isNaN(Number(volumen_total)) || Number(volumen_total) < 0)) {
      return res.status(400).json({ msg: 'volumen_total debe ser un número positivo' });
    }

    try {
      const coordsOrigen = ubicacion_origen_coords ? JSON.stringify(ubicacion_origen_coords) : null;
      const coordsDestino = ubicacion_destino_coords ? JSON.stringify(ubicacion_destino_coords) : null;
      const result = await db.run(
        `INSERT INTO rodeos
          (fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final,
           especie_principal, otras_especies, contrato_asociado,
           ubicacion_origen, ubicacion_origen_coords, ubicacion_destino, ubicacion_destino_coords,
           fecha_transporte, estado_operacion, lat, lng, descripcion,
           poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final,
          especie_principal, otras_especies, contrato_asociado,
          ubicacion_origen, coordsOrigen, ubicacion_destino, coordsDestino,
          fecha_transporte, estado_operacion || 'Activo', lat, lng, descripcion,
          poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'CREATE', 'rodeos', result.lastID, null, req.body);
      res.status(201).json({ status: 'Rodeo registrado con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar rodeo' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    const {
      fecha_rodeo, volumen_total, responsable_rodeo,
      procedencia, destino_final, especie_principal, otras_especies,
      contrato_asociado, ubicacion_origen, ubicacion_origen_coords,
      ubicacion_destino, ubicacion_destino_coords, fecha_transporte,
      estado_operacion, lat, lng, descripcion,
      poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones
    } = req.body;

    if (!fecha_rodeo?.toString().trim() || !responsable_rodeo?.trim() || !procedencia?.trim() || !destino_final?.trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: fecha_rodeo, responsable_rodeo, procedencia, destino_final' });
    }

    if (volumen_total !== undefined && volumen_total !== '' && (isNaN(Number(volumen_total)) || Number(volumen_total) < 0)) {
      return res.status(400).json({ msg: 'volumen_total debe ser un número positivo' });
    }

    try {
      const coordsOrigen = ubicacion_origen_coords ? JSON.stringify(ubicacion_origen_coords) : null;
      const coordsDestino = ubicacion_destino_coords ? JSON.stringify(ubicacion_destino_coords) : null;
      const anterior = await db.get('SELECT * FROM rodeos WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run(
        `UPDATE rodeos SET
          fecha_rodeo = ?, volumen_total = ?, responsable_rodeo = ?,
          procedencia = ?, destino_final = ?, especie_principal = ?,
          otras_especies = ?, contrato_asociado = ?,
          ubicacion_origen = ?, ubicacion_origen_coords = ?,
          ubicacion_destino = ?, ubicacion_destino_coords = ?,
          fecha_transporte = ?, estado_operacion = ?, lat = ?, lng = ?, descripcion = ?,
          poat_numero = ?, poat_vencimiento = ?, otros_permisos = ?,
          fecha_limite_permisos = ?, observaciones = ?
         WHERE id = ?`,
        [fecha_rodeo, volumen_total, responsable_rodeo, procedencia, destino_final,
          especie_principal, otras_especies, contrato_asociado,
          ubicacion_origen, coordsOrigen, ubicacion_destino, coordsDestino,
          fecha_transporte, estado_operacion || 'Activo', lat, lng, descripcion,
          poat_numero, poat_vencimiento, otros_permisos, fecha_limite_permisos, observaciones,
          id]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'UPDATE', 'rodeos', id, anterior, req.body);
      res.json({ status: 'Rodeo actualizado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar rodeo' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ msg: 'Solo administradores pueden eliminar registros' });
    }

    try {
      const anterior = await db.get('SELECT * FROM rodeos WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run('DELETE FROM rodeos WHERE id = ?', [id]);
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'DELETE', 'rodeos', id, anterior, null);
      res.json({ status: 'Rodeo eliminado con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar rodeo' });
    }
  });

  return router;
};

module.exports = createRodeosRoutes;
