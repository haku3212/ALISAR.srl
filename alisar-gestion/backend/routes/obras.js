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
    const { nombre, avance, presupuesto, tipo, cliente, descripcion,
            responsable_tecnico, inicio_planeado, fin_planeado, observaciones,
            gastos_totales, estado } = req.body;

    if (!nombre?.trim() || avance == null || !presupuesto?.toString().trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }
    if (isNaN(avance) || avance < 0 || avance > 100) {
      return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }
    // presupNum se usa tanto para validar como para guardar — evita almacenar strings con letras o formatos inválidos
    const presupClean = String(presupuesto).replace(/[^0-9.]/g, '');
    // Rechazamos strings con más de un punto decimal (ej: "1.2.3" daría parseFloat=1.2 sin error)
    if ((presupClean.match(/\./g) || []).length > 1) {
      return res.status(400).json({ msg: 'Formato de presupuesto inválido' });
    }
    const presupNum = parseFloat(presupClean);
    if (isNaN(presupNum) || presupNum < 0) {
      return res.status(400).json({ msg: 'El presupuesto debe ser un número positivo' });
    }

    try {
      const result = await db.run(
        `INSERT INTO obras (nombre, avance, presupuesto, tipo, cliente, descripcion,
          responsable_tecnico, inicio_planeado, fin_planeado, observaciones,
          gastos_totales, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        // Guardamos String(presupNum) — número limpio sin unidades ni formatos del usuario
        [nombre, avance, String(presupNum), tipo, cliente, descripcion,
         responsable_tecnico, inicio_planeado, fin_planeado, observaciones,
         gastos_totales || 0, estado ?? 'Planeado']
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'CREATE', 'obras', result.lastID, null, req.body);
      res.status(201).json({ status: 'Obra registrada con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar obra' });
    }
  });

  router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    const { nombre, avance, presupuesto, tipo, cliente, descripcion,
            responsable_tecnico, inicio_planeado, fin_planeado, observaciones,
            gastos_totales, estado } = req.body;

    if (!nombre?.trim() || avance == null || !presupuesto?.toString().trim()) {
      return res.status(400).json({ msg: 'Campos requeridos: nombre, avance, presupuesto' });
    }
    if (isNaN(avance) || avance < 0 || avance > 100) {
      return res.status(400).json({ msg: 'El avance debe ser un número entre 0 y 100' });
    }
    // Misma lógica que POST: valida y guarda el número limpio
    const presupCleanU = String(presupuesto).replace(/[^0-9.]/g, '');
    if ((presupCleanU.match(/\./g) || []).length > 1) {
      return res.status(400).json({ msg: 'Formato de presupuesto inválido' });
    }
    const presupNum = parseFloat(presupCleanU);
    if (isNaN(presupNum) || presupNum < 0) {
      return res.status(400).json({ msg: 'El presupuesto debe ser un número positivo' });
    }

    try {
      const anterior = await db.get('SELECT * FROM obras WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run(
        `UPDATE obras SET nombre = ?, avance = ?, presupuesto = ?, tipo = ?, cliente = ?,
          descripcion = ?, responsable_tecnico = ?, inicio_planeado = ?, fin_planeado = ?,
          observaciones = ?, gastos_totales = ?, estado = ?
         WHERE id = ?`,
        // Guardamos String(presupNum) — igual que en POST para consistencia
        [nombre, avance, String(presupNum), tipo, cliente, descripcion,
         responsable_tecnico, inicio_planeado, fin_planeado, observaciones,
         gastos_totales || 0, estado ?? 'Planeado', id]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'UPDATE', 'obras', id, anterior, req.body);
      res.json({ status: 'Obra actualizada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar obra' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    // Solo administradores pueden eliminar — los residentes solo pueden crear/editar
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ msg: 'Solo administradores pueden eliminar registros' });
    }

    try {
      const anterior = await db.get('SELECT * FROM obras WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run('DELETE FROM obras WHERE id = ?', [id]);
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'DELETE', 'obras', id, anterior, null);
      res.json({ status: 'Obra eliminada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar obra' });
    }
  });

  return router;
};

module.exports = createObrasRoutes;
