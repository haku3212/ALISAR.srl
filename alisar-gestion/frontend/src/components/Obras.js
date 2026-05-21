/**
 * Componente Obras
 * Gestiona la interfaz de usuario para administrar obras/proyectos
 * Incluye funcionalidades CRUD, visualización de progreso, filtrado y exportación
 */

import React, { useState, useMemo } from 'react';
import { HardHat, MapPin, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormObrasDetallado from './forms/FormObrasDetallado';
import SearchBar from './common/SearchBar';
import { generateObrasReport, generateExcelReport } from '../utils/reportGenerator';

/**
 * Componente Principal de Gestión de Obras
 */
const Obras = () => {
  // Hook CRUD para gestionar obras
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getObras,
    dataService.createObra,
    dataService.updateObra,
    dataService.deleteObra
  );

  // Estados para controlar el modal, búsqueda y formulario
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  // Estado del formulario con todos los campos expandidos
  const [formData, setFormData] = useState({
    // Sección: Información General
    nombre: '',
    codigo: '',
    descripcion: '',
    tipo: '',
    cliente: '',

    // Sección: Ubicación y Fases
    provincia: '',
    municipio: '',
    localidad: '',
    direccion_exacta: '',
    fase_actual: '',
    avance: 0,

    // Sección: Personal y Responsables
    responsable_tecnico: '',
    supervisor: '',
    contratista: '',
    personal_asignado: '',

    // Sección: Presupuesto y Cronograma
    presupuesto: '',
    monto_ejecutado: '',
    inicio_planeado: '',
    fin_planeado: '',
    inicio_real: '',
    fin_real: '',
    observaciones: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'avance',
      label: 'Avance Mínimo',
      type: 'range',
      min: 0,
      max: 100
    }
  ], []);

  const filtered = useMemo(() => {
    let result = data.filter(o =>
      o.nombre.toLowerCase().includes(search.toLowerCase()) ||
      o.presupuesto.toLowerCase().includes(search.toLowerCase())
    );

    // Aplicar filtro de avance
    if (filters.avance) {
      result = result.filter(o => o.avance >= parseInt(filters.avance));
    }

    return result;
  }, [data, search, filters]);

  /**
   * Valida los campos requeridos del formulario
   */
  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.presupuesto.toString().trim()) errors.presupuesto = 'Presupuesto requerido';
    if (formData.avance === '' || formData.avance < 0 || formData.avance > 100) errors.avance = 'Avance debe ser 0-100';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetFormData = () => {
    setFormData({
      nombre: '', codigo: '', descripcion: '', tipo: '', cliente: '',
      provincia: '', municipio: '', localidad: '', direccion_exacta: '',
      fase_actual: '', avance: 0,
      responsable_tecnico: '', supervisor: '', contratista: '', personal_asignado: '',
      presupuesto: '', monto_ejecutado: '', inicio_planeado: '', fin_planeado: '',
      inicio_real: '', fin_real: '', observaciones: ''
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
   * Prepara el formulario para editar una obra existente
   */
  const handleEdit = (obra) => {
    setFormData(obra);
    setEditingId(obra.id);
    setShowModal(true);
  };

  /**
   * Abre el modal para crear una nueva obra
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
          <h1 style={{ color: '#fff', margin: 0 }}>Control de Obras</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Seguimiento de ejecución y presupuestos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateObrasReport(data)} title="Generar reporte en PDF" style={{
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
            { label: 'Nombre', key: 'nombre' },
            { label: 'Presupuesto', key: 'presupuesto' },
            { label: 'Avance', key: 'avance' }
          ], 'Obras')} title="Exportar a Excel" style={{
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
            <Plus size={18} /> Nueva Obra
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <SearchBar
        placeholder="Buscar por nombre o presupuesto..."
        onSearch={setSearch}
        onFilterChange={setFilters}
        filters={filterConfigs}
      />

      <div style={{ display: 'grid', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: '#111411',
            borderRadius: '12px',
            border: '1px solid #1f241f',
            color: '#666'
          }}>
            <p>{search ? 'No hay resultados' : 'No hay obras registradas'}</p>
          </div>
        ) : (
          filtered.map(obra => (
            <div key={obra.id} style={{
              background: '#111411',
              border: '1px solid #1f241f',
              borderRadius: '12px',
              padding: '24px',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#FFD700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HardHat size={18} /> {obra.nombre}
                  </h3>
                  <p style={{ color: '#666', fontSize: '12px', margin: '8px 0 0 0' }}>
                    <MapPin size={12} style={{ display: 'inline' }} /> Beni, Bolivia
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(obra)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteItem(obra.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>PRESUPUESTO</p>
                  <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                    {obra.presupuesto}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>AVANCE</p>
                  <p style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                    {obra.avance}%
                  </p>
                </div>
              </div>

              <div style={{ background: '#1f241f', height: '8px', borderRadius: '4px' }}>
                <div style={{
                  background: '#FFD700',
                  width: obra.avance + '%',
                  height: '100%',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Obra' : 'Nueva Obra'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Usar el formulario detallado con todas las secciones expandibles */}
          <FormObrasDetallado
            formData={formData}
            onChange={(updatedData) => setFormData(updatedData)}
            errors={formErrors}
            submitting={submitting}
          />

          {/* Botón de envío */}
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
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Obra' : 'Crear Obra'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Obras;