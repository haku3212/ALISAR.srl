const express = require('express');
const { verifyToken } = require('../middleware/auth');

// Columnas permitidas por tabla — protección contra inyección en nombres de columna
const ALLOWED_COLUMNS = {
  personal:   ['nombre', 'cargo', 'celular', 'estado'],
  maquinaria: ['nombre', 'tipo', 'estado', 'ultimaRevision'],
  obras:      ['nombre', 'avance', 'presupuesto'],
  madera:     ['especie', 'piezas', 'volumen', 'campamento'],
  rodeos:     ['fecha_rodeo', 'volumen_total', 'responsable_rodeo', 'procedencia',
               'destino_final', 'especie_principal', 'estado_operacion', 'lat', 'lng', 'descripcion'],
  documentos: ['tipo_documento', 'numero_documento', 'entidad_emisora', 'responsable',
               'fecha_emision', 'fecha_vencimiento', 'periodo_validez', 'asociado_rodeo',
               'descripcion', 'estado']
};

const createBackupRoutes = (db) => {
  const router = express.Router();

  router.get('/', verifyToken, async (req, res) => {
    try {
      const tables = ['personal', 'maquinaria', 'obras', 'madera', 'rodeos', 'documentos', 'config'];
      const datos = {};
      for (const table of tables) {
        try {
          datos[table] = await db.all(`SELECT * FROM ${table}`);
        } catch (_) {
          datos[table] = [];
        }
      }
      const fecha = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=alisar_backup_${fecha}.json`);
      res.json({ version: '1.0', fecha: new Date().toISOString(), datos });
    } catch (err) {
      console.error('Error al generar backup:', err);
      res.status(500).json({ error: 'Error al generar backup' });
    }
  });

  router.post('/restore', verifyToken, async (req, res) => {
    const { datos } = req.body;
    if (!datos || typeof datos !== 'object') {
      return res.status(400).json({ error: 'Archivo de respaldo inválido' });
    }
    const restorableTables = ['personal', 'maquinaria', 'obras', 'madera', 'rodeos', 'documentos'];
    try {
      await db.run('BEGIN TRANSACTION');
      for (const table of restorableTables) {
        if (!datos[table] || !Array.isArray(datos[table])) continue;
        await db.run(`DELETE FROM ${table}`);
        const allowed = ALLOWED_COLUMNS[table] || [];
        for (const row of datos[table]) {
          // Solo insertar columnas de la lista blanca — previene SQL injection por nombre de columna
          const cols = Object.keys(row).filter(k => allowed.includes(k));
          if (cols.length === 0) continue;
          const placeholders = cols.map(() => '?').join(', ');
          await db.run(
            `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
            cols.map(c => row[c])
          );
        }
      }
      await db.run('COMMIT');
      res.json({ message: 'Datos restaurados correctamente' });
    } catch (err) {
      await db.run('ROLLBACK');
      console.error('Error al restaurar backup:', err);
      res.status(500).json({ error: 'Error al restaurar datos' });
    }
  });

  return router;
};

module.exports = createBackupRoutes;
