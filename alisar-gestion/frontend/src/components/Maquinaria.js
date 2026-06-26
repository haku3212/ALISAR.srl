import React, { useState, useMemo } from 'react';
import { Drill, Plus, Pencil, Trash2, Download, FileText, MapPin, User, Clock, Fuel, Wrench, AlertTriangle } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormMaquinariaDetallado from './forms/FormMaquinariaDetallado';
import SearchBar from './common/SearchBar';
import { generateMaquinariaReport, generateExcelReport } from '../utils/reportGenerator';

const C = {
  bg: '#080a08', surface: '#0f110f', card: '#131513', border: '#1c221c',
  border2: '#232a23', yellow: '#FFD700', blue: '#60a5fa', purple: '#a78bfa',
  green: '#34d399', orange: '#f97316', red: '#f87171', text: '#e2e8e2', muted: '#6b7a6b',
};

const estadoConfig = {
  'Operativo':     { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: '#34d399', dot: '#34d399' },
  'Mantenimiento': { bg: 'rgba(249,115,22,0.12)',  color: '#f97316', border: '#f97316', dot: '#f97316' },
  'Reparacion':    { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: '#f87171', dot: '#f87171' },
  'Inactivo':      { bg: 'rgba(107,122,107,0.12)', color: '#6b7a6b', border: '#6b7a6b', dot: '#6b7a6b' },
  'Desmantelado':  { bg: 'rgba(107,122,107,0.12)', color: '#6b7a6b', border: '#6b7a6b', dot: '#6b7a6b' },
};

const tipoIcon = {
  motoniveladora: '🏗️', topadora: '🚜', excavadora: '⛏️', retroexcavadora: '🦾',
  cargadora: '🚛', rodillo: '🛞', volquete: '🚚', grua: '🏗️', hormigonera: '⚙️', otra: '🔧',
};

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
          <p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '15px' }}>¿Eliminar equipo?</p>
          <p style={{ margin: '2px 0 0 0', color: C.muted, fontSize: '12px' }}>Esta acción no se puede deshacer</p>
        </div>
      </div>
      <p style={{ color: C.text, fontSize: '13px', margin: '0 0 20px 0' }}>
        Se eliminará permanentemente <strong style={{ color: '#fff' }}>{name}</strong> del sistema.
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

