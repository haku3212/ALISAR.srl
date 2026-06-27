import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Phone, Mail, Pencil, Trash2, Download, FileText, Briefcase, AlertTriangle, Printer } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormPersonalDetallado from './forms/FormPersonalDetallado';
import SearchBar from './common/SearchBar';
import { generatePersonalReport, generateExcelReport, generateFichaIndividual } from '../utils/reportGenerator';

const C = {
  bg: '#080a08', surface: '#0f110f', card: '#131513', border: '#1c221c',
  border2: '#232a23', yellow: '#FFD700', blue: '#60a5fa', purple: '#a78bfa',
  green: '#34d399', orange: '#f97316', red: '#f87171', text: '#e2e8e2', muted: '#6b7a6b',
};

const estadoConfig = {
  'Activo':     { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', dot: '#34d399' },
  'Inactivo':   { bg: 'rgba(107,122,107,0.12)', color: '#6b7a6b', dot: '#6b7a6b' },
  'Licencia':   { bg: 'rgba(249,115,22,0.12)',  color: '#f97316', dot: '#f97316' },
  'Vacaciones': { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', dot: '#60a5fa' },
};

const AVATAR_COLORS = ['#60a5fa','#34d399','#a78bfa','#f97316','#FFD700','#f87171','#06b6d4'];
const avatarColor = (nombre) => AVATAR_COLORS[(nombre || '').charCodeAt(0) % AVATAR_COLORS.length];
const initials = (nombre) => {
  const parts = (nombre || '').trim().split(/\s+/);
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0] || '?')[0];
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
          <p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '15px' }}>¿Eliminar registro?</p>
          <p style={{ margin: '2px 0 0 0', color: C.muted, fontSize: '12px' }}>Esta acción no se puede deshacer</p>
        </div>
      </div>
      <p style={{ color: C.text, fontSize: '13px', margin: '0 0 20px 0' }}>
        Se eliminará permanentemente a <strong style={{ color: '#fff' }}>{name}</strong> del sistema.
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

