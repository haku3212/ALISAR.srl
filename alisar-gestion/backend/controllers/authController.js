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

      // Mensaje genérico para no revelar si el usuario existe o no
      if (!user) {
        return res.status(401).json({ msg: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: 'Credenciales inválidas' });
      }

      const payload = { user: { id: user.id, rol: user.rol } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
        if (err) {
          console.error('Error al firmar JWT:', err);
          return res.status(500).json({ error: 'Error al generar token' });
        }
        // Solo devuelve nombre y rol, nunca la contraseña
        res.json({ token, user: { nombre: user.nombre, rol: user.rol } });
      });
    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
};
