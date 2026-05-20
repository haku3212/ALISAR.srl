import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone } from 'lucide-react';
import { dataService } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

const Personal = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPersonal();
  }, []);

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      const response = await dataService.getPersonal();
      setPersonal(response.data || []);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar el personal. ' + (err.response?.data?.msg || ''));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const styles = {
    card: {
      background: '#111411',
      border: '1px solid #1f241f',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s'
    },
    status: (s) => ({
      color: s === 'Activo' ? '#4ade80' : '#f87171',
      fontSize: '12px',
      fontWeight: 'bold'
    })
  };

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0 }}>Recursos Humanos</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Gestión de personal operativo</p>
        </div>
        <button style={{
          background: '#4ade80',
          color: '#000',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <UserPlus size={18} /> Nuevo Empleado
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div>
        {personal.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: '#111411',
            borderRadius: '12px',
            border: '1px solid #1f241f',
            color: '#666'
          }}>
            <p>No hay personal registrado</p>
          </div>
        ) : (
          personal.map(e => (
            <div key={e.id} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{
                  background: '#1a221a',
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} color="#4ade80" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#e0e0e0' }}>{e.nombre}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>{e.cargo}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <Phone size={14} /> {e.celular}
                </p>
                <span style={styles.status(e.estado)}>{e.estado || 'Activo'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Personal;