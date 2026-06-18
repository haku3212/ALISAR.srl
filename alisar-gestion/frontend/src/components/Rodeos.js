import React, { useState, useMemo } from 'react';
import { Trees, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import SearchBar from './common/SearchBar';
import { generateRodeoReport, generateExcelReport } from '../utils/reportGenerator';

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
  fecha_rodeo: '', volumen_total: '', responsable_rodeo: '', contrato_asociado: '',
  especie_principal: '', otras_especies: '', procedencia: '', destino_final: '',
  estado_operacion: 'En Proceso', fecha_transporte: '',
  poat_numero: '', poat_vencimiento: '', otros_permisos: '', fecha_limite_permisos: '',
  observaciones: '',
  ubicacion_origen: '',
  ubicacion_destino: '',
  ubicacion_origen_coords: null,
  ubicacion_destino_coords: null,
  descripcion: '',
  lat: '',
  lng: ''
};

const estadoBadge = {
  'En Proceso': { bg: '#1a1f2a', color: '#60a5fa' },
  'Completado': { bg: '#1a2a1a', color: '#FFD700' },
  'Entregado': { bg: '#1a2a1a', color: '#4ade80' },
  'Cancelado': { bg: '#2a1a1a', color: '#f87171' }
};

const Rodeos = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getRodeos, dataService.createRodeo, dataService.updateRodeo, dataService.deleteRodeo
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const uniqueStates = useMemo(() => [...new Set(data.map(r => r.estado_operacion).filter(Boolean))], [data]);
  const uniqueSpecies = useMemo(() => [...new Set(data.map(r => r.especie_principal).filter(Boolean))], [data]);

  const filterConfigs = useMemo(() => [
    { id: 'estado_operacion', label: 'Estado', type: 'select', options: uniqueStates.map(s => ({ label: s, value: s })) },
    { id: 'especie_principal', label: 'Especie', type: 'select', options: uniqueSpecies.map(s => ({ label: s, value: s })) }
  ], [uniqueStates, uniqueSpecies]);

  const filtered = useMemo(() => {
    let r = data.filter(r =>
      r.responsable_rodeo?.toLowerCase().includes(search.toLowerCase()) ||
      r.procedencia?.toLowerCase().includes(search.toLowerCase()) ||
      r.destino_final?.toLowerCase().includes(search.toLowerCase()) ||
      r.especie_principal?.toLowerCase().includes(search.toLowerCase()) ||
      r.contrato_asociado?.toLowerCase().includes(search.toLowerCase())
    );
    if (filters.estado_operacion) r = r.filter(x => x.estado_operacion === filters.estado_operacion);
    if (filters.especie_principal) r = r.filter(x => x.especie_principal === filters.especie_principal);
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const e = {};
    if (!formData.fecha_rodeo?.trim()) e.fecha_rodeo = 'Campo requerido';
    if (!formData.volumen_total?.toString().trim()) e.volumen_total = 'Campo requerido';
    if (!formData.responsable_rodeo?.trim()) e.responsable_rodeo = 'Campo requerido';
    if (!formData.procedencia?.trim()) e.procedencia = 'Campo requerido';
    if (!formData.destino_final?.trim()) e.destino_final = 'Campo requerido';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const payload = { ...formData };
      editingId ? await update(editingId, payload) : await create(payload);
      setFormData(EMPTY);
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r) => { setFormData({ ...EMPTY, ...r }); setFormErrors({}); setEditingId(r.id); setShowModal(true); };
  const handleNew = () => { setFormData(EMPTY); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  const formatDate = (d) => { try { return d ? new Date(d).toLocaleDateString('es-BO') : '—'; } catch { return d || '—'; } };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '700' }}>Gestión de Rodeos Forestales</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0 0' }}>Registro de operaciones de extracción de madera</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateRodeoReport(data)} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Fecha', key: 'fecha_rodeo' }, { label: 'Volumen (m³)', key: 'volumen_total' },
            { label: 'Especie', key: 'especie_principal' }, { label: 'Responsable', key: 'responsable_rodeo' },
            { label: 'Origen', key: 'procedencia' }, { label: 'Destino', key: 'destino_final' },
            { label: 'Estado', key: 'estado_operacion' }
          ], 'Rodeos')} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #2a2f2a', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={15} /> Excel
          </button>
          <button onClick={handleNew} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px' }}>
            <Plus size={16} /> Nuevo Rodeo
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}
      <SearchBar placeholder="Buscar por responsable, especie, origen, destino o contrato..." onSearch={setSearch} onFilterChange={setFilters} filters={filterConfigs} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#555' }}>
          {search ? 'Sin resultados para la búsqueda' : 'No hay rodeos registrados'}
        </div>
      ) : (
        <div style={{ background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Fecha', 'Vol. (m³)', 'Especie', 'Responsable', 'Origen → Destino', 'Estado', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const badge = estadoBadge[r.estado_operacion] || { bg: '#252525', color: '#888' };
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trees size={14} color="#FFD700" />
                        <span style={{ color: '#e0e0e0', fontSize: '13px' }}>{formatDate(r.fecha_rodeo)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#FFD700', fontWeight: '600', fontSize: '14px' }}>{r.volumen_total}</td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '13px', textTransform: 'capitalize' }}>{r.especie_principal || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '13px' }}>{r.responsable_rodeo}</td>
                    <td style={{ padding: '14px 16px', color: '#888', fontSize: '12px', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.procedencia} → {r.destino_final}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: '600' }}>{r.estado_operacion}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(r)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '2px' }}><Edit2 size={16} /></button>
                        <button onClick={() => deleteItem(r.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleClose} title={editingId ? 'Editar Rodeo' : 'Nuevo Rodeo Forestal'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Fecha del Rodeo <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.fecha_rodeo ? '#f87171' : '#252a25'}` }} type="date" value={formData.fecha_rodeo} onChange={set('fecha_rodeo')} disabled={submitting} />
              {formErrors.fecha_rodeo && <p style={errTxt}>{formErrors.fecha_rodeo}</p>}
            </div>
            <div>
              <label style={lbl}>Volumen Total (m³) <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.volumen_total ? '#f87171' : '#252a25'}` }} type="number" min="0" step="0.1" value={formData.volumen_total} onChange={set('volumen_total')} placeholder="Ej: 48.5" disabled={submitting} />
              {formErrors.volumen_total && <p style={errTxt}>{formErrors.volumen_total}</p>}
            </div>
            <div>
              <label style={lbl}>Responsable <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.responsable_rodeo ? '#f87171' : '#252a25'}` }} value={formData.responsable_rodeo} onChange={set('responsable_rodeo')} placeholder="Ej: Juan Pablo Suárez" disabled={submitting} />
              {formErrors.responsable_rodeo && <p style={errTxt}>{formErrors.responsable_rodeo}</p>}
            </div>
            <div>
              <label style={lbl}>Contrato Asociado</label>
              <input style={inp} value={formData.contrato_asociado} onChange={set('contrato_asociado')} placeholder="Ej: CTR-2026-001" disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Procedencia / Origen <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.procedencia ? '#f87171' : '#252a25'}` }} value={formData.procedencia} onChange={set('procedencia')} placeholder="Ej: Comunidad San Miguel Norte" disabled={submitting} />
              {formErrors.procedencia && <p style={errTxt}>{formErrors.procedencia}</p>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Destino Final <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.destino_final ? '#f87171' : '#252a25'}` }} value={formData.destino_final} onChange={set('destino_final')} placeholder="Ej: Aserradero El Pino - Riberalta" disabled={submitting} />
              {formErrors.destino_final && <p style={errTxt}>{formErrors.destino_final}</p>}
            </div>
            <div>
              <label style={lbl}>Especie Principal</label>
              <input style={inp} value={formData.especie_principal} onChange={set('especie_principal')} placeholder="Ej: mara, cedro, almendrillo" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Otras Especies</label>
              <input style={inp} value={formData.otras_especies} onChange={set('otras_especies')} placeholder="Ej: Almendrillo, Tajibo" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Estado de Operación</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={formData.estado_operacion} onChange={set('estado_operacion')} disabled={submitting}>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Fecha de Transporte</label>
              <input style={inp} type="date" value={formData.fecha_transporte} onChange={set('fecha_transporte')} disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>N° POAT</label>
              <input style={inp} value={formData.poat_numero} onChange={set('poat_numero')} placeholder="Ej: POAT-2026-001" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Vencimiento POAT</label>
              <input style={inp} type="date" value={formData.poat_vencimiento} onChange={set('poat_vencimiento')} disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Otros Permisos</label>
              <input style={inp} value={formData.otros_permisos} onChange={set('otros_permisos')} placeholder="Ej: Permiso de tránsito, guía forestal..." disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Observaciones</label>
              <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical', lineHeight: '1.5' }} value={formData.observaciones} onChange={set('observaciones')} placeholder="Incidencias, notas del rodeo..." disabled={submitting} />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontSize: '14px' }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Rodeo' : 'Registrar Rodeo'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Rodeos;
