/**
 * Componente Madera
 * Gestiona la interfaz de usuario para administrar inventario de madera/rodeos
 * Incluye funcionalidades CRUD con búsqueda, filtrado por especie y campamento,
 * y exportación a PDF/Excel con formulario detallado
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Trees, Plus, Pencil, Trash2, Download, FileText, AlertTriangle, MapPin, User, Package } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormMaderaDetallado from './forms/FormMaderaDetallado';
import SearchBar from './common/SearchBar';
import { generateMaderaReport, generateExcelReport } from '../utils/reportGenerator';

/**
 * Componente Principal de Gestión de Madera
 */
const Madera = () => {
  // Hook CRUD para gestionar madera
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getMadera,
    dataService.createMadera,
    dataService.updateMadera,
    dataService.deleteMadera
  );

  // Estados para controlar el modal, búsqueda y formulario
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  // Estado del formulario con todos los campos expandidos
  const [formData, setFormData] = useState({
    // Sección: Información de Especie
    especie: '',
    nombre_comun: '',
    nombre_cientifico: '',
    procedencia: '',
    destino: '',
    tipo_corte: '',

    // Sección: Dimensiones y Medidas
    largo: '',
    ancho: '',
    espesor: '',
    volumen: '',
    cantidad: '',
    peso_estimado: '',

    // Sección: Calidad y Condición
    grado_calidad: '',
    estado_conservacion: '',
    humedad: '',
    defectos: '',

    // Sección: Ubicación y Logística
    campamento: '',
    ubicacion_exacta: '',
    fecha_recepcion: '',
    fecha_aserrado: '',
    precio_unitario: '',
    valor_total: '',
    notas: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [personalList, setPersonalList] = useState([]);
  const [selectedPersonal, setSelectedPersonal] = useState([]);

  useEffect(() => {
    dataService.getPersonal().then(res => setPersonalList(res.data || [])).catch(() => {});
  }, []);

  // Obtener especies y campamentos únicos para filtros
  const uniqueEspecies = useMemo(() => {
    return [...new Set(data.map(m => m.especie).filter(Boolean))];
  }, [data]);

  const uniqueCampamentos = useMemo(() => {
    return [...new Set(data.map(m => m.campamento).filter(Boolean))];
  }, [data]);

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'especie',
      label: 'Especie',
      type: 'select',
      options: uniqueEspecies.map(especie => ({ label: especie, value: especie }))
    },
    {
      id: 'campamento',
      label: 'Campamento',
      type: 'select',
      options: uniqueCampamentos.map(campamento => ({ label: campamento, value: campamento }))
    }
  ], [uniqueEspecies, uniqueCampamentos]);

  const filtered = useMemo(() => {
    let result = data.filter(m =>
      m.especie.toLowerCase().includes(search.toLowerCase()) ||
      m.campamento.toLowerCase().includes(search.toLowerCase()) ||
      m.volumen.toLowerCase().includes(search.toLowerCase())
    );

    // Aplicar filtros
    if (filters.especie) {
      result = result.filter(m => m.especie === filters.especie);
    }
    if (filters.campamento) {
      result = result.filter(m => m.campamento === filters.campamento);
    }

    return result;
  }, [data, search, filters]);

  /**
   * Valida los campos requeridos del formulario
   */
  const validate = () => {
    const errors = {};
    if (!formData.nombre?.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.contratante?.trim()) errors.contratante = 'Contratante requerido';
    if (!formData.permiso_forestal?.trim()) errors.permiso_forestal = 'Permiso forestal requerido';
    if (!formData.ing_forestal?.trim()) errors.ing_forestal = 'Ingeniero forestal requerido';
    if (!formData.especie) errors.especie = 'Especie requerida';
    if (!formData.volumen) errors.volumen = 'Volumen requerido';
    if (!formData.num_piezas) errors.num_piezas = 'N° de piezas requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetFormData = () => {
    setFormData({
      nombre: '', contratante: '', segunda_parte: '', estado_contrato: '',
      permiso_forestal: '', fecha_vencimiento_permiso: '', fecha_recepcion: '',
      ing_forestal: '', jefe_campamento: '', campamento: '', personal_asignado: '',
      maquinaria_asignada: '', obs_campamento: '',
      zona_extraccion: '', punto_medio: '', fecha_inicio_tumba: '',
      fecha_llegada_punto_medio: '', obs_extraccion: '',
      especie: '', nombre_comun: '', grado_calidad: '', tipo_corte: '',
      volumen: '', num_piezas: '', nombre_cientifico: '', obs_clasificacion: '',
      aserradero_destino: '', fecha_entrega_aserradero: '', precio_unitario: '',
      precio_venta: '', responsable_recepcion: '', obs_entrega: '',
    });
    setSelectedPersonal([]);
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      let ok;
      const payload = { ...formData, personal_ids: selectedPersonal };
      if (editingId) {
        ok = await update(editingId, payload);
      } else {
        ok = await create(payload);
      }
      if (ok) {
        resetFormData();
        setShowModal(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Prepara el formulario para editar un registro de madera existente
   */
  const handleEdit = (madera) => {
    setFormData(madera);
    setSelectedPersonal(madera.personal_ids || []);
    setEditingId(madera.id);
    setShowModal(true);
  };

  /**
   * Abre el modal para crear un nuevo registro de madera
   */
  const handleNew = () => {
    resetFormData();
    setEditingId(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleClose = () => { setShowModal(false); setEditingId(null); };
  const confirmItem = data.find(m => m.id === confirmId);

  const C = {
    bg: '#080a08', surface: '#0f110f', card: '#131513', border: '#1c221c',
    border2: '#232a23', yellow: '#FFD700', blue: '#60a5fa', green: '#34d399',
    orange: '#f97316', red: '#f87171', text: '#e2e8e2', muted: '#6b7a6b',
  };

  const btnBase = {
    border: 'none', borderRadius: '8px', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '6px',
    cursor: 'pointer', fontSize: '13px', padding: '9px 16px',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', -apple-system, sans-serif", color: C.text, minHeight: '100%', background: C.bg }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>Control Forestal</h1>
          <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Rodeos y extracción de madera — {data.length} registros</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => generateMaderaReport(data)} style={{ ...btnBase, background: C.card, color: C.text, border: `1px solid ${C.border2}` }}>
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Nombre', key: 'nombre' }, { label: 'Especie', key: 'especie' },
            { label: 'Volumen', key: 'volumen' }, { label: 'Campamento', key: 'campamento' },
          ], 'Madera')} style={{ ...btnBase, background: C.card, color: C.blue, border: `1px solid ${C.border2}` }}>
            <Download size={14} /> Excel
          </button>
          <button onClick={handleNew} style={{ ...btnBase, background: C.yellow, color: '#000', padding: '9px 20px' }}>
            <Plus size={16} /> Nuevo Rodeo
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <SearchBar
        placeholder="Buscar por especie, campamento o contratante..."
        onSearch={setSearch}
        onFilterChange={setFilters}
        filters={filterConfigs}
      />

      {/* ── Lista ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 32px',
          background: C.card, borderRadius: '12px', border: `1px solid ${C.border}`, color: C.muted,
        }}>
          <Trees size={40} color={C.border2} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>{search ? 'No hay resultados para tu búsqueda' : 'Aún no hay rodeos registrados'}</p>
          {!search && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: C.border2 }}>Presiona "Nuevo Rodeo" para comenzar</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(m => {
            const estadoColors = {
              en_curso:  { bg: 'rgba(52,211,153,0.12)', color: C.green, label: 'En Curso' },
              entregado: { bg: 'rgba(96,165,250,0.12)', color: C.blue,  label: 'Entregado' },
              pausado:   { bg: 'rgba(249,115,22,0.12)', color: C.orange, label: 'Pausado' },
              cancelado: { bg: 'rgba(248,113,113,0.12)',color: C.red,   label: 'Cancelado' },
            };
            const est = estadoColors[m.estado_contrato] || { bg: 'rgba(107,122,107,0.12)', color: C.muted, label: m.estado_contrato || '—' };
            return (
              <div key={m.id} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${C.green}`,
                borderRadius: '12px', padding: '18px 22px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  }}>
                    🌳
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                      <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                        {m.nombre || m.especie || `Rodeo #${m.id}`}
                      </span>
                      <span style={{
                        background: est.bg, color: est.color,
                        padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      }}>{est.label}</span>
                      {m.especie && m.nombre && (
                        <span style={{ color: C.muted, fontSize: '11px', background: C.surface, padding: '2px 6px', borderRadius: '4px' }}>{m.especie}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      {m.contratante && (
                        <span style={{ color: C.muted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={11} /> {m.contratante}
                        </span>
                      )}
                      {m.campamento && (
                        <span style={{ color: C.muted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} /> {m.campamento}
                        </span>
                      )}
                      {m.ing_forestal && (
                        <span style={{ color: C.muted, fontSize: '12px' }}>Ing: {m.ing_forestal}</span>
                      )}
                    </div>
                  </div>

                  {/* Métricas */}
                  <div style={{ display: 'flex', gap: '20px', flexShrink: 0, alignItems: 'flex-start' }}>
                    {m.volumen && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px' }}>VOLUMEN</p>
                        <p style={{ margin: '2px 0 0 0', color: C.yellow, fontSize: '15px', fontWeight: '800' }}>{m.volumen} m³</p>
                      </div>
                    )}
                    {m.num_piezas && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: C.muted, fontSize: '10px', fontWeight: '600', letterSpacing: '0.8px' }}>PIEZAS</p>
                        <p style={{ margin: '2px 0 0 0', color: C.text, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Package size={12} color={C.muted} /> {m.num_piezas}
                        </p>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px' }}>
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
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color={C.red} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '15px' }}>¿Eliminar rodeo?</p>
                <p style={{ margin: '2px 0 0 0', color: C.muted, fontSize: '12px' }}>Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p style={{ color: C.text, fontSize: '13px', margin: '0 0 20px 0' }}>
              Se eliminará <strong style={{ color: '#fff' }}>{confirmItem.nombre || confirmItem.especie || `Rodeo #${confirmItem.id}`}</strong> permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmId(null)} style={{ ...btnBase, background: C.surface, color: C.text, border: `1px solid ${C.border2}` }}>Cancelar</button>
              <button onClick={() => { deleteItem(confirmId); setConfirmId(null); }} style={{ ...btnBase, background: C.red, color: '#fff' }}>
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        mode={editingId ? 'edit' : 'create'}
        title={editingId ? 'Editar Rodeo' : 'Nuevo Rodeo'}
        subtitle={editingId ? `Modificando: ${formData.nombre || formData.especie || ''}` : 'Registra un nuevo trabajo de extracción forestal'}
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={handleClose} style={{ ...btnBase, background: C.surface, color: C.text, border: `1px solid ${C.border2}` }}>
              Cancelar
            </button>
            <button
              form="form-madera"
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
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Rodeo'}
            </button>
          </div>
        }
      >
        <form id="form-madera" onSubmit={handleSubmit}>
          <FormMaderaDetallado
            formData={formData}
            onChange={setFormData}
            errors={formErrors}
            submitting={submitting}
            personalList={personalList}
            selectedPersonal={selectedPersonal}
            onPersonalChange={setSelectedPersonal}
          />
        </form>
      </Modal>
    </div>
  );
};

export default Madera;
