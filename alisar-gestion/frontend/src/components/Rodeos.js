/**
 * Componente Rodeos
 * 🌳 Gestiona la interfaz de usuario para administrar rodeos (operaciones forestales)
 * Registra: fecha, volumen, especies de madera, origen, destino y responsable del rodeo
 * Incluye funcionalidades CRUD con búsqueda, filtrado y exportación a PDF/Excel
 * Basado en requerimientos de ALISAR S. (Entrevista al Gerente)
 */

import React, { useState, useMemo } from 'react';
import { Trees, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormRodeoDetallado from './forms/FormRodeoDetallado';
import SearchBar from './common/SearchBar';
import { generateRodeoReport, generateExcelReport } from '../utils/reportGenerator';

/**
 * Componente Principal de Gestión de Rodeos
 * Proporciona interfaz completa para CRUD de rodeos con:
 * - Listado de rodeos con búsqueda en tiempo real
 * - Filtrado por estado y especie
 * - Creación y edición con formulario detallado
 * - Exportación a PDF y Excel
 * - Eliminación de registros
 */
const Rodeos = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  // Hook CRUD para gestionar rodeos
  const {
    data,
    loading,
    error,
    editingId,
    setEditingId,
    create,
    update,
    delete: deleteItem
  } = useCRUD(
    dataService.getRodeos,
    dataService.createRodeo,
    dataService.updateRodeo,
    dataService.deleteRodeo
  );

  // Estados para controlar el modal, búsqueda y formulario
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  // Estado del formulario con todos los campos expandidos
  const [formData, setFormData] = useState({
    // Sección: Información del Rodeo
    fecha_rodeo: '',
    volumen_total: '',
    responsable_rodeo: '',
    contrato_asociado: '',

    // Sección: Especies y Origen
    especie_principal: '',
    otras_especies: '',
    procedencia: '',
    ubicacion_origen: '',
    ubicacion_origen_coords: { lat: null, lng: null },

    // Sección: Destino y Logística
    destino_final: '',
    ubicacion_destino: '',
    ubicacion_destino_coords: { lat: null, lng: null },
    fecha_transporte: '',
    estado_operacion: 'En Proceso',

    // Sección: Documentación
    poat_numero: '',
    poat_vencimiento: '',
    otros_permisos: '',
    fecha_limite_permisos: '',
    observaciones: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Obtener estados y especies únicos para filtros
  const uniqueStates = useMemo(() => {
    return [...new Set(data.map(r => r.estado_operacion).filter(Boolean))];
  }, [data]);

  const uniqueSpecies = useMemo(() => {
    return [...new Set(data.map(r => r.especie_principal).filter(Boolean))];
  }, [data]);

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'estado_operacion',
      label: 'Estado',
      type: 'select',
      options: uniqueStates.map(estado => ({ label: estado, value: estado }))
    },
    {
      id: 'especie_principal',
      label: 'Especie',
      type: 'select',
      options: uniqueSpecies.map(especie => ({ label: especie, value: especie }))
    }
  ], [uniqueStates, uniqueSpecies]);

  // Filtrado y búsqueda
  const filtered = useMemo(() => {
    let result = data.filter(r =>
      r.responsable_rodeo?.toLowerCase().includes(search.toLowerCase()) ||
      r.procedencia?.toLowerCase().includes(search.toLowerCase()) ||
      r.destino_final?.toLowerCase().includes(search.toLowerCase()) ||
      r.especie_principal?.toLowerCase().includes(search.toLowerCase())
    );

    // Aplicar filtros
    if (filters.estado_operacion) {
      result = result.filter(r => r.estado_operacion === filters.estado_operacion);
    }
    if (filters.especie_principal) {
      result = result.filter(r => r.especie_principal === filters.especie_principal);
    }

    return result;
  }, [data, search, filters]);

  /**
   * Valida los campos requeridos del formulario
   */
  const validate = () => {
    const errors = {};
    if (!formData.fecha_rodeo?.trim()) errors.fecha_rodeo = 'Fecha requerida';
    if (!formData.volumen_total?.toString().trim()) errors.volumen_total = 'Volumen requerido';
    if (!formData.responsable_rodeo?.trim()) errors.responsable_rodeo = 'Responsable requerido';
    if (!formData.procedencia?.trim()) errors.procedencia = 'Procedencia requerida';
    if (!formData.destino_final?.trim()) errors.destino_final = 'Destino requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetFormData = () => {
    setFormData({
      fecha_rodeo: '',
      volumen_total: '',
      responsable_rodeo: '',
      contrato_asociado: '',
      especie_principal: '',
      otras_especies: '',
      procedencia: '',
      ubicacion_origen: '',
      ubicacion_origen_coords: { lat: null, lng: null },
      destino_final: '',
      ubicacion_destino: '',
      ubicacion_destino_coords: { lat: null, lng: null },
      fecha_transporte: '',
      estado_operacion: 'En Proceso',
      poat_numero: '',
      poat_vencimiento: '',
      otros_permisos: '',
      fecha_limite_permisos: '',
      observaciones: ''
    });
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      resetFormData();
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Prepara el formulario para editar un rodeo existente
   */
  const handleEdit = (rodeo) => {
    setFormData(rodeo);
    setEditingId(rodeo.id);
    setShowModal(true);
  };

  /**
   * Abre el modal para crear un nuevo rodeo
   */
  const handleNew = () => {
    resetFormData();
    setEditingId(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#fff' }}>Gestión de Rodeos Forestales</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Control de operaciones de extracción de madera</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateRodeoReport(data)} title="Generar reporte en PDF" style={{
            background: '#f87171',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <FileText size={16} /> PDF
          </button>
          <button onClick={() => generateExcelReport(data, [
            { label: 'Fecha', key: 'fecha_rodeo' },
            { label: 'Volumen (m³)', key: 'volumen_total' },
            { label: 'Especie', key: 'especie_principal' },
            { label: 'Origen', key: 'procedencia' },
            { label: 'Destino', key: 'destino_final' },
            { label: 'Estado', key: 'estado_operacion' }
          ], 'Rodeos')} title="Exportar a Excel" style={{
            background: '#60a5fa',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <Download size={16} /> Excel
          </button>
          <button onClick={handleNew} style={{
            background: '#FFD700',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <Plus size={18} /> Nuevo Rodeo
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <SearchBar
        placeholder="Buscar por responsable, origen, destino o especie..."
        onSearch={setSearch}
        onFilterChange={setFilters}
        filters={filterConfigs}
      />

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 32px',
          background: '#111411',
          borderRadius: '12px',
          border: '1px solid #1f241f',
          color: '#666'
        }}>
          <p>{search ? 'No hay resultados' : 'No hay rodeos registrados'}</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111411', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Fecha</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Volumen (m³)</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Especie</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Trees size={16} color="#FFD700" /> {new Date(r.fecha_rodeo).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>{r.volumen_total} m³</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>{r.especie_principal}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: r.estado_operacion === 'Completado' ? '#1a221a' : '#221a1a',
                    color: r.estado_operacion === 'Completado' ? '#FFD700' : '#f87171',
                    fontWeight: '600'
                  }}>
                    {r.estado_operacion}
                  </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1f241f', display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEdit(r)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  {isAdmin && (
                    <button onClick={() => deleteItem(r.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Rodeo' : 'Nuevo Rodeo'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormRodeoDetallado
            formData={formData}
            onChange={(updatedData) => setFormData(updatedData)}
            errors={formErrors}
            submitting={submitting}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#FFD700',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              marginTop: '16px',
              fontSize: '14px'
            }}
          >
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Rodeo' : 'Crear Rodeo'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Rodeos;
