const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createLoginController = (db) => {
  return async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ msg: 'Usuario y contraseña son requeridos' });
    }

    try {
      const user = await db.get('SELECT * FROM users WHERE usuario = ?', [usuario]);

      if (!user) {
        return res.status(401).json({ msg: 'Credenciales incorrectas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: 'Credenciales incorrectas' });
      }

      const payload = { user: { id: user.id, rol: user.rol, nombre: user.nombre, usuario: user.usuario } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
        if (err) {
          console.error('Error al firmar JWT:', err);
          return res.status(500).json({ error: 'Error al generar token' });
        }
        res.json({ token, user: { nombre: user.nombre, rol: user.rol } });
      });
    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
};
