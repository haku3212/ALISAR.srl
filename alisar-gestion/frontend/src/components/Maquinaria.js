import React, { useState, useEffect } from 'react';
import { Drill, Plus, Settings2 } from 'lucide-react';
import { dataService } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

const Maquinaria = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaquinaria();
  }, []);

  const fetchMaquinaria = async () => {
    try {
      setLoading(true);
      const response = await dataService.getMaquinaria();
      setMaquinas(response.data || []);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar la maquinaria. ' + (err.response?.data?.msg || ''));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const styles = {
    container: { padding: '32px', color: '#e0e0e0' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#111411',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    th: {
      textAlign: 'left',
      padding: '16px',
      borderBottom: '1px solid #1f241f',
      color: '#666',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '600'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #1f241f',
      fontSize: '14px'
    },
    badge: (estado) => ({
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      background: estado === 'Operativo' ? '#1a221a' : '#221a1a',
      color: estado === 'Operativo' ? '#4ade80' : '#f87171',
      fontWeight: '600',
      display: 'inline-block'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, color: '#fff' }}>Gestión de Maquinaria</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Control de activos de la planta beneficiadora</p>
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
          <Plus size={18} /> Registrar Equipo
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {maquinas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 32px',
          background: '#111411',
          borderRadius: '12px',
          border: '1px solid #1f241f',
          color: '#666'
        }}>
          <p>No hay maquinaria registrada</p>
        </div>
      ) : (
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
              <tr key={m.id} style={{ transition: 'background 0.2s' }}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Drill size={16} color="#4ade80" />
                    {m.nombre}
                  </div>
                </td>
                <td style={styles.td}>{m.tipo}</td>
                <td style={styles.td}>
                  <span style={styles.badge(m.estado)}>{m.estado}</span>
                </td>
                <td style={styles.td}>{m.ultimaRevision}</td>
                <td style={styles.td}>
                  <button style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}>
                    <Settings2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Maquinaria;