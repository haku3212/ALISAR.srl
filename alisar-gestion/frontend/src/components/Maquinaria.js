import React, { useState } from 'react';
import { Drill, Plus, Search, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Maquinaria = () => {
  // Datos de ejemplo basados en tu operación de castaña
  const [maquinas] = useState([
    { id: 1, nombre: 'Sopladora Industrial N1', tipo: 'Procesamiento', estado: 'Operativo', ultimaRevision: '2026-04-10' },
    { id: 2, nombre: 'Zaranda Vibratoria A2', tipo: 'Clasificación', estado: 'Mantenimiento', ultimaRevision: '2026-05-01' },
    { id: 3, nombre: 'Horno de Tostado 01', tipo: 'Secado', estado: 'Operativo', ultimaRevision: '2026-03-15' },
    { id: 4, nombre: 'Peladora Automática', tipo: 'Pelado', estado: 'Operativo', ultimaRevision: '2026-05-10' },
  ]);

  const styles = {
    container: { padding: '32px', color: '#e0e0e0' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#111411', borderRadius: '12px', overflow: 'hidden' },
    th: { textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '16px', borderBottom: '1px solid #1f241f', fontSize: '14px' },
    badge: (estado) => ({
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      background: estado === 'Operativo' ? '#1a221a' : '#221a1a',
      color: estado === 'Operativo' ? '#4ade80' : '#f87171',
      border: 1px solid 
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, color: '#fff' }}>Gestión de Maquinaria</h1>
          <p style={{ color: '#666' }}>Control de activos de la planta beneficiadora</p>
        </div>
        <button style={{ background: '#4ade80', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Plus size={18} /> Registrar Equipo
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Equipo</th>
            <th style={styles.th}>Categoría</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Última Revisión</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {maquinas.map((m) => (
            <tr key={m.id}>
              <td style={styles.td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Drill size={16} color="#4ade80" /> {m.nombre}
                </div>
              </td>
              <td style={styles.td}>{m.tipo}</td>
              <td style={styles.td}><span style={styles.badge(m.estado)}>{m.estado}</span></td>
              <td style={styles.td}>{m.ultimaRevision}</td>
              <td style={styles.td}><Settings2 size={18} color="#666" style={{ cursor: 'pointer' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Maquinaria;