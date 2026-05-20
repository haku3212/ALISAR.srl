const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { usuario, password } = req.body;
  try {
    let user = await User.findOne({ usuario });
    if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });
    const payload = { user: { id: user.id, rol: user.rol } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { nombre: user.nombre, rol: user.rol } });
    });
  } catch (err) { res.status(500).send('Error en el servidor'); }
};
