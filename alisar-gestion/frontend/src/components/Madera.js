import React, { useState, useMemo } from 'react';
import { Trees, Plus, Edit2, Trash2 } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormInput from './common/FormInput';

const Madera = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getMadera,
    dataService.createMadera,
    dataService.updateMadera,
    dataService.deleteMadera
  );

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ especie: '', piezas: '', volumen: '', campamento: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const filtered = useMemo(() => {
    return data.filter(m =>
      m.especie.toLowerCase().includes(search.toLowerCase()) ||
      m.campamento.toLowerCase().includes(search.toLowerCase()) ||
      m.volumen.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const validate = () => {
    const errors = {};
    if (!formData.especie.trim()) errors.especie = 'Especie requerida';
    if (!formData.piezas || formData.piezas < 1) errors.piezas = 'Piezas debe ser mayor a 0';
    if (!formData.volumen.trim()) errors.volumen = 'Volumen requerido';
    if (!formData.campamento.trim()) errors.campamento = 'Campamento requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      setFormData({ especie: '', piezas: '', volumen: '', campamento: '' });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (madera) => {
    setFormData(madera);
    setEditingId(madera.id);
    setShowModal(true);
  };

  const handleNew = () => {
    setFormData({ especie: '', piezas: '', volumen: '', campamento: '' });
    setEditingId(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#fff' }}>Control de Rodeos / Madera</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Gestión de volúmenes y especies</p>
        </div>
        <button onClick={handleNew} style={{
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
          <Plus size={18} /> Nuevo Rodeo
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <input
        type="text"
        placeholder="Buscar por especie, volumen o campamento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          marginBottom: '24px',
          borderRadius: '8px',
          border: '1px solid #1f241f',
          background: '#111411',
          color: '#e0e0e0',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 32px',
          background: '#111411',
          borderRadius: '12px',
          border: '1px solid #1f241f',
          color: '#666'
        }}>
          <p>{search ? 'No hay resultados' : 'No hay rodeos registrados'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(m => (
            <div key={m.id} style={{
              background: '#111411',
              border: '1px solid #1f241f',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div style={{ background: '#1a221a', padding: '8px', borderRadius: '50%' }}>
                    <Trees size={18} color="#4ade80" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#e0e0e0' }}>{m.especie}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>ID: {m.id}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(m)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteItem(m.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #1f241f' }}>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>PIEZAS</p>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{m.piezas}</p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>VOLUMEN</p>
                  <p style={{ color: '#4ade80', fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{m.volumen}</p>
                </div>
              </div>

              <div>
                <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>CAMPAMENTO</p>
                <p style={{ color: '#e0e0e0', fontSize: '14px', margin: '4px 0 0 0' }}>{m.campamento}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Rodeo' : 'Nuevo Rodeo'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormInput label="Especie" value={formData.especie} onChange={(e) => setFormData({ ...formData, especie: e.target.value })} error={formErrors.especie} required disabled={submitting} placeholder="Ej: Almendrillo" />
          <FormInput label="Piezas" type="number" value={formData.piezas} onChange={(e) => setFormData({ ...formData, piezas: parseInt(e.target.value) })} error={formErrors.piezas} required min="1" disabled={submitting} />
          <FormInput label="Volumen" value={formData.volumen} onChange={(e) => setFormData({ ...formData, volumen: e.target.value })} error={formErrors.volumen} required disabled={submitting} placeholder="Ej: 12.5 m3" />
          <FormInput label="Campamento" value={formData.campamento} onChange={(e) => setFormData({ ...formData, campamento: e.target.value })} error={formErrors.campamento} required disabled={submitting} placeholder="Ej: Sena" />
          <button type="submit" disabled={submitting} style={{ background: '#4ade80', color: '#000', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Madera;
