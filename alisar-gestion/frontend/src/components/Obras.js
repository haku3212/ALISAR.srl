import React, { useState, useEffect } from 'react';
import { HardHat, MapPin, Plus, Trash2 } from 'lucide-react';
import { dataService } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';

const Obras = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', avance: 0, presupuesto: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      setLoading(true);
      const response = await dataService.getObras();
      setObras(response.data || []);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar las obras. ' + (err.response?.data?.msg || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.presupuesto || formData.avance === '') {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      setSubmitting(true);
      await dataService.createObra({
        nombre: formData.nombre,
        avance: parseInt(formData.avance),
        presupuesto: formData.presupuesto
      });
      setFormData({ nombre: '', avance: 0, presupuesto: '' });
      setShowModal(false);
      await fetchObras();
    } catch (err) {
      setError('Error al crear obra: ' + (err.response?.data?.msg || ''));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar esta obra?')) {
      try {
        await dataService.deleteObra(id);
        await fetchObras();
      } catch (err) {
        setError('Error al eliminar obra');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0 }}>Control de Obras</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Seguimiento de ejecución y presupuestos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#4ade80',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> Nueva Obra
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div style={{ display: 'grid', gap: '16px' }}>
        {obras.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: '#111411',
            borderRadius: '12px',
            border: '1px solid #1f241f',
            color: '#666'
          }}>
            <p>No hay obras registradas</p>
          </div>
        ) : (
          obras.map(obra => (
            <div key={obra.id} style={{
              background: '#111411',
              border: '1px solid #1f241f',
              borderRadius: '12px',
              padding: '24px',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HardHat size={18} /> {obra.nombre}
                  </h3>
                  <p style={{ color: '#666', fontSize: '12px', margin: '8px 0 0 0' }}>
                    <MapPin size={12} style={{ display: 'inline' }} /> Beni, Bolivia
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(obra.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>PRESUPUESTO</p>
                  <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                    {obra.presupuesto}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>AVANCE</p>
                  <p style={{ color: '#4ade80', fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                    {obra.avance}%
                  </p>
                </div>
              </div>

              <div style={{ background: '#1f241f', height: '8px', borderRadius: '4px' }}>
                <div style={{
                  background: '#4ade80',
                  width: obra.avance + '%',
                  height: '100%',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Nueva Obra">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0', fontSize: '14px' }}>
              Nombre de Obra
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #1f241f',
                background: '#111411',
                color: '#e0e0e0',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0', fontSize: '14px' }}>
              Avance (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.avance}
              onChange={(e) => setFormData({ ...formData, avance: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #1f241f',
                background: '#111411',
                color: '#e0e0e0',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0', fontSize: '14px' }}>
              Presupuesto
            </label>
            <input
              type="text"
              value={formData.presupuesto}
              onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
              placeholder="Ej: 150,000 Bs"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #1f241f',
                background: '#111411',
                color: '#e0e0e0',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#4ade80',
              color: '#000',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              marginTop: '8px'
            }}
          >
            {submitting ? 'Registrando...' : 'Registrar Obra'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Obras;