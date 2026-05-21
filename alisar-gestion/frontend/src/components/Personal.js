import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Phone, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormInput from './common/FormInput';
import SearchBar from './common/SearchBar';
import { generatePersonalReport, generateExcelReport } from '../utils/reportGenerator';

const Personal = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem, refresh } = useCRUD(
    dataService.getPersonal,
    dataService.createPersonal,
    dataService.updatePersonal,
    dataService.deletePersonal
  );

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({ nombre: '', cargo: '', celular: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Obtener cargos únicos para filtros
  const uniqueCargos = useMemo(() => {
    return [...new Set(data.map(p => p.cargo))];
  }, [data]);

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'cargo',
      label: 'Cargo',
      type: 'select',
      options: uniqueCargos.map(cargo => ({ label: cargo, value: cargo }))
    }
  ], [uniqueCargos]);

  const filtered = useMemo(() => {
    let result = data.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo.toLowerCase().includes(search.toLowerCase()) ||
      p.celular.includes(search)
    );

    // Aplicar filtro de cargo
    if (filters.cargo) {
      result = result.filter(p => p.cargo === filters.cargo);
    }

    return result;
  }, [data, search, filters]);

  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.cargo.trim()) errors.cargo = 'Cargo requerido';
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
      setFormData({ nombre: '', cargo: '', celular: '' });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (person) => {
    setFormData(person);
    setEditingId(person.id);
    setShowModal(true);
  };

  const handleNew = () => {
    setFormData({ nombre: '', cargo: '', celular: '' });
    setEditingId(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nombre: '', cargo: '', celular: '' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0 }}>Recursos Humanos</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Gestión de personal operativo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generatePersonalReport(data)} title="Generar reporte en PDF" style={{
            background: '#f87171',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <FileText size={16} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' },
            { label: 'Cargo', key: 'cargo' },
            { label: 'Celular', key: 'celular' }
          ], 'Personal')} title="Exportar a Excel" style={{
            background: '#60a5fa',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <Download size={16} /> Excel
          </button>
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
            <UserPlus size={18} /> Nuevo
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <SearchBar
        placeholder="Buscar por nombre, cargo o celular..."
        onSearch={setSearch}
        onFilterChange={setFilters}
        filters={filterConfigs}
      />

      <div>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: '#111411',
            borderRadius: '12px',
            border: '1px solid #1f241f',
            color: '#666'
          }}>
            <p>{search ? 'No hay resultados' : 'No hay personal registrado'}</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} style={{
              background: '#111411',
              border: '1px solid #1f241f',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{ background: '#1a221a', padding: '10px', borderRadius: '50%' }}>
                  <Users size={20} color="#4ade80" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#e0e0e0' }}>{p.nombre}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>{p.cargo}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} /> {p.celular}
                </p>
                <button onClick={() => handleEdit(p)} style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer'
                }}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => deleteItem(p.id)} style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer'
                }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Personal' : 'Nuevo Personal'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormInput
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={formErrors.nombre}
            required
            disabled={submitting}
          />
          <FormInput
            label="Cargo"
            name="cargo"
            value={formData.cargo}
            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
            error={formErrors.cargo}
            required
            disabled={submitting}
          />
          <FormInput
            label="Celular"
            name="celular"
            value={formData.celular}
            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
            disabled={submitting}
          />
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
            {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Personal;