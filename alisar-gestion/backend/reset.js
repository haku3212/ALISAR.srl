const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({}); // Borramos todo para no tener dudas

    const salt = await bcrypt.genSalt(10);
    // AQUÍ DEFINIMOS LA CLAVE: Usaremos 'riberalta' para que sea fácil
    const hashedPassword = await bcrypt.hash('riberalta', salt);

    const nuevoAdmin = new User({
      nombre: 'Armando',
      usuario: 'admin',
      password: hashedPassword,
      rol: 'admin'
    });

    await nuevoAdmin.save();
    console.log('✅ USUARIO RESETEADO CON ÉXITO');
    console.log('Usuario: admin');
    console.log('Nueva Clave: riberalta');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
reset();
