const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createMaderaRoutes = (db, logAudit) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const rows = await db.all('SELECT * FROM madera');
      res.json(rows);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener inventario de madera' });
    }
  });

  router.post('/', verifyToken, async (req, res) => {
    const { especie, piezas, volumen, campamento, procedencia, destino, tipo_corte } = req.body;
    const piezasInt = parseInt(piezas, 10);
    if (!especie?.trim() || !campamento?.trim() ||
        !volumen?.toString().trim() || isNaN(Number(volumen)) || Number(volumen) <= 0 ||
        piezas == null || isNaN(piezasInt) || piezasInt <= 0 || String(piezasInt) !== String(Number(piezas))) {
      return res.status(400).json({ msg: 'Campos requeridos: especie, piezas (entero positivo), volumen (número positivo), campamento' });
    }
    try {
      const result = await db.run(
        `INSERT INTO madera (especie, piezas, volumen, campamento, procedencia, destino, tipo_corte)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [especie, piezasInt, Number(volumen), campamento, procedencia, destino, tipo_corte]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'CREATE', 'madera', result.lastID, null, req.body);
      res.status(201).json({ status: 'Madera registrada con éxito', id: result.lastID });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al registrar madera' });
    }
  });

  // PUT permite a todos los autenticados editar — DELETE solo admin. Ver personal.js para más detalle.
  router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    const { especie, piezas, volumen, campamento, procedencia, destino, tipo_corte } = req.body;
    const piezasInt = parseInt(piezas, 10);
    if (!especie?.trim() || !campamento?.trim() ||
        !volumen?.toString().trim() || isNaN(Number(volumen)) || Number(volumen) <= 0 ||
        piezas == null || isNaN(piezasInt) || piezasInt <= 0 || String(piezasInt) !== String(Number(piezas))) {
      return res.status(400).json({ msg: 'Campos requeridos: especie, piezas (entero positivo), volumen (número positivo), campamento' });
    }
    try {
      const anterior = await db.get('SELECT * FROM madera WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run(
        `UPDATE madera SET especie = ?, piezas = ?, volumen = ?, campamento = ?,
         procedencia = ?, destino = ?, tipo_corte = ? WHERE id = ?`,
        [especie, piezasInt, Number(volumen), campamento, procedencia, destino, tipo_corte, id]
      );
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'UPDATE', 'madera', id, anterior, req.body);
      res.json({ status: 'Madera actualizada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar madera' });
    }
  });

  router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ msg: 'ID inválido' });

    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ msg: 'Solo administradores pueden eliminar registros' });
    }

    try {
      const anterior = await db.get('SELECT * FROM madera WHERE id = ?', [id]);
      if (!anterior) return res.status(404).json({ msg: 'Registro no encontrado' });
      await db.run('DELETE FROM madera WHERE id = ?', [id]);
      await logAudit(req.user?.nombre || req.user?.usuario || String(req.user?.id || 'sistema'), 'DELETE', 'madera', id, anterior, null);
      res.json({ status: 'Madera eliminada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar madera' });
    }
  });

  return router;
};

module.exports = createMaderaRoutes;
