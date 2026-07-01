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

// allowRoles('admin') o allowRoles('admin', 'secretaria') -> exige que req.user.rol
// (poblado por verifyToken a partir del JWT) esté en la lista de roles permitidos.
// Debe usarse siempre después de verifyToken. No depende del frontend: aunque el
// menú oculte una opción, la ruta rechaza la petición igual si el rol no califica.
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return res.status(403).json({ msg: 'No tiene permisos para realizar esta acción' });
  }
  next();
};

module.exports = { verifyToken, allowRoles };
