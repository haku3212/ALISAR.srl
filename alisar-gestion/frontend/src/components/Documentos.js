import React, { useState, useMemo } from 'react';
import { FileText, Plus, Edit2, Trash2, Download, AlertCircle } from 'lucide-react';
import { dataService } from '../services/api';
import { validateDate, validateDateAfter } from '../utils/validators';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import SearchBar from './common/SearchBar';
import { generateExcelReport } from '../utils/reportGenerator';

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
  tipo_documento: '', numero_documento: '', entidad_emisora: '', responsable: '',
  fecha_emision: '', fecha_vencimiento: '', periodo_validez: '',
  descripcion: '', estado: 'Vigente',
  asociado_rodeo: '', asociado_proyecto: '', asociado_maquinaria: '', asociado_campamento: '',
  url_documento: '', referencia_archivo: '', observaciones: ''
};

const getEstadoVenc = (fv) => {
  if (!fv) return 'sin_fecha';
  const d = Math.ceil((new Date(fv) - new Date()) / 86400000);
  if (d < 0) return 'vencido';
  if (d === 0) return 'vence_hoy';
  if (d < 30) return 'proximo_vencer';
  return 'vigente';
};

const VENC_COLOR = { vigente: '#4ade80', proximo_vencer: '#fbbf24', vence_hoy: '#f97316', vencido: '#f87171', sin_fecha: '#6b7280' };
const VENC_LABEL = { vigente: 'Vigente', proximo_vencer: 'Por vencer', vence_hoy: 'Vence hoy', vencido: 'Vencido', sin_fecha: 'Sin fecha' };

const TIPO_DOC_OPTS = ['POAT', 'contrato', 'certificado', 'guia_forestal', 'permiso', 'factura', 'licencia', 'otro'];

