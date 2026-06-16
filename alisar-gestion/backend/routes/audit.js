const express = require('express');
const { verifyToken } = require('../middleware/auth');

const createAuditRoutes = (db) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const { modulo } = req.query;
      const parsedLimit = parseInt(req.query.limit);
      const limit = (!isNaN(parsedLimit) && parsedLimit > 0) ? Math.min(parsedLimit, 1000) : 100;

      let query = 'SELECT * FROM audit_logs';
      const params = [];
      if (modulo) {
        query += ' WHERE tabla = ?';
        params.push(modulo);
      }
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);
      const logs = await db.all(query, params);
      res.json(logs);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al obtener historial' });
    }
  });

  return router;
};

module.exports = createAuditRoutes;
