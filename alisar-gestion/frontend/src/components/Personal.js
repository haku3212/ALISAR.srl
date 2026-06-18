import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Phone, Edit2, Trash2, Download, FileText, Mail } from 'lucide-react';
import { dataService } from '../services/api';
import { validateEmail, validatePhone } from '../utils/validators';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import SearchBar from './common/SearchBar';
import { generatePersonalReport, generateExcelReport } from '../utils/reportGenerator';

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid #252a25', background: '#131613', color: '#e0e0e0',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
};
const lbl = {
  display: 'block', fontSize: '11px', fontWeight: '600', color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
};
const errTxt = { color: '#f87171', fontSize: '11px', margin: '4px 0 0 0' };
const EMPTY = {
  nombre: '', cargo: '', celular: '', estado: 'Activo',
  email: '', departamento: '', fecha_ingreso: '', tipo_contrato: ''
};

const estadoColor = {
  'Activo': { bg: '#1a2a1a', color: '#4ade80' },
  'Inactivo': { bg: '#2a1a1a', color: '#f87171' },
  'Vacaciones': { bg: '#1a1f2a', color: '#60a5fa' },
  'Licencia': { bg: '#2a251a', color: '#fbbf24' }
};

const Personal = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getPersonal, dataService.createPersonal, dataService.updatePersonal, dataService.deletePersonal
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const uniqueCargos = useMemo(() => [...new Set(data.map(p => p.cargo).filter(Boolean))], [data]);

  const filterConfigs = useMemo(() => [
    { id: 'cargo', label: 'Cargo', type: 'select', options: uniqueCargos.map(c => ({ label: c, value: c })) },
    { id: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo', 'Vacaciones', 'Licencia'].map(v => ({ label: v, value: v })) }
  ], [uniqueCargos]);

  const filtered = useMemo(() => {
    let r = data.filter(p =>
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo?.toLowerCase().includes(search.toLowerCase()) ||
      p.celular?.includes(search) ||
      p.departamento?.toLowerCase().includes(search.toLowerCase())
    );
    if (filters.cargo) r = r.filter(p => p.cargo === filters.cargo);
    if (filters.estado) r = r.filter(p => p.estado === filters.estado);
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const e = {};
    if (!formData.nombre?.trim()) e.nombre = 'Campo requerido';
    if (!formData.cargo?.trim()) e.cargo = 'Campo requerido';
    if (formData.email && !validateEmail(formData.email)) e.email = 'Email no válido';
    if (formData.celular && !validatePhone(formData.celular)) e.celular = 'Teléfono inválido (7–12 dígitos)';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      editingId ? await update(editingId, formData) : await create(formData);
      setFormData(EMPTY);
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => { setFormData({ ...EMPTY, ...p }); setFormErrors({}); setEditingId(p.id); setShowModal(true); };
  const handleNew = () => { setFormData(EMPTY); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '700' }}>Recursos Humanos</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0 0' }}>Gestión de personal operativo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generatePersonalReport(data)} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' }, { label: 'Cargo', key: 'cargo' },
            { label: 'Departamento', key: 'departamento' }, { label: 'Celular', key: 'celular' },
            { label: 'Estado', key: 'estado' }
          ], 'Personal')} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={15} /> Excel
          </button>
          <button onClick={handleNew} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px' }}>
            <UserPlus size={16} /> Nuevo
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}
      <SearchBar placeholder="Buscar por nombre, cargo, departamento o celular..." onSearch={setSearch} onFilterChange={setFilters} filters={filterConfigs} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#555' }}>
            {search ? 'Sin resultados para la búsqueda' : 'No hay personal registrado'}
          </div>
        ) : filtered.map(p => {
          const ec = estadoColor[p.estado] || { bg: '#1f2937', color: '#999' };
          return (
            <div key={p.id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{ background: '#1e293b', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} color="#FFD700" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: '14px', fontWeight: '600' }}>{p.nombre}</h3>
                    <span style={{ background: ec.bg, color: ec.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{p.estado || 'Activo'}</span>
                  </div>
                  <p style={{ margin: '3px 0 0 0', color: '#888', fontSize: '12px' }}>{p.cargo}{p.departamento ? ` · ${p.departamento}` : ''}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {p.celular && <span style={{ fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={13} /> {p.celular}</span>}
                {p.email && <span style={{ fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={13} /> {p.email}</span>}
                <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '4px' }}><Edit2 size={17} /></button>
                <button onClick={() => deleteItem(p.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}><Trash2 size={17} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={handleClose} title={editingId ? 'Editar Personal' : 'Nuevo Personal'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Nombre Completo <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.nombre ? '#f87171' : '#252a25'}` }} value={formData.nombre} onChange={set('nombre')} placeholder="Ej: Carlos Mendoza" disabled={submitting} />
              {formErrors.nombre && <p style={errTxt}>{formErrors.nombre}</p>}
            </div>
            <div>
              <label style={lbl}>Cargo <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.cargo ? '#f87171' : '#252a25'}` }} value={formData.cargo} onChange={set('cargo')} placeholder="Ej: Operador de Maquinaria" disabled={submitting} />
              {formErrors.cargo && <p style={errTxt}>{formErrors.cargo}</p>}
            </div>
            <div>
              <label style={lbl}>Departamento</label>
              <input style={inp} value={formData.departamento} onChange={set('departamento')} placeholder="Ej: Operaciones" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Celular</label>
              <input style={{ ...inp, border: `1px solid ${formErrors.celular ? '#f87171' : '#252a25'}` }} value={formData.celular} onChange={set('celular')} placeholder="Ej: 78231456" disabled={submitting} />
              {formErrors.celular && <p style={errTxt}>{formErrors.celular}</p>}
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={{ ...inp, border: `1px solid ${formErrors.email ? '#f87171' : '#252a25'}` }} type="email" value={formData.email} onChange={set('email')} placeholder="Ej: carlos@alisar.com" disabled={submitting} />
              {formErrors.email && <p style={errTxt}>{formErrors.email}</p>}
            </div>
            <div>
              <label style={lbl}>Fecha de Ingreso</label>
              <input style={inp} type="date" value={formData.fecha_ingreso} onChange={set('fecha_ingreso')} disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Tipo de Contrato</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={formData.tipo_contrato} onChange={set('tipo_contrato')} disabled={submitting}>
                <option value="">Seleccionar...</option>
                <option value="indefinido">Indefinido</option>
                <option value="plazo_fijo">Plazo Fijo</option>
                <option value="obra">Por Obra</option>
                <option value="eventual">Eventual</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={formData.estado} onChange={set('estado')} disabled={submitting}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Vacaciones">Vacaciones</option>
                <option value="Licencia">Licencia</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontSize: '14px' }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Personal' : 'Registrar Personal'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Personal;
