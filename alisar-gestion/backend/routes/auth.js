const express = require('express');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' }
});

const createAuthRoutes = (db) => {
  const router = express.Router();
  const authController = require('../controllers/authController');

  router.post('/login', loginLimiter, authController.createLoginController(db));

  return router;
};

module.exports = createAuthRoutes;
