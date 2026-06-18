import React, { useState, useMemo } from 'react';
import { HardHat, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import { generateObrasReport, generateExcelReport } from '../utils/reportGenerator';

const parseNum = (v) => parseFloat(String(v || 0).replace(/[^0-9.]/g, '')) || 0;
const fmt = (n) => n.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtPct = (n) => (isFinite(n) ? n.toFixed(1) : '0.0') + '%';

const ESTADOS = ['Planeado', 'En Curso', 'Finalizado', 'Suspendido', 'Cancelado'];
const ESTADO_COLOR = {
  'Planeado': '#6b7280', 'En Curso': '#60a5fa',
  'Finalizado': '#34d399', 'Suspendido': '#f97316', 'Cancelado': '#f87171'
};

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid #374151', background: '#111827', color: '#e0e0e0',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
};
const lbl = {
  display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
};
const sec = { fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #374151' };
const errTxt = { color: '#f87171', fontSize: '11px', margin: '4px 0 0 0' };

const EMPTY = {
  nombre: '', tipo: '', cliente: '', avance: 0, presupuesto: '',
  gastos_totales: '', responsable_tecnico: '', inicio_planeado: '',
  fin_planeado: '', descripcion: '', observaciones: '', estado: 'Planeado'
};

const Obras = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getObras, dataService.createObra, dataService.updateObra, dataService.deleteObra
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const filtered = useMemo(() => data.filter(o =>
    [o.nombre, o.tipo, o.cliente, o.estado].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  ), [data, search]);

  const totals = useMemo(() => {
    const presup = filtered.reduce((s, o) => s + parseNum(o.presupuesto), 0);
    const gastos = filtered.reduce((s, o) => s + parseNum(o.gastos_totales), 0);
    const ganancia = presup - gastos;
    return { presup, gastos, ganancia, margen: presup > 0 ? (ganancia / presup) * 100 : 0 };
  }, [filtered]);

  const validate = () => {
    const e = {};
    if (!formData.nombre?.trim()) e.nombre = 'Campo requerido';
    if (!String(formData.presupuesto || '').trim()) e.presupuesto = 'Campo requerido';
    const av = Number(formData.avance);
    if (isNaN(av) || av < 0 || av > 100) e.avance = 'Debe ser 0–100';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const payload = { ...formData, avance: Number(formData.avance), gastos_totales: parseNum(formData.gastos_totales) };
      editingId ? await update(editingId, payload) : await create(payload);
      setFormData(EMPTY);
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (obra) => {
    setFormData({ ...EMPTY, ...obra, gastos_totales: obra.gastos_totales || '' });
    setFormErrors({}); setEditingId(obra.id); setShowModal(true);
  };
  const handleNew = () => { setFormData(EMPTY); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  // Live preview in form
  const fPresup = parseNum(formData.presupuesto);
  const fGastos = parseNum(formData.gastos_totales);
  const fGanancia = fPresup - fGastos;
  const fMargen = fPresup > 0 ? (fGanancia / fPresup) * 100 : 0;

  if (loading) return <LoadingSpinner />;

  const COL = '2fr 1fr 1fr 1fr 1fr 1fr 80px';

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HardHat size={22} color="#FFD700" /> Control de Obras
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0 0' }}>
            Gestión integral de presupuestos, gastos y avance de obras
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateObrasReport(data)} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #374151', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' }, { label: 'Estado', key: 'estado' },
            { label: 'Tipo', key: 'tipo' }, { label: 'Presupuesto', key: 'presupuesto' },
            { label: 'Gastos', key: 'gastos_totales' }, { label: 'Avance %', key: 'avance' }
          ], 'Obras')} style={{ background: '#1f2937', color: '#ccc', border: '1px solid #374151', padding: '9px 14px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Download size={15} /> Excel
          </button>
          <button onClick={handleNew} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '9px 20px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px' }}>
            <Plus size={16} /> Nueva Obra
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, tipo, cliente o estado..."
          style={{ ...inp, paddingLeft: '36px' }} />
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>🔍</span>
      </div>

      {/* Table */}
      <div style={{ background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden' }}>

        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '12px 20px', background: '#111827', borderBottom: '1px solid #374151' }}>
          {['PROYECTO', 'ESTADO', 'PRESUPUESTO', 'GASTOS', 'GANANCIA NETA', 'MARGEN', 'ACCIONES'].map(h => (
            <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#FFD700', letterSpacing: '0.5px' }}>{h}</span>
          ))}
        </div>

        {/* Data rows */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            {search ? 'Sin resultados' : 'No hay obras registradas — presiona "Nueva Obra" para comenzar'}
          </div>
        ) : filtered.map((obra, i) => {
          const presup = parseNum(obra.presupuesto);
          const gastos = parseNum(obra.gastos_totales);
          const ganancia = presup - gastos;
          const margen = presup > 0 ? (ganancia / presup) * 100 : 0;
          const color = ESTADO_COLOR[obra.estado] || '#6b7280';
          const avance = obra.avance || 0;

          return (
            <div key={obra.id}
              style={{ display: 'grid', gridTemplateColumns: COL, padding: '16px 20px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '1px solid #374151' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#252f3e'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Nombre + avance bar */}
              <div>
                <div style={{ color: '#FFD700', fontWeight: '600', fontSize: '14px', marginBottom: '3px' }}>{obra.nombre}</div>
                {(obra.tipo || obra.cliente) && (
                  <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>
                    {[obra.tipo, obra.cliente].filter(Boolean).join(' · ')}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ flex: 1, background: '#374151', height: '3px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(avance, 100)}%`, height: '100%', borderRadius: '2px', background: avance >= 75 ? '#34d399' : avance >= 50 ? '#60a5fa' : '#f97316' }} />
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: '10px', minWidth: '28px' }}>{avance}%</span>
                </div>
              </div>

              {/* Estado badge */}
              <div>
                <span style={{ display: 'inline-block', background: color + '20', color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', border: `1px solid ${color}50` }}>
                  {obra.estado || 'Planeado'}
                </span>
              </div>

              {/* Presupuesto */}
              <span style={{ color: '#e0e0e0', fontSize: '14px' }}>Bs {fmt(presup)}</span>

              {/* Gastos */}
              <span style={{ color: gastos > 0 ? '#f87171' : '#6b7280', fontSize: '14px' }}>Bs {fmt(gastos)}</span>

              {/* Ganancia Neta */}
              <span style={{ color: ganancia >= 0 ? '#34d399' : '#f87171', fontSize: '14px', fontWeight: '600' }}>
                {ganancia < 0 ? '-' : ''}Bs {fmt(Math.abs(ganancia))}
              </span>

              {/* Margen */}
              <span style={{ color: margen >= 20 ? '#34d399' : margen >= 0 ? '#FFD700' : '#f87171', fontSize: '14px', fontWeight: '600' }}>
                {fmtPct(margen)}
              </span>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button onClick={() => handleEdit(obra)}
                  style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '6px', borderRadius: '6px', lineHeight: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1e3a5f'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                ><Edit2 size={15} /></button>
                <button onClick={() => deleteItem(obra.id)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px', borderRadius: '6px', lineHeight: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d1515'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                ><Trash2 size={15} /></button>
              </div>
            </div>
          );
        })}

        {/* Totals row */}
        {filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '14px 20px', background: '#111827', borderTop: '2px solid #FFD70060', alignItems: 'center' }}>
            <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '13px' }}>TOTALES ({filtered.length})</span>
            <span />
            <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '13px' }}>Bs {fmt(totals.presup)}</span>
            <span style={{ color: '#f87171', fontWeight: '700', fontSize: '13px' }}>Bs {fmt(totals.gastos)}</span>
            <span style={{ color: totals.ganancia >= 0 ? '#34d399' : '#f87171', fontWeight: '700', fontSize: '13px' }}>
              {totals.ganancia < 0 ? '-' : ''}Bs {fmt(Math.abs(totals.ganancia))}
            </span>
            <span style={{ color: totals.margen >= 0 ? '#34d399' : '#f87171', fontWeight: '700', fontSize: '13px' }}>{fmtPct(totals.margen)}</span>
            <span />
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showModal} onClose={handleClose} title={editingId ? 'Editar Obra' : 'Nueva Obra'}>
        <form onSubmit={handleSubmit}>

          {/* Sección: General */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ ...sec, color: '#FFD700' }}>📋 INFORMACIÓN GENERAL</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Nombre de la Obra <span style={{ color: '#FFD700' }}>*</span></label>
                <input style={{ ...inp, border: `1px solid ${formErrors.nombre ? '#f87171' : '#374151'}` }}
                  value={formData.nombre} onChange={set('nombre')}
                  placeholder="Ej: Mantenimiento Tramo Vial Riberalta" disabled={submitting} />
                {formErrors.nombre && <p style={errTxt}>{formErrors.nombre}</p>}
              </div>
              <div>
                <label style={lbl}>Estado</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={formData.estado} onChange={set('estado')} disabled={submitting}>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Tipo de Obra</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={formData.tipo} onChange={set('tipo')} disabled={submitting}>
                  <option value="">Seleccionar...</option>
                  <option>Vial / Camino</option>
                  <option>Edificación</option>
                  <option>Saneamiento</option>
                  <option>Electrificación</option>
                  <option>Forestal / Reforestación</option>
                  <option>Otra</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Cliente / Solicitante</label>
                <input style={inp} value={formData.cliente} onChange={set('cliente')} placeholder="Ej: Municipalidad de Riberalta" disabled={submitting} />
              </div>
              <div>
                <label style={lbl}>Responsable Técnico</label>
                <input style={inp} value={formData.responsable_tecnico} onChange={set('responsable_tecnico')} placeholder="Ej: Ing. Carlos López" disabled={submitting} />
              </div>
            </div>
          </div>

          {/* Sección: Finanzas */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ ...sec, color: '#34d399' }}>💰 FINANZAS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={lbl}>Presupuesto (Bs) <span style={{ color: '#FFD700' }}>*</span></label>
                <input style={{ ...inp, border: `1px solid ${formErrors.presupuesto ? '#f87171' : '#374151'}` }}
                  value={formData.presupuesto} onChange={set('presupuesto')}
                  placeholder="Ej: 500000" disabled={submitting} />
                {formErrors.presupuesto && <p style={errTxt}>{formErrors.presupuesto}</p>}
              </div>
              <div>
                <label style={lbl}>Gastos Totales (Bs)</label>
                <input style={inp} type="number" min="0" step="0.01"
                  value={formData.gastos_totales} onChange={set('gastos_totales')}
                  placeholder="0" disabled={submitting} />
              </div>

              {fPresup > 0 && (
                <>
                  <div style={{ background: '#111827', borderRadius: '8px', padding: '12px 16px', border: '1px solid #374151' }}>
                    <p style={{ ...lbl, marginBottom: '4px' }}>Ganancia Neta</p>
                    <p style={{ margin: 0, color: fGanancia >= 0 ? '#34d399' : '#f87171', fontSize: '18px', fontWeight: '700' }}>
                      {fGanancia < 0 ? '-' : ''}Bs {fmt(Math.abs(fGanancia))}
                    </p>
                  </div>
                  <div style={{ background: '#111827', borderRadius: '8px', padding: '12px 16px', border: '1px solid #374151' }}>
                    <p style={{ ...lbl, marginBottom: '4px' }}>Margen</p>
                    <p style={{ margin: 0, color: fMargen >= 20 ? '#34d399' : fMargen >= 0 ? '#FFD700' : '#f87171', fontSize: '18px', fontWeight: '700' }}>
                      {fmtPct(fMargen)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sección: Cronograma */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ ...sec, color: '#60a5fa' }}>📅 CRONOGRAMA</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={lbl}>Inicio Planeado</label>
                <input style={inp} type="date" value={formData.inicio_planeado} onChange={set('inicio_planeado')} disabled={submitting} />
              </div>
              <div>
                <label style={lbl}>Fin Planeado</label>
                <input style={inp} type="date" value={formData.fin_planeado} onChange={set('fin_planeado')} disabled={submitting} />
              </div>
              <div>
                <label style={lbl}>Avance (%) <span style={{ color: '#FFD700' }}>*</span></label>
                <input style={{ ...inp, border: `1px solid ${formErrors.avance ? '#f87171' : '#374151'}` }}
                  type="number" min="0" max="100"
                  value={formData.avance} onChange={set('avance')} placeholder="0–100" disabled={submitting} />
                {formErrors.avance && <p style={errTxt}>{formErrors.avance}</p>}
              </div>
            </div>
          </div>

          {/* Sección: Notas */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ ...sec, color: '#a78bfa' }}>📝 NOTAS</p>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={lbl}>Descripción</label>
                <textarea style={{ ...inp, minHeight: '68px', resize: 'vertical', lineHeight: '1.5' }}
                  value={formData.descripcion} onChange={set('descripcion')}
                  placeholder="Descripción general de la obra..." disabled={submitting} />
              </div>
              <div>
                <label style={lbl}>Observaciones</label>
                <textarea style={{ ...inp, minHeight: '56px', resize: 'vertical', lineHeight: '1.5' }}
                  value={formData.observaciones} onChange={set('observaciones')}
                  placeholder="Cambios, retrasos, notas importantes..." disabled={submitting} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, fontSize: '14px' }}>
            {submitting ? 'Guardando...' : editingId ? '✓ Actualizar Obra' : '+ Crear Obra'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Obras;
