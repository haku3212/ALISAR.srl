const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');

const changePwdLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Demasiados intentos de cambio de contraseña. Intenta de nuevo en 15 minutos.' }
});

const createPasswordRoutes = (db, logAudit) => {
  const router = express.Router();

  router.put('/change-password', changePwdLimiter, verifyToken, async (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword?.trim();
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número' });
    }
    try {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });

      const hashed = await bcrypt.hash(newPassword, 10);
      await db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
      await logAudit(user.usuario, 'CAMBIO_PASSWORD', 'users', user.id, null, null);
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  });

  return router;
};

module.exports = createPasswordRoutes;