const Documentos = () => {
  // useCRUD exporta requestDelete/confirmDelete/cancelDelete — NO "delete" directamente
  const { data, loading, error, editingId, setEditingId, create, update,
          requestDelete, confirmDelete, cancelDelete, pendingDeleteId } = useCRUD(
    dataService.getDocumentos, dataService.createDocumento, dataService.updateDocumento, dataService.deleteDocumento
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const uniqueTypes = useMemo(() => [...new Set(data.map(d => d.tipo_documento).filter(Boolean))], [data]);

  const filterConfigs = useMemo(() => [
    { id: 'tipo_documento', label: 'Tipo', type: 'select', options: uniqueTypes.map(t => ({ label: t, value: t })) },
    { id: 'estado_vencimiento', label: 'Vencimiento', type: 'select', options: [
      { label: 'Vigente', value: 'vigente' },
      { label: 'Por vencer (<30 días)', value: 'proximo_vencer' },
      { label: 'Vence hoy', value: 'vence_hoy' },
      { label: 'Vencido', value: 'vencido' }
    ]}
  ], [uniqueTypes]);

  const filtered = useMemo(() => {
    let r = data.filter(d =>
      d.numero_documento?.toLowerCase().includes(search.toLowerCase()) ||
      d.tipo_documento?.toLowerCase().includes(search.toLowerCase()) ||
      d.entidad_emisora?.toLowerCase().includes(search.toLowerCase()) ||
      d.responsable?.toLowerCase().includes(search.toLowerCase())
    );
    if (filters.tipo_documento) r = r.filter(d => d.tipo_documento === filters.tipo_documento);
    if (filters.estado_vencimiento) r = r.filter(d => getEstadoVenc(d.fecha_vencimiento) === filters.estado_vencimiento);
    r.sort((a, b) => new Date(a.fecha_vencimiento || '9999-12-31') - new Date(b.fecha_vencimiento || '9999-12-31'));
    return r;
  }, [data, search, filters]);

  const alertas = data.filter(d => ['vencido', 'vence_hoy', 'proximo_vencer'].includes(getEstadoVenc(d.fecha_vencimiento))).length;

  const validate = () => {
    const e = {};
    if (!formData.tipo_documento?.trim()) e.tipo_documento = 'Campo requerido';
    if (!formData.numero_documento?.trim()) e.numero_documento = 'Campo requerido';
    if (!formData.entidad_emisora?.trim()) e.entidad_emisora = 'Campo requerido';
    if (!formData.fecha_emision?.trim()) e.fecha_emision = 'Campo requerido';
    else if (!validateDate(formData.fecha_emision)) e.fecha_emision = 'Fecha no válida';
    if (!formData.fecha_vencimiento?.trim()) e.fecha_vencimiento = 'Campo requerido';
    else if (formData.fecha_emision && !validateDateAfter(formData.fecha_vencimiento, formData.fecha_emision)) {
      e.fecha_vencimiento = 'Debe ser posterior a la fecha de emisión';
    }
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const ok = editingId ? await update(editingId, formData) : await create(formData);
      if (ok) { setFormData(EMPTY); setShowModal(false); }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (d) => { setFormData({ ...EMPTY, ...d }); setFormErrors({}); setEditingId(d.id); setShowModal(true); };
  const handleNew = () => { setFormData(EMPTY); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  const formatDate = (d) => { try { return d ? new Date(d).toLocaleDateString('es-BO') : '—'; } catch { return d || '—'; } };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '700' }}>Documentos y Permisos</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0 0' }}>Permisos forestales, contratos y certificados</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {alertas > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 12px', background: '#2d1515', border: '1px solid #f87171', borderRadius: '8px', color: '#f87171', fontSize: '12px', fontWeight: '600' }}>
              <AlertCircle size={14} /> {alertas} alerta{alertas > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={() => generateExcelReport(data, [
            { label: 'Tipo', key: 'tipo_documento' }, { label: 'Número', key: 'numero_documento' },
            { label: 'Entidad', key: 'entidad_emisora' }, { label: 'Responsable', key: 'responsable' },
            { label: 'Emisión', key: 'fecha_emision' }, { label: 'Vencimiento', key: 'fecha_vencimiento' }
          ], 'Documentos')} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #374151', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={15} /> Excel
          </button>
          <button onClick={handleNew} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px' }}>
            <Plus size={16} /> Nuevo Documento
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}
      <SearchBar placeholder="Buscar por número, tipo, entidad o responsable..." onSearch={setSearch} onFilterChange={setFilters} filters={filterConfigs} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#6b7280' }}>
          {search ? 'Sin resultados para la búsqueda' : 'No hay documentos registrados'}
        </div>
      ) : (
        <div style={{ background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Tipo', 'Número', 'Entidad Emisora', 'Responsable', 'Vencimiento', 'Estado', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const ev = getEstadoVenc(d.fecha_vencimiento);
                const color = VENC_COLOR[ev];
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={14} color="#FFD700" />
                        <span style={{ color: '#e0e0e0', fontSize: '13px', fontWeight: '500' }}>{d.tipo_documento}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '13px', fontFamily: 'monospace' }}>{d.numero_documento}</td>
                    <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '12px', maxWidth: '180px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{d.entidad_emisora}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '13px' }}>{d.responsable || '—'}</td>
                    <td style={{ padding: '14px 16px', color: ev === 'vencido' ? '#f87171' : ev === 'proximo_vencer' ? '#fbbf24' : '#aaa', fontSize: '13px', fontWeight: ev !== 'vigente' ? '600' : '400' }}>
                      {formatDate(d.fecha_vencimiento)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color, border: `1px solid ${color}`, padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: '600' }}>
                        {VENC_LABEL[ev]}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(d)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '2px' }}><Edit2 size={16} /></button>
                        <button onClick={() => requestDelete(d.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación — pendingDeleteId es seteado por requestDelete */}
      <Modal isOpen={!!pendingDeleteId} onClose={cancelDelete} title="Confirmar Eliminación">
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <p style={{ color: '#e0e0e0', marginBottom: '24px' }}>¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={cancelDelete} style={{ background: '#374151', color: '#e0e0e0', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
            <button onClick={confirmDelete} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Eliminar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal} onClose={handleClose} title={editingId ? 'Editar Documento' : 'Nuevo Documento'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Tipo de Documento <span style={{ color: '#FFD700' }}>*</span></label>
              <select style={{ ...inp, border: `1px solid ${formErrors.tipo_documento ? '#f87171' : '#374151'}`, cursor: 'pointer' }} value={formData.tipo_documento} onChange={set('tipo_documento')} disabled={submitting}>
                <option value="">Seleccionar...</option>
                {TIPO_DOC_OPTS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              {formErrors.tipo_documento && <p style={errTxt}>{formErrors.tipo_documento}</p>}
            </div>
            <div>
              <label style={lbl}>Número de Documento <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.numero_documento ? '#f87171' : '#374151'}` }} value={formData.numero_documento} onChange={set('numero_documento')} placeholder="Ej: POAT-2026-001" disabled={submitting} />
              {formErrors.numero_documento && <p style={errTxt}>{formErrors.numero_documento}</p>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Entidad Emisora <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.entidad_emisora ? '#f87171' : '#374151'}` }} value={formData.entidad_emisora} onChange={set('entidad_emisora')} placeholder="Ej: ABT - Autoridad de Fiscalización de Bosques" disabled={submitting} />
              {formErrors.entidad_emisora && <p style={errTxt}>{formErrors.entidad_emisora}</p>}
            </div>
            <div>
              <label style={lbl}>Responsable</label>
              <input style={inp} value={formData.responsable} onChange={set('responsable')} placeholder="Ej: Ing. Luis Fernando Arce" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <div style={{ ...inp, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default', color: VENC_COLOR[getEstadoVenc(formData.fecha_vencimiento)] }}>
                {VENC_LABEL[getEstadoVenc(formData.fecha_vencimiento)]}
              </div>
              <p style={{ color: '#6b7280', fontSize: '11px', margin: '4px 0 0 0' }}>
                El estado se calcula automáticamente según la fecha de vencimiento
              </p>
            </div>
            <div>
              <label style={lbl}>Fecha de Emisión <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.fecha_emision ? '#f87171' : '#374151'}` }} type="date" value={formData.fecha_emision} onChange={set('fecha_emision')} disabled={submitting} />
              {formErrors.fecha_emision && <p style={errTxt}>{formErrors.fecha_emision}</p>}
            </div>
            <div>
              <label style={lbl}>Fecha de Vencimiento <span style={{ color: '#FFD700' }}>*</span></label>
              <input style={{ ...inp, border: `1px solid ${formErrors.fecha_vencimiento ? '#f87171' : '#374151'}` }} type="date" value={formData.fecha_vencimiento} onChange={set('fecha_vencimiento')} disabled={submitting} />
              {formErrors.fecha_vencimiento && <p style={errTxt}>{formErrors.fecha_vencimiento}</p>}
            </div>
            <div>
              <label style={lbl}>Período de Validez (años)</label>
              <input style={inp} type="number" min="0" step="0.5" value={formData.periodo_validez} onChange={set('periodo_validez')} placeholder="Ej: 1" disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Descripción</label>
              <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical', lineHeight: '1.5' }} value={formData.descripcion} onChange={set('descripcion')} placeholder="Descripción del documento o permiso..." disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Asociado a Rodeo (ID)</label>
              <input style={inp} value={formData.asociado_rodeo} onChange={set('asociado_rodeo')} placeholder="Ej: 1" disabled={submitting} />
            </div>
            <div>
              <label style={lbl}>Asociado a Proyecto</label>
              <input style={inp} value={formData.asociado_proyecto} onChange={set('asociado_proyecto')} placeholder="Ej: Mantenimiento Tramo Vial" disabled={submitting} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Observaciones</label>
              <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical', lineHeight: '1.5' }} value={formData.observaciones} onChange={set('observaciones')} placeholder="Notas adicionales..." disabled={submitting} />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontSize: '14px' }}>
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Documento' : 'Registrar Documento'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Documentos;
