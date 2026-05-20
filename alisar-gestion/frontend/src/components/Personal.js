import React from 'react';
import { Users, UserPlus, Mail, Phone } from 'lucide-react';

const Personal = () => {
  const empleados = [
    { id: 1, nombre: 'Juan Pérez', cargo: 'Operador de Sopladora', celular: '75012345', estado: 'Activo' },
    { id: 2, nombre: 'Maria Choque', cargo: 'Seleccionadora de Castaña', celular: '76098765', estado: 'Activo' },
    { id: 3, nombre: 'Pedro Gomez', cargo: 'Mecánico Industrial', celular: '70011223', estado: 'Licencia' }
  ];

  const styles = {
    card: { background: '#111411', border: '1px solid #1f241f', borderRadius: '12px', padding: '20px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    status: (s) => ({ color: s === 'Activo' ? '#4ade80' : '#f87171', fontSize: '12px', fontWeight: 'bold' })
  };

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Recursos Humanos</h1>
        <button style={{ background: '#4ade80', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> Nuevo Empleado
        </button>
      </div>
      
      {empleados.map(e => (
        <div key={e.id} style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#1a221a', padding: '10px', borderRadius: '50%' }}><Users size={20} color="#4ade80" /></div>
            <div>
              <h3 style={{ margin: 0 }}>{e.nombre}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{e.cargo}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px' }}><Phone size={14} /> {e.celular}</p>
            <span style={styles.status(e.estado)}>{e.estado}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Personal;