const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createConfigRoutes = (db) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const configs = await db.all('SELECT * FROM config');
      const result = {};
      configs.forEach(c => { result[c.clave] = c.valor; });
      res.json(result);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener configuración' });
    }
  });

  router.put('/:clave', verifyToken, async (req, res) => {
    const { valor } = req.body;
    const { clave } = req.params;
    if (req.user?.rol !== 'admin') return res.status(403).json({ msg: 'Acceso denegado' });
    const ALLOWED_KEYS = ['empresa_nombre', 'empresa_ubicacion', 'empresa_moneda', 'empresa_idioma', 'tema_modo'];
    if (!ALLOWED_KEYS.includes(clave)) return res.status(400).json({ msg: 'Clave no permitida' });
    if (valor === undefined || valor === null) {
      return res.status(400).json({ msg: 'Campo requerido: valor' });
    }
    try {
      await db.run(
        'INSERT INTO config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, actualizado = CURRENT_TIMESTAMP',
        [clave, valor]
      );
      res.json({ status: 'Configuración actualizada con éxito' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al actualizar configuración' });
    }
  });

  return router;
};

module.exports = createConfigRoutes;
