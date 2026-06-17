import React, { useState, useMemo } from 'react';
import { Drill, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import SearchBar from './common/SearchBar';
import { generateMaquinariaReport, generateExcelReport } from '../utils/reportGenerator';

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
  nombre: '', tipo: '', modelo: '', anio: '', numero_serie: '',
  estado: 'Operativo', ultimaRevision: '', horas_operacion: '', operador_asignado: ''
};

const estadoBadge = {
  'Operativo': { bg: '#1a2a1a', color: '#FFD700' },
  'Mantenimiento': { bg: '#2a1f1a', color: '#f97316' },
  'Inactivo': { bg: '#2a1a1a', color: '#f87171' },
  'Baja': { bg: '#252525', color: '#888' }
};

const Maquinaria = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getMaquinaria, dataService.createMaquinaria, dataService.updateMaquinaria, dataService.deleteMaquinaria
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const uniqueTypes = useMemo(() => [...new Set(data.map(m => m.tipo).filter(Boolean))], [data]);
  const uniqueStates = useMemo(() => [...new Set(data.map(m => m.estado).filter(Boolean))], [data]);

  const filterConfigs = useMemo(() => [
    { id: 'tipo', label: 'Tipo', type: 'select', options: uniqueTypes.map(t => ({ label: t, value: t })) },
    { id: 'estado', label: 'Estado', type: 'select', options: uniqueStates.map(s => ({ label: s, value: s })) }
  ], [uniqueTypes, uniqueStates]);

  const filtered = useMemo(() => {
    let r = data.filter(m =>
      m.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      m.tipo?.toLowerCase().includes(search.toLowerCase()) ||
      m.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      m.operador_asignado?.toLowerCase().includes(search.toLowerCase())
    );
    if (filters.tipo) r = r.filter(m => m.tipo === filters.tipo);
    if (filters.estado) r = r.filter(m => m.estado === filters.estado);
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const e = {};
    if (!formData.nombre?.trim()) e.nombre = 'Campo requerido';
    if (!formData.tipo?.trim()) e.tipo = 'Campo requerido';
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

  const handleEdit = (m) => { setFormData({ ...EMPTY, ...m }); setFormErrors({}); setEditingId(m.id); setShowModal(true); };
  const handleNew = () => { setFormData(EMPTY); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '700' }}>Gestión de Maquinaria</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: '6px 0 0 0' }}>Control de equipos y activos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateMaquinariaReport(data)} style={{ background: '#1a1d1a', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' }, { label: 'Tipo', key: 'tipo' },
            { label: 'Modelo', key: 'modelo' }, { label: 'Estado', key: 'estado' },
            { label: 'Última Revisión', key: 'ultimaRevision' }
          ], 'Maquinaria')} style={{ background: '#1a1d1a', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={15} /> Excel
          </button>
          <button onClick={handleNew} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px' }}>
            <Plus size={16} /> Nuevo Equipo
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}
      <SearchBar placeholder="Buscar por nombre, tipo, modelo u operador..." onSearch={setSearch} onFilterChange={setFilters} filters={filterConfigs} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#111411', borderRadius: '12px', border: '1px solid #1f241f', color: '#555' }}>
          {search ? 'Sin resultados para la búsqueda' : 'No hay maquinaria registrada'}
        </div>
      ) : (
        <div style={{ background: '#111411', borderRadius: '12px', border: '1px solid #1f241f', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d0f0d' }}>
                {['Equipo', 'Tipo', 'Modelo / Año', 'Operador', 'Estado', 'Ult. Revisión', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #1f241f' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const badge = estadoBadge[m.estado] || { bg: '#252525', color: '#888' };
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #1a1d1a' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Drill size={15} color="#FFD700" />
                        <span style={{ color: '#e0e0e0', fontWeight: '500' }}>{m.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '13px' }}>{m.tipo}</td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '13px' }}>{[m.modelo, m.anio].filter(Boolean).join(' · ') || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '13px' }}>{m.operador_asignado || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: '600' }}>{m.estado || '—'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '13px' }}>{m.ultimaRevision || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(m)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '2px' }}><Edit2 size={16} /></button>
                        <button onClick={() => deleteItem(m.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleClose} title={editingId ? 'Editar Maquinaria' : 'Nuevo Equipo'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Nombre <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.nombre ? '#f87171' : '#252a25'}` }} value={formData.nombre} onChange={set('nombre')} placeholder="Ej: Motoniveladora CAT 140H" disabled={submitting} />
              {formErrors.nombre && <p style={errTxt}>{formErrors.nombre}</p>}
            </div>
            <div>
              <label style={lbl}>Tipo <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.tipo ? '#f87171' : '#252a25'}` }} value={formData.tipo} onChange={set('tipo')} placeholder="Ej: Motoniveladora" disabled={submitting} />
              {formErrors.tipo && <p style={errTxt}>{formErrors.tipo}</p>}
            </div>
            <div>
              <label style={lbl}>Modelo</label>
              <input style={inp} value={formData.modelo} onChange={set('modelo')} placeholder="Ej: CAT 140H" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Año</label>
              <input style={inp} type="number" min="1980" max="2030" value={formData.anio} onChange={set('anio')} placeholder="Ej: 2018" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Número de Serie</label>
              <input style={inp} value={formData.numero_serie} onChange={set('numero_serie')} placeholder="Ej: CAT140H-2018-001" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={formData.estado} onChange={set('estado')} disabled={submitting}>
                <option value="Operativo">Operativo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Última Revisión</label>
              <input style={inp} type="date" value={formData.ultimaRevision} onChange={set('ultimaRevision')} disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Horas de Operación</label>
              <input style={inp} type="number" min="0" value={formData.horas_operacion} onChange={set('horas_operacion')} placeholder="Ej: 2500" disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Operador Asignado</label>
              <input style={inp} value={formData.operador_asignado} onChange={set('operador_asignado')} placeholder="Ej: Carlos Mendoza" disabled={submitting} />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontSize: '14px' }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Maquinaria' : 'Registrar Equipo'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Maquinaria;
