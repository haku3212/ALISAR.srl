import React from 'react';
import { Trees, Box, ClipboardList } from 'lucide-react';

const Madera = () => {
  const rodeos = [
    { id: 'R-001', especie: 'Almendrillo', piezas: 45, volumen: '12.5 m3', campamento: 'Sena' },
    { id: 'R-002', especie: 'Tajibo', piezas: 30, volumen: '8.2 m3', campamento: 'Bella Unión' }
  ];

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <h1 style={{ color: '#fff', marginBottom: '30px' }}>Control de Rodeos / Madera</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {rodeos.map(r => (
          <div key={r.id} style={{ background: '#111411', border: '1px solid #1f241f', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 'bold' }}>{r.id}</span>
              <Trees size={18} color="#4ade80" />
            </div>
            <h3 style={{ margin: '0 0 10px 0' }}>{r.especie}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
              <span>Piezas: {r.piezas}</span>
              <span>Volumen: {r.volumen}</span>
            </div>
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #1f241f', fontSize: '12px', color: '#4ade80' }}>
              Campamento: {r.campamento}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Madera;