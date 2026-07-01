const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ msg: 'Acceso restringido a administradores' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
