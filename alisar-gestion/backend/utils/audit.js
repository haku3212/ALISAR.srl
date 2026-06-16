const createLogAudit = (db) => {
  return async (usuario, accion, tabla, registro_id, valores_anteriores, valores_nuevos) => {
    try {
      await db.run(
        'INSERT INTO audit_logs (usuario, accion, tabla, registro_id, valores_anteriores, valores_nuevos) VALUES (?, ?, ?, ?, ?, ?)',
        [usuario || 'sistema', accion, tabla, registro_id,
          JSON.stringify(valores_anteriores), JSON.stringify(valores_nuevos)]
      );
    } catch (err) {
      console.error('Error registrando audit log:', err);
    }
  };
};

module.exports = { createLogAudit };
