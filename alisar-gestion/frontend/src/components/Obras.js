import React from 'react';
import { HardHat, TrendingUp, MapPin } from 'lucide-react';

const Obras = () => {
  const obras = [
    { id: 1, nombre: 'Mantenimiento Carretera Riberalta-Guayaramerín', avance: 45, presupuesto: 'Bs 3.120.000' },
    { id: 2, nombre: 'Campamento Forestal Sena - POAT 2026', avance: 80, presupuesto: 'Bs 2.150.000' },
    { id: 3, nombre: 'Apertura Camino Vecinal San Lorenzo', avance: 15, presupuesto: 'Bs 410.000' }
  ];

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <h1 style={{ color: '#fff', marginBottom: '10px' }}>Control de Obras</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Seguimiento de ejecución y presupuestos activos</p>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {obras.map(obra => (
          <div key={obra.id} style={{ background: '#111411', border: '1px solid #1f241f', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#4ade80' }}><HardHat size={18} style={{ marginRight: '10px' }}/> {obra.nombre}</h3>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}><MapPin size={12}/> Beni, Bolivia</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{obra.presupuesto}</p>
                <p style={{ margin: 0, color: '#4ade80', fontSize: '12px' }}>{obra.avance}% Ejecutado</p>
              </div>
            </div>
            <div style={{ background: '#1f241f', height: '8px', borderRadius: '4px', marginTop: '15px' }}>
              <div style={{ background: '#4ade80', width: obra.avance + '%', height: '100%', borderRadius: '4px', boxShadow: '0 0 10px #4ade80' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Obras;