import React, { useState, useMemo } from 'react';
import { Drill, Plus, Edit2, Trash2 } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormInput from './common/FormInput';

const Maquinaria = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getMaquinaria,
    dataService.createMaquinaria,
    dataService.updateMaquinaria,
    dataService.deleteMaquinaria
  );

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ nombre: '', tipo: '', estado: 'Operativo', ultimaRevision: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const filtered = useMemo(() => {
    return data.filter(m =>
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.tipo.toLowerCase().includes(search.toLowerCase()) ||
      m.estado.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.tipo.trim()) errors.tipo = 'Tipo requerido';
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
      setFormData({ nombre: '', tipo: '', estado: 'Operativo', ultimaRevision: '' });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (maquina) => {
    setFormData(maquina);
    setEditingId(maquina.id);
    setShowModal(true);
  };

  const handleNew = () => {
    setFormData({ nombre: '', tipo: '', estado: 'Operativo', ultimaRevision: '' });
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
          <h1 style={{ margin: 0, color: '#fff' }}>Gestión de Maquinaria</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Control de activos de la planta</p>
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
          <Plus size={18} /> Nuevo Equipo
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <input
        type="text"
        placeholder="Buscar por nombre, tipo o estado..."
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
          <p>{search ? 'No hay resultados' : 'No hay maquinaria registrada'}</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111411', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Equipo</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Drill size={16} color="#4ade80" /> {m.nombre}
                  </div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>{m.tipo}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: m.estado === 'Operativo' ? '#1a221a' : '#221a1a',
                    color: m.estado === 'Operativo' ? '#4ade80' : '#f87171',
                    fontWeight: '600'
                  }}>
                    {m.estado}
                  </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f', display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEdit(m)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteItem(m.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Maquinaria' : 'Nuevo Equipo'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormInput label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} error={formErrors.nombre} required disabled={submitting} />
          <FormInput label="Tipo" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} error={formErrors.tipo} required disabled={submitting} />
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0', fontSize: '14px' }}>Estado</label>
            <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} disabled={submitting} style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #1f241f',
              background: '#111411',
              color: '#e0e0e0',
              outline: 'none'
            }}>
              <option>Operativo</option>
              <option>Mantenimiento</option>
              <option>Inactivo</option>
            </select>
          </div>
          <FormInput label="Última Revisión" type="date" value={formData.ultimaRevision} onChange={(e) => setFormData({ ...formData, ultimaRevision: e.target.value })} disabled={submitting} />
          <button type="submit" disabled={submitting} style={{ background: '#4ade80', color: '#000', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Maquinaria;