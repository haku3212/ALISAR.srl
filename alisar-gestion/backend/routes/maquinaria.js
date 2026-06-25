const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createMaquinariaRoutes = (db, logAudit) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM maquinaria ORDER BY nombre ASC');
      res.json(rows);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener maquinaria' });
    }
  });

  router.post('/', verifyToken, async (req, res) => {
    const { nombre, tipo, estado, ultimaRevision, modelo, anio, numero_serie, horas_operacion, operador_asignado } = req.body;
    if (!nombre?.trim() || !tipo?.trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }
    if (ultimaRevision && isNaN(new Date(ultimaRevision).getTime())) {
      return res.status(400).json({ msg: 'Formato de fecha inválido en ultimaRevision' });
    }
    const anioNum = anio != null ? parseInt(anio, 10) : null;
    if (anio != null && (isNaN(anioNum) || anioNum < 1900 || anioNum > 2100)) {
      return res.status(400).json({ msg: 'Año inválido (debe ser entre 1900 y 2100)' });
    }
    const horasNum = horas_operacion != null ? parseFloat(horas_operacion) : null;
    if (horas_operacion != null && (isNaN(horasNum) || horasNum < 0)) {
      return res.status(400).json({ msg: 'horas_operacion debe ser un número positivo' });
    }
    try {
      const result = await db.run(
        `INSERT INTO maquinaria (nombre, tipo, estado, ultimaRevision, modelo, anio, numero_serie, horas_operacion, operador_asignado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, tipo, estado ?? 'Operativo', ultimaRevision || null, modelo, anioNum, numero_serie, horasNum, operador_asignado]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'CREATE', 'maquinaria', result.lastID, null, req.body);
      res.status(201).json({ status: 'Maquinaria registrada con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar maquinaria' });
    }
  });

  // PUT permite a todos los autenticados editar — DELETE solo admin. Ver personal.js para más detalle.
  router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    const { nombre, tipo, estado, ultimaRevision, modelo, anio, numero_serie, horas_operacion, operador_asignado } = req.body;
    if (!nombre?.trim() || !tipo?.trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, tipo' });
    }
    if (ultimaRevision && isNaN(new Date(ultimaRevision).getTime())) {
      return res.status(400).json({ msg: 'Formato de fecha inválido en ultimaRevision' });
    }
    const anioNum = anio != null ? parseInt(anio, 10) : null;
    if (anio != null && (isNaN(anioNum) || anioNum < 1900 || anioNum > 2100)) {
      return res.status(400).json({ msg: 'Año inválido (debe ser entre 1900 y 2100)' });
    }
    const horasNum = horas_operacion != null ? parseFloat(horas_operacion) : null;
    if (horas_operacion != null && (isNaN(horasNum) || horasNum < 0)) {
      return res.status(400).json({ msg: 'horas_operacion debe ser un número positivo' });
    }
    try {
      const anterior = await db.get('SELECT * FROM maquinaria WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run(
        `UPDATE maquinaria SET nombre = ?, tipo = ?, estado = ?, ultimaRevision = ?,
         modelo = ?, anio = ?, numero_serie = ?, horas_operacion = ?, operador_asignado = ? WHERE id = ?`,
        [nombre, tipo, estado ?? 'Operativo', ultimaRevision || null, modelo, anioNum, numero_serie, horasNum, operador_asignado, id]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'UPDATE', 'maquinaria', id, anterior, req.body);
      res.json({ status: 'Maquinaria actualizada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar maquinaria' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ msg: 'Solo administradores pueden eliminar registros' });
    }

    try {
      const anterior = await db.get('SELECT * FROM maquinaria WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run('DELETE FROM maquinaria WHERE id = ?', [id]);
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'DELETE', 'maquinaria', id, anterior, null);
      res.json({ status: 'Maquinaria eliminada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar maquinaria' });
    }
  });

  return router;
};

module.exports = createMaquinariaRoutes;
