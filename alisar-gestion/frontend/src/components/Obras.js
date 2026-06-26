import React, { useState, useMemo } from 'react';
import { HardHat, MapPin, Plus, Pencil, Trash2, Download, FileText, TrendingUp, Calendar, User, DollarSign, Fuel, AlertTriangle } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormObrasDetallado from './forms/FormObrasDetallado';
import SearchBar from './common/SearchBar';
import { generateObrasReport, generateExcelReport } from '../utils/reportGenerator';

// ─── Paleta consistente con el Dashboard ──────────────────────────────────────
const C = {
  bg: '#080a08', surface: '#0f110f', card: '#131513', border: '#1c221c',
  border2: '#232a23', yellow: '#FFD700', blue: '#60a5fa', purple: '#a78bfa',
  green: '#34d399', orange: '#f97316', red: '#f87171', text: '#e2e8e2', muted: '#6b7a6b',
};

const estadoConfig = {
  'Ejecucion':    { label: 'En Ejecución',   bg: 'rgba(52,211,153,0.12)',  color: '#34d399', dot: '#34d399' },
  'Planificacion':{ label: 'Planificación',   bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', dot: '#60a5fa' },
  'Paralizada':   { label: 'Paralizada',      bg: 'rgba(249,115,22,0.12)',  color: '#f97316', dot: '#f97316' },
  'Terminada':    { label: 'Terminada',        bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', dot: '#a78bfa' },
};

const faseLabel = {
  planificacion: 'Planificación', diseño: 'Diseño', preparacion: 'Preparación',
  ejecucion: 'Ejecución', acabados: 'Acabados', cierre: 'Cierre', terminada: 'Terminada',
};

const avanceColor = (v) => v >= 75 ? C.green : v >= 40 ? C.yellow : C.orange;

const StatMini = ({ icon: Icon, label, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <Icon size={12} color={C.muted} />
      <span style={{ color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <span style={{ color: color || C.text, fontSize: '14px', fontWeight: '700' }}>{value || '—'}</span>
  </div>
);

const btnBase = {
  border: 'none', borderRadius: '8px', fontWeight: '600',
  display: 'flex', alignItems: 'center', gap: '6px',
  cursor: 'pointer', fontSize: '13px', padding: '9px 16px',
};

const ConfirmDelete = ({ name, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1100, backdropFilter: 'blur(3px)', padding: '16px',
  }}>
    <div style={{
      background: C.card, border: `1px solid ${C.border2}`,
      borderRadius: '14px', padding: '28px 32px', maxWidth: '400px', width: '100%',
      boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={20} color={C.red} />
        </div>
        <div>
          <p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '15px' }}>¿Eliminar obra?</p>
          <p style={{ margin: '2px 0 0 0', color: C.muted, fontSize: '12px' }}>Esta acción no se puede deshacer</p>
        </div>
      </div>
      <p style={{ color: C.text, fontSize: '13px', margin: '0 0 20px 0' }}>
        Se eliminará permanentemente <strong style={{ color: '#fff' }}>{name}</strong>.
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ ...btnBase, background: C.surface, color: C.text, border: `1px solid ${C.border2}` }}>
          Cancelar
        </button>
        <button onClick={onConfirm} style={{ ...btnBase, background: C.red, color: '#fff' }}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
    </div>
  </div>
);

const Obras = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getObras, dataService.createObra, dataService.updateObra, dataService.deleteObra
  );

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState({});
  const [formData, setFormData]   = useState({
    nombre: '', codigo: '', descripcion: '', tipo: '', cliente: '',
    provincia: '', municipio: '', localidad: '', direccion_exacta: '',
    fase_actual: '', avance: 0, responsable_tecnico: '', supervisor: '',
    contratista: '', personal_asignado: '', presupuesto: '', monto_ejecutado: '',
    inicio_planeado: '', fin_planeado: '', inicio_real: '', fin_real: '',
    observaciones: '', estado: '',
    gasto_diesel: '', gasto_mantenimiento: '', gasto_materiales: '', gasto_mano_obra: '', gasto_otros: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors,  setFormErrors]  = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const uniqueTipos = useMemo(() => [...new Set(data.map(o => o.tipo).filter(Boolean))], [data]);
  const filterConfigs = useMemo(() => [
    { id: 'tipo', label: 'Tipo', type: 'select', options: uniqueTipos.map(t => ({ label: t, value: t })) }
  ], [uniqueTipos]);

  const filtered = useMemo(() => {
    let r = data.filter(o =>
      (o.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.cliente || '').toLowerCase().includes(search.toLowerCase()) ||
      String(o.presupuesto || '').toLowerCase().includes(search.toLowerCase())
    );
    if (filters.tipo) r = r.filter(o => o.tipo === filters.tipo);
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (formData.avance === undefined || formData.avance === null || formData.avance === '') errors.avance = 'Avance requerido';
    if (!formData.presupuesto) errors.presupuesto = 'Presupuesto requerido';
    const av = Number(formData.avance);
    if (isNaN(av) || av < 0 || av > 100) errors.avance = 'El avance debe ser entre 0 y 100';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetFormData = () => setFormData({
    nombre: '', codigo: '', descripcion: '', tipo: '', cliente: '',
    provincia: '', municipio: '', localidad: '', direccion_exacta: '',
    fase_actual: '', avance: 0, responsable_tecnico: '', supervisor: '',
    contratista: '', personal_asignado: '', presupuesto: '', monto_ejecutado: '',
    inicio_planeado: '', fin_planeado: '', inicio_real: '', fin_real: '',
    observaciones: '', estado: '',
    gasto_diesel: '', gasto_mantenimiento: '', gasto_materiales: '', gasto_mano_obra: '', gasto_otros: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const ok = editingId ? await update(editingId, formData) : await create(formData);
      if (ok) { resetFormData(); setShowModal(false); }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (obra) => { setFormData(obra); setEditingId(obra.id); setFormErrors({}); setShowModal(true); };
  const handleNew  = () => { resetFormData(); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose= () => { setShowModal(false); setEditingId(null); };
  const confirmItem = data.find(o => o.id === confirmId);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', -apple-system, sans-serif", color: C.text, minHeight: '100%', background: C.bg }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>Control de Obras</h1>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Seguimiento de ejecución y presupuestos</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => generateObrasReport(data)} style={{ ...btnBase, background: C.card, color: C.text, border: `1px solid ${C.border2}` }}>
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' }, { label: 'Presupuesto', key: 'presupuesto' },
            { label: 'Avance', key: 'avance' }, { label: 'Cliente', key: 'cliente' }
          ], 'Obras')} style={{ ...btnBase, background: C.card, color: C.blue, border: `1px solid ${C.border2}` }}>
            <Download size={14} /> Excel
          </button>
          <button onClick={handleNew} style={{ ...btnBase, background: C.yellow, color: '#000', padding: '9px 20px' }}>
            <Plus size={16} /> Nueva Obra
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <SearchBar
        placeholder="Buscar por nombre, cliente o presupuesto..."
        onSearch={setSearch}
        onFilterChange={setFilters}
        filters={filterConfigs}
      />

      {/* ── Lista de Obras ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 32px',
          background: C.card, borderRadius: '12px', border: `1px solid ${C.border}`, color: C.muted
        }}>
          <HardHat size={40} color={C.border2} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>{search ? 'No hay resultados para tu búsqueda' : 'Aún no hay obras registradas'}</p>
          {!search && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: C.border2 }}>Presiona "Nueva Obra" para comenzar</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(obra => {
            const av      = Number(obra.avance) || 0;
            const color   = avanceColor(av);
            const estado  = estadoConfig[obra.estado];
            const loc     = [obra.provincia, obra.municipio].filter(Boolean).join(', ') || 'Bolivia';
            const gasTotal = (Number(obra.gasto_diesel)||0) + (Number(obra.gasto_mantenimiento)||0) +
                             (Number(obra.gasto_materiales)||0) + (Number(obra.gasto_mano_obra)||0) +
                             (Number(obra.gasto_otros)||0);

            return (
              <div key={obra.id} style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${color}`,
                borderRadius: '12px',
                padding: '20px 24px',
                transition: 'border-color 0.2s'
              }}>
                {/* Fila 1: título + badges + acciones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                        {obra.nombre}
                      </h3>
                      {/* Badge estado */}
                      {estado && (
                        <span style={{
                          background: estado.bg, color: estado.color,
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: estado.dot }} />
                          {estado.label}
                        </span>
                      )}
                      {/* Badge fase */}
                      {obra.fase_actual && (
                        <span style={{
                          background: 'rgba(255,215,0,0.08)', color: C.yellow,
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          border: `1px solid rgba(255,215,0,0.15)`
                        }}>
                          {faseLabel[obra.fase_actual] || obra.fase_actual}
                        </span>
                      )}
                      {/* Código */}
                      {obra.codigo && (
                        <span style={{ color: C.muted, fontSize: '11px', fontFamily: 'monospace' }}>{obra.codigo}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ color: C.muted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} /> {loc}
                      </span>
                      {obra.cliente && (
                        <span style={{ color: C.muted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={11} /> {obra.cliente}
                        </span>
                      )}
                      {obra.responsable_tecnico && (
                        <span style={{ color: C.muted, fontSize: '12px' }}>
                          Resp: {obra.responsable_tecnico}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones acción */}
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '16px', flexShrink: 0 }}>
                    <button onClick={() => handleEdit(obra)} style={{
                      background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                      color: C.blue, cursor: 'pointer', borderRadius: '8px',
                      padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '12px', fontWeight: '600'
                    }}>
                      <Pencil size={13} /> Editar
                    </button>
                    <button onClick={() => setConfirmId(obra.id)} style={{
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                      color: C.red, cursor: 'pointer', borderRadius: '8px',
                      padding: '7px 10px', display: 'flex', alignItems: 'center',
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Fila 2: métricas */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '16px', marginBottom: '14px',
                  padding: '12px 16px',
                  background: C.surface, borderRadius: '8px',
                  border: `1px solid ${C.border}`
                }}>
                  <StatMini icon={DollarSign} label="Presupuesto" value={obra.presupuesto ? `${obra.presupuesto} Bs` : null} color={C.text} />
                  <StatMini icon={TrendingUp} label="Ejecutado" value={obra.monto_ejecutado ? `${obra.monto_ejecutado} Bs` : null} color={C.blue} />
                  {gasTotal > 0 && (
                    <StatMini icon={Fuel} label="Total Gastos" value={`${gasTotal.toLocaleString('es-BO')} Bs`} color={C.orange} />
                  )}
                  {obra.fin_planeado && (
                    <StatMini icon={Calendar} label="Entrega" value={new Date(obra.fin_planeado).toLocaleDateString('es-BO', { day:'2-digit', month:'short', year:'numeric'})} />
                  )}
                  {obra.personal_asignado && (
                    <StatMini icon={User} label="Personal" value={`${obra.personal_asignado} pers.`} />
                  )}
                </div>

                {/* Barra de avance */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: C.muted, fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px' }}>AVANCE</span>
                    <span style={{ color, fontSize: '13px', fontWeight: '700' }}>{av}%</span>
                  </div>
                  <div style={{ background: C.border, borderRadius: '6px', height: '7px', overflow: 'hidden' }}>
                    <div style={{
                      background: `linear-gradient(90deg, ${color}aa, ${color})`,
                      width: `${av}%`, height: '100%', borderRadius: '6px',
                      transition: 'width 0.4s ease',
                      boxShadow: `0 0 8px ${color}55`
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Confirmación eliminar ─────────────────────────────────── */}
      {confirmId && confirmItem && (
        <ConfirmDelete
          name={confirmItem.nombre}
          onConfirm={() => { deleteItem(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* ── Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        mode={editingId ? 'edit' : 'create'}
        title={editingId ? 'Editar Obra' : 'Nueva Obra'}
        subtitle={editingId ? `Modificando: ${formData.nombre || ''}` : 'Registra un nuevo proyecto u obra'}
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={handleClose} style={{ ...btnBase, background: C.surface, color: C.text, border: `1px solid ${C.border2}` }}>
              Cancelar
            </button>
            <button
              form="form-obras"
              type="submit"
              disabled={submitting}
              style={{
                ...btnBase, background: submitting ? '#b8a000' : C.yellow,
                color: '#000', padding: '10px 28px',
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '700',
              }}
            >
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Obra'}
            </button>
          </div>
        }
      >
        <form id="form-obras" onSubmit={handleSubmit}>
          <FormObrasDetallado
            formData={formData}
            onChange={setFormData}
            errors={formErrors}
            submitting={submitting}
          />
        </form>
      </Modal>
    </div>
  );
};

export default Obras;