const Personal = () => {
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getPersonal,
    dataService.createPersonal,
    dataService.updatePersonal,
    dataService.deletePersonal
  );

  const [showModal, setShowModal]       = useState(false);
  const [search, setSearch]             = useState('');
  const [filters, setFilters]           = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [formErrors, setFormErrors]     = useState({});
  const [confirmId, setConfirmId]       = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', cedula: '', email: '', celular: '', fecha_nacimiento: '', genero: '',
    cargo: '', departamento: '', fecha_ingreso: '', salario: '', tipo_contrato: '',
    estado: 'Activo', contacto_emergencia_nombre: '', contacto_emergencia_tel: '',
    contacto_emergencia_relacion: '', direccion: '', notas: '',
  });

  const uniqueCargos = useMemo(() => [...new Set(data.map(p => p.cargo).filter(Boolean))], [data]);
  const filterConfigs = useMemo(() => [
    { id: 'cargo', label: 'Cargo', type: 'select', options: uniqueCargos.map(c => ({ label: c, value: c })) },
  ], [uniqueCargos]);

  const filtered = useMemo(() => {
    let r = data.filter(p =>
      (p.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.cargo  || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.celular|| '').includes(search)
    );
    if (filters.cargo) r = r.filter(p => p.cargo === filters.cargo);
    return r;
  }, [data, search, filters]);

  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.cargo.trim())  errors.cargo  = 'Cargo requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetFormData = () => setFormData({
    nombre: '', cedula: '', email: '', celular: '', fecha_nacimiento: '', genero: '',
    cargo: '', departamento: '', fecha_ingreso: '', salario: '', tipo_contrato: '',
    estado: 'Activo', contacto_emergencia_nombre: '', contacto_emergencia_tel: '',
    contacto_emergencia_relacion: '', direccion: '', notas: '',
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

  const handleEdit  = (p) => { setFormData(p); setEditingId(p.id); setFormErrors({}); setShowModal(true); };
  const handleNew   = () => { resetFormData(); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingId(null); };

  const confirmItem = data.find(p => p.id === confirmId);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', -apple-system, sans-serif", color: C.text, minHeight: '100%', background: C.bg }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>Recursos Humanos</h1>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Personal operativo — {data.length} registros</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => generatePersonalReport(data)} style={{ ...btnBase, background: C.card, color: C.text, border: `1px solid ${C.border2}` }}>
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre', width: 28 },
            { label: 'Cédula', key: 'cedula', width: 14 },
            { label: 'Cargo', key: 'cargo', width: 22 },
            { label: 'Departamento', key: 'departamento', width: 20 },
            { label: 'Estado', key: 'estado', width: 14 },
            { label: 'Tipo Contrato', key: 'tipo_contrato', width: 18 },
            { label: 'Fecha Ingreso', key: 'fecha_ingreso', width: 16 },
            { label: 'Salario (Bs)', key: 'salario', width: 14 },
            { label: 'Celular', key: 'celular', width: 16 },
            { label: 'Email', key: 'email', width: 26 },
            { label: 'Contacto Emergencia', key: 'contacto_emergencia_nombre', width: 24 },
            { label: 'Tel. Emergencia', key: 'contacto_emergencia_tel', width: 16 },
            { label: 'Dirección', key: 'direccion', width: 28 },
          ], 'Personal')} style={{ ...btnBase, background: C.card, color: C.blue, border: `1px solid ${C.border2}` }}>
            <Download size={14} /> Excel
          </button>
          <button onClick={handleNew} style={{ ...btnBase, background: C.yellow, color: '#000', padding: '9px 20px' }}>
            <UserPlus size={16} /> Nuevo Personal
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

      {/* ── Totales ────────────────────────────────────────────────── */}
      {filtered.length > 0 && (() => {
        const activos    = filtered.filter(p => (p.estado || 'Activo') === 'Activo').length;
        const totalSal   = filtered.reduce((s, p) => s + (Number(p.salario) || 0), 0);
        const enLicencia = filtered.filter(p => p.estado === 'Licencia' || p.estado === 'Vacaciones').length;
        return (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px', marginBottom: '16px',
            padding: '14px 18px', background: C.card,
            border: `1px solid ${C.border}`, borderRadius: '10px',
          }}>
            {[
              { label: 'Total Registros', value: filtered.length, color: C.text },
              { label: 'Activos',         value: activos,          color: C.green },
              { label: 'En Licencia/Vac', value: enLicencia,       color: C.orange },
              { label: 'Planilla Total',  value: `Bs ${totalSal.toLocaleString('es-BO')}`, color: C.yellow },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p style={{ margin: '0 0 2px 0', color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</p>
                <p style={{ margin: 0, color, fontSize: '18px', fontWeight: '700' }}>{value}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Lista ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 32px',
          background: C.card, borderRadius: '12px', border: `1px solid ${C.border}`, color: C.muted,
        }}>
          <Users size={40} color={C.border2} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>{search ? 'No hay resultados para tu búsqueda' : 'Aún no hay personal registrado'}</p>
          {!search && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: C.border2 }}>Presiona "Nuevo Personal" para comenzar</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(p => {
            const est = estadoConfig[p.estado] || estadoConfig['Activo'];
            const av  = avatarColor(p.nombre);
            return (
              <div key={p.id} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
                transition: 'border-color 0.15s',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${av}18`, border: `1px solid ${av}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: av, fontSize: '14px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    {initials(p.nombre).toUpperCase()}
                  </span>
                </div>

                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>{p.nombre}</span>
                    <span style={{
                      background: est.bg, color: est.color,
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: est.dot }} />
                      {p.estado || 'Activo'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ color: C.yellow, fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={11} /> {p.cargo || '—'}
                    </span>
                    {p.departamento && (
                      <span style={{ color: C.muted, fontSize: '12px' }}>{p.departamento}</span>
                    )}
                    {p.celular && (
                      <span style={{ color: C.muted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} /> {p.celular}
                      </span>
                    )}
                    {p.email && (
                      <span style={{ color: C.muted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={11} /> {p.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Salario */}
                {p.salario && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px' }}>SALARIO</p>
                    <p style={{ margin: '2px 0 0 0', color: C.green, fontSize: '14px', fontWeight: '700' }}>Bs {Number(p.salario).toLocaleString('es-BO')}</p>
                  </div>
                )}

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => generateFichaIndividual('personal', p)} title="Ficha PDF" style={{
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
                    color: C.orange, cursor: 'pointer', borderRadius: '8px',
                    padding: '7px 10px', display: 'flex', alignItems: 'center',
                  }}>
                    <Printer size={13} />
                  </button>
                  <button onClick={() => handleEdit(p)} style={{
                    background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                    color: C.blue, cursor: 'pointer', borderRadius: '8px',
                    padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '12px', fontWeight: '600',
                  }}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button onClick={() => setConfirmId(p.id)} style={{
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                    color: C.red, cursor: 'pointer', borderRadius: '8px',
                    padding: '7px 10px', display: 'flex', alignItems: 'center',
                  }}>
                    <Trash2 size={13} />
                  </button>
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
        title={editingId ? 'Editar Personal' : 'Nuevo Personal'}
        subtitle={editingId ? `Modificando: ${formData.nombre || ''}` : 'Completa los datos del nuevo colaborador'}
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={handleClose} style={{ ...btnBase, background: C.surface, color: C.text, border: `1px solid ${C.border2}` }}>
              Cancelar
            </button>
            <button
              form="form-personal"
              type="submit"
              disabled={submitting}
              style={{
                ...btnBase,
                background: submitting ? '#b8a000' : C.yellow,
                color: '#000', padding: '10px 28px',
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '700',
              }}
            >
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Personal'}
            </button>
          </div>
        }
      >
        <form id="form-personal" onSubmit={handleSubmit}>
          <FormPersonalDetallado
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

export default Personal;
