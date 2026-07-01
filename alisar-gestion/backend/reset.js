require('dotenv').config();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const reset = async () => {
  try {
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    await db.run('DELETE FROM users');

    await db.run(
      'INSERT INTO users (nombre, usuario, password, rol, estado) VALUES (?, ?, ?, ?, ?)',
      ['Administrador', 'admin', hashedPassword, 'admin', 'activo']
    );

    console.log('✅ USUARIO RESETEADO CON ÉXITO');
    console.log('Usuario: admin');
    console.log('Nueva Clave: 123456');
    await db.close();
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

reset();
