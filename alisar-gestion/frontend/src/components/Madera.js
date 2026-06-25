import React, { useState, useMemo } from 'react';
import { Trees, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import SearchBar from './common/SearchBar';
import { generateMaderaReport, generateExcelReport } from '../utils/reportGenerator';

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid #374151', background: '#111827', color: '#e0e0e0',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
};
const lbl = {
  display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
};
const errTxt = { color: '#f87171', fontSize: '11px', margin: '4px 0 0 0' };
const EMPTY = {
  especie: '', piezas: '', volumen: '', campamento: '',
  procedencia: '', destino: '', tipo_corte: ''
};

const Madera = () => {
  // useCRUD exporta requestDelete/confirmDelete/cancelDelete — NO "delete" directamente
  const { data, loading, error, editingId, setEditingId, create, update,
          requestDelete, confirmDelete, cancelDelete, pendingDeleteId } = useCRUD(
    dataService.getMadera, dataService.createMadera, dataService.updateMadera, dataService.deleteMadera
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const uniqueEspecies = useMemo(() => [...new Set(data.map(m => m.especie).filter(Boolean))], [data]);
  const uniqueCampamentos = useMemo(() => [...new Set(data.map(m => m.campamento).filter(Boolean))], [data]);

  const filterConfigs = useMemo(() => [
    { id: 'especie', label: 'Especie', type: 'select', options: uniqueEspecies.map(e => ({ label: e, value: e })) },
    { id: 'campamento', label: 'Campamento', type: 'select', options: uniqueCampamentos.map(c => ({ label: c, value: c })) }
  ], [uniqueEspecies, uniqueCampamentos]);

  const filtered = useMemo(() => {
    let r = data.filter(m =>
      m.especie?.toLowerCase().includes(search.toLowerCase()) ||
      m.campamento?.toLowerCase().includes(search.toLowerCase()) ||
      m.procedencia?.toLowerCase().includes(search.toLowerCase()) ||
      m.destino?.toLowerCase().includes(search.toLowerCase()) ||
      m.volumen?.toString().toLowerCase().includes(search.toLowerCase())
    );
    if (filters.especie) r = r.filter(m => m.especie === filters.especie);
    if (filters.campamento) r = r.filter(m => m.campamento === filters.campamento);
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const e = {};
    if (!formData.especie?.trim()) e.especie = 'Campo requerido';
    const piezasN = parseInt(formData.piezas, 10);
    if (!formData.piezas || isNaN(piezasN) || piezasN <= 0 || String(piezasN) !== String(Number(formData.piezas))) e.piezas = 'Requerido (entero positivo)';
    if (!formData.volumen?.toString().trim() || isNaN(Number(formData.volumen)) || Number(formData.volumen) <= 0) e.volumen = 'Requerido (número positivo)';
    if (!formData.campamento?.trim()) e.campamento = 'Campo requerido';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const ok = editingId ? await update(editingId, formData) : await create(formData);
      // Solo cerrar el modal si la operación tuvo éxito — si falló, el toast ya mostró el error
      if (ok) { setFormData(EMPTY); setShowModal(false); }
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
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '700' }}>Inventario de Madera</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0 0' }}>Control de volúmenes y especies por campamento</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateMaderaReport(data)} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #374151', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Especie', key: 'especie' }, { label: 'Piezas', key: 'piezas' },
            { label: 'Volumen', key: 'volumen' }, { label: 'Campamento', key: 'campamento' },
            { label: 'Procedencia', key: 'procedencia' }, { label: 'Destino', key: 'destino' }
          ], 'Madera')} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #374151', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={15} /> Excel
          </button>
          <button onClick={handleNew} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px' }}>
            <Plus size={16} /> Nuevo Registro
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}
      <SearchBar placeholder="Buscar por especie, campamento, procedencia o volumen..." onSearch={setSearch} onFilterChange={setFilters} filters={filterConfigs} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#6b7280' }}>
          {search ? 'Sin resultados para la búsqueda' : 'No hay registros de madera'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filtered.map(m => (
            <div key={m.id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#1e293b', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trees size={17} color="#FFD700" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>{m.especie}</h3>
                    {m.tipo_corte && <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '11px' }}>{m.tipo_corte}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(m)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '2px' }}><Edit2 size={15} /></button>
                  <button onClick={() => requestDelete(m.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}><Trash2 size={15} /></button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #374151', marginBottom: '12px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Piezas</p>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '3px 0 0 0' }}>{m.piezas ?? '—'}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Volumen</p>
                  <p style={{ color: '#FFD700', fontSize: '16px', fontWeight: '700', margin: '3px 0 0 0' }}>{m.volumen}</p>
                </div>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Campamento</p>
                <p style={{ color: '#aaa', fontSize: '13px', margin: '3px 0 0 0' }}>{m.campamento || '—'}</p>
              </div>
              {(m.procedencia || m.destino) && (
                <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {m.procedencia && <div>
                    <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Origen</p>
                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>{m.procedencia}</p>
                  </div>}
                  {m.destino && <div>
                    <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Destino</p>
                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>{m.destino}</p>
                  </div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación — pendingDeleteId es seteado por requestDelete */}
      <Modal isOpen={!!pendingDeleteId} onClose={cancelDelete} title="Confirmar Eliminación">
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <p style={{ color: '#e0e0e0', marginBottom: '24px' }}>¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={cancelDelete} style={{ background: '#374151', color: '#e0e0e0', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
            <button onClick={confirmDelete} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Eliminar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal} onClose={handleClose} title={editingId ? 'Editar Madera' : 'Nuevo Registro'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Especie <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.especie ? '#f87171' : '#374151'}` }} value={formData.especie} onChange={set('especie')} placeholder="Ej: Almendrillo" disabled={submitting} />
              {formErrors.especie && <p style={errTxt}>{formErrors.especie}</p>}
            </div>
            <div>
              <label style={lbl}>Volumen <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.volumen ? '#f87171' : '#374151'}` }} type="number" min="0" step="0.01" value={formData.volumen} onChange={set('volumen')} placeholder="Ej: 12.5" disabled={submitting} />
              {formErrors.volumen && <p style={errTxt}>{formErrors.volumen}</p>}
            </div>
            <div>
              <label style={lbl}>Piezas</label>
              <input style={inp} type="number" min="0" value={formData.piezas} onChange={set('piezas')} placeholder="Ej: 45" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Campamento</label>
              <input style={inp} value={formData.campamento} onChange={set('campamento')} placeholder="Ej: Sena" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Procedencia</label>
              <input style={inp} value={formData.procedencia} onChange={set('procedencia')} placeholder="Ej: Comunidad San Miguel" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Destino</label>
              <input style={inp} value={formData.destino} onChange={set('destino')} placeholder="Ej: Aserradero Riberalta" disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Tipo de Corte</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={formData.tipo_corte} onChange={set('tipo_corte')} disabled={submitting}>
                <option value="">Seleccionar...</option>
                <option value="rollizo">Rollizo</option>
                <option value="escuadrado">Escuadrado</option>
                <option value="aserrado">Aserrado</option>
                <option value="tablones">Tablones</option>
                <option value="tablillas">Tablillas</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontSize: '14px' }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Registro' : 'Crear Registro'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Madera;
