const express = require('express');

const createAuthRoutes = (db) => {
  const router = express.Router();
  const authController = require('../controllers/authController');

  router.post('/login', authController.createLoginController(db));

  return router;
};

module.exports = createAuthRoutes;