const Maquinaria = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getMaquinaria,
    dataService.createMaquinaria,
    dataService.updateMaquinaria,
    dataService.deleteMaquinaria
  );

  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState('');
  const [filters, setFilters]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [confirmId, setConfirmId]   = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', tipo: '', modelo: '', anio: '', numero_serie: '', placa: '',
    potencia: '', capacidad_carga: '', consumo_combustible: '', tipo_combustible: '',
    ancho_trabajo: '', profundidad_maxima: '',
    estado: 'Operativo', horas_operacion: '', mantenimiento_proximo: '', ultima_revision: '',
    operador_asignado: '', costo_mantenimiento_anual: '',
    numero_garantia: '', fecha_vencimiento_garantia: '', documento_adquisicion: '', notas: '',
    obra_asignada: '', fecha_traslado: '', litros_diesel_total: '', historial_fallas: '',
  });

  const uniqueTypes  = useMemo(() => [...new Set(data.map(m => m.tipo).filter(Boolean))], [data]);
  const uniqueStates = useMemo(() => [...new Set(data.map(m => m.estado).filter(Boolean))], [data]);
  const filterConfigs = useMemo(() => [
    { id: 'tipo',   label: 'Tipo',   type: 'select', options: uniqueTypes.map(t  => ({ label: t, value: t })) },
    { id: 'estado', label: 'Estado', type: 'select', options: uniqueStates.map(s => ({ label: s, value: s })) },
  ], [uniqueTypes, uniqueStates]);

  const filtered = useMemo(() => {
    let r = data.filter(m =>
      (m.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.tipo   || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.estado || '').toLowerCase().includes(search.toLowerCase())
    );
    if (filters.tipo)   r = r.filter(m => m.tipo   === filters.tipo);
    if (filters.estado) r = r.filter(m => m.estado === filters.estado);
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.tipo.trim())   errors.tipo   = 'Tipo requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetFormData = () => setFormData({
    nombre: '', tipo: '', modelo: '', anio: '', numero_serie: '', placa: '',
    potencia: '', capacidad_carga: '', consumo_combustible: '', tipo_combustible: '',
    ancho_trabajo: '', profundidad_maxima: '',
    estado: 'Operativo', horas_operacion: '', mantenimiento_proximo: '', ultima_revision: '',
    operador_asignado: '', costo_mantenimiento_anual: '',
    numero_garantia: '', fecha_vencimiento_garantia: '', documento_adquisicion: '', notas: '',
    obra_asignada: '', fecha_traslado: '', litros_diesel_total: '', historial_fallas: '',
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

  const handleEdit  = (m) => { setFormData(m); setEditingId(m.id); setFormErrors({}); setShowModal(true); };
  const handleNew   = () => { resetFormData(); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  const isMaintenanceSoon = (dateStr) => {
    if (!dateStr) return false;
    const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 14;
  };

  const confirmItem = data.find(m => m.id === confirmId);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', -apple-system, sans-serif", color: C.text, minHeight: '100%', background: C.bg }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>Gestión de Maquinaria</h1>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Control de equipos — {data.length} registros</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => generateMaquinariaReport(data)} style={{ ...btnBase, background: C.card, color: C.text, border: `1px solid ${C.border2}` }}>
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' }, { label: 'Tipo', key: 'tipo' },
            { label: 'Estado', key: 'estado' }, { label: 'Placa', key: 'placa' },
          ], 'Maquinaria')} style={{ ...btnBase, background: C.card, color: C.blue, border: `1px solid ${C.border2}` }}>
            <Download size={14} /> Excel
          </button>
          <button onClick={handleNew} style={{ ...btnBase, background: C.yellow, color: '#000', padding: '9px 20px' }}>
            <Plus size={16} /> Nuevo Equipo
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <SearchBar
        placeholder="Buscar por nombre, tipo o estado..."
        onSearch={setSearch}
        onFilterChange={setFilters}
        filters={filterConfigs}
      />

      {/* ── Lista de equipos ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 32px',
          background: C.card, borderRadius: '12px', border: `1px solid ${C.border}`, color: C.muted,
        }}>
          <Drill size={40} color={C.border2} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>{search ? 'No hay resultados para tu búsqueda' : 'Aún no hay maquinaria registrada'}</p>
          {!search && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: C.border2 }}>Presiona "Nuevo Equipo" para comenzar</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(m => {
            const est  = estadoConfig[m.estado] || estadoConfig['Inactivo'];
            const warn = isMaintenanceSoon(m.mantenimiento_proximo);
            return (
              <div key={m.id} style={{
                background: C.card, border: `1px solid ${warn ? 'rgba(249,115,22,0.35)' : C.border}`,
                borderLeft: `4px solid ${est.border}`,
                borderRadius: '12px', padding: '18px 22px',
                transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Icono tipo */}
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                    background: `${est.border}15`, border: `1px solid ${est.border}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  }}>
                    {tipoIcon[m.tipo] || '🔧'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>{m.nombre}</span>
                      {/* Badge estado */}
                      <span style={{
                        background: est.bg, color: est.color,
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '5px',
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: est.dot }} />
                        {m.estado}
                      </span>
                      {/* Alerta mantenimiento */}
                      {warn && (
                        <span style={{
                          background: 'rgba(249,115,22,0.15)', color: C.orange,
                          padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          border: '1px solid rgba(249,115,22,0.3)',
                        }}>
                          <AlertTriangle size={11} /> Mant. próximo
                        </span>
                      )}
                      {m.placa && (
                        <span style={{ color: C.muted, fontSize: '11px', fontFamily: 'monospace', background: C.surface, padding: '2px 6px', borderRadius: '4px' }}>
                          {m.placa}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ color: C.muted, fontSize: '12px' }}>{m.tipo}{m.modelo ? ` · ${m.modelo}` : ''}{m.anio ? ` · ${m.anio}` : ''}</span>
                      {m.obra_asignada && (
                        <span style={{ color: C.blue, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} /> {m.obra_asignada}
                        </span>
                      )}
                      {m.operador_asignado && (
                        <span style={{ color: C.muted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={11} /> {m.operador_asignado}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Métricas derechas */}
                  <div style={{ display: 'flex', gap: '20px', flexShrink: 0, alignItems: 'flex-start' }}>
                    {m.horas_operacion && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px' }}>HORAS</p>
                        <p style={{ margin: '2px 0 0 0', color: C.text, fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} color={C.muted} /> {Number(m.horas_operacion).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {m.litros_diesel_total && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px' }}>DIESEL</p>
                        <p style={{ margin: '2px 0 0 0', color: C.orange, fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Fuel size={12} color={C.orange} /> {Number(m.litros_diesel_total).toLocaleString()} L
                        </p>
                      </div>
                    )}
                    {m.mantenimiento_proximo && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px' }}>PRÓX. MANT.</p>
                        <p style={{ margin: '2px 0 0 0', color: warn ? C.orange : C.muted, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Wrench size={11} /> {new Date(m.mantenimiento_proximo).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    )}
                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                      <button onClick={() => handleEdit(m)} style={{
                        background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                        color: C.blue, cursor: 'pointer', borderRadius: '8px',
                        padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '12px', fontWeight: '600',
                      }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => setConfirmId(m.id)} style={{
                        background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                        color: C.red, cursor: 'pointer', borderRadius: '8px',
                        padding: '7px 10px', display: 'flex', alignItems: 'center',
                      }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Confirmación eliminar ──────────────────────────────────── */}
      {confirmId && confirmItem && (
        <ConfirmDelete
          name={confirmItem.nombre}
          onConfirm={() => { deleteItem(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* ── Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        mode={editingId ? 'edit' : 'create'}
        title={editingId ? 'Editar Equipo' : 'Nuevo Equipo'}
        subtitle={editingId ? `Modificando: ${formData.nombre || ''}` : 'Registra un nuevo equipo o maquinaria'}
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={handleClose} style={{ ...btnBase, background: C.surface, color: C.text, border: `1px solid ${C.border2}` }}>
              Cancelar
            </button>
            <button
              form="form-maquinaria"
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
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Equipo'}
            </button>
          </div>
        }
      >
        <form id="form-maquinaria" onSubmit={handleSubmit}>
          <FormMaquinariaDetallado
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

export default Maquinaria;
