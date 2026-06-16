/**
 * Componente Personal
 * Gestiona la interfaz de usuario para administrar personal operativo
 * Incluye funcionalidades CRUD (Crear, Leer, Actualizar, Eliminar) con búsqueda,
 * filtrado, y exportación a PDF/Excel con formulario detallado
 */

import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Phone, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { validateCedula, validateEmail, validatePhone } from '../utils/validators';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormPersonalDetallado from './forms/FormPersonalDetallado';
import SearchBar from './common/SearchBar';
import { generatePersonalReport, generateExcelReport } from '../utils/reportGenerator';

/**
 * Componente Principal de Gestión de Personal
 * Proporciona interfaz completa para CRUD de personal con:
 * - Listado de personal con búsqueda en tiempo real
 * - Filtrado por cargo
 * - Creación y edición con formulario detallado
 * - Exportación a PDF y Excel
 * - Eliminación de registros
 */
const Personal = () => {
  // Hook personalizado que maneja toda la lógica CRUD
  // Proporciona: data (lista), loading, error, métodos (create, update, delete)
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem, refresh } = useCRUD(
    dataService.getPersonal,
    dataService.createPersonal,
    dataService.updatePersonal,
    dataService.deletePersonal
  );

  // Estados para controlar el modal, búsqueda y formulario
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  // Estado del formulario con todos los campos expandidos
  const [formData, setFormData] = useState({
    // Sección: Información Básica
    nombre: '',
    cedula: '',
    email: '',
    celular: '',
    fecha_nacimiento: '',
    genero: '',

    // Sección: Información Laboral
    cargo: '',
    departamento: '',
    fecha_ingreso: '',
    salario: '',
    tipo_contrato: '',
    estado: 'Activo',

    // Sección: Contacto de Emergencia
    contacto_emergencia_nombre: '',
    contacto_emergencia_tel: '',
    contacto_emergencia_relacion: '',

    // Sección: Información Adicional
    direccion: '',
    notas: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Obtener cargos únicos para filtros
  const uniqueCargos = useMemo(() => {
    return [...new Set(data.map(p => p.cargo))];
  }, [data]);

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'cargo',
      label: 'Cargo',
      type: 'select',
      options: uniqueCargos.map(cargo => ({ label: cargo, value: cargo }))
    }
  ], [uniqueCargos]);

  const filtered = useMemo(() => {
    let result = data.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo.toLowerCase().includes(search.toLowerCase()) ||
      p.celular.includes(search)
    );

    // Aplicar filtro de cargo
    if (filters.cargo) {
      result = result.filter(p => p.cargo === filters.cargo);
    }

    return result;
  }, [data, search, filters]);

  /**
   * Valida los campos requeridos del formulario
   * Verifica que nombre y cargo sean proporcionados
   * @returns {boolean} true si el formulario es válido, false si hay errores
   */
  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.cargo.trim()) errors.cargo = 'Cargo requerido';
    if (formData.cedula && !validateCedula(formData.cedula)) {
      errors.cedula = 'Cédula debe tener 10 dígitos';
    }
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Email no tiene un formato válido';
    }
    if (formData.celular && !validatePhone(formData.celular)) {
      errors.celular = 'Teléfono debe tener 7–12 dígitos';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   * Valida los datos, luego crea o actualiza el personal según sea necesario
   * @param {Event} e - Evento del formulario
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
      // Resetear el formulario a su estado vacío inicial
      resetFormData();
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Resetea el formulario a su estado inicial con todos los campos vacíos
   */
  const resetFormData = () => {
    setFormData({
      nombre: '', cedula: '', email: '', celular: '', fecha_nacimiento: '', genero: '',
      cargo: '', departamento: '', fecha_ingreso: '', salario: '', tipo_contrato: '',
      estado: 'Activo', contacto_emergencia_nombre: '', contacto_emergencia_tel: '',
      contacto_emergencia_relacion: '', direccion: '', notas: ''
    });
  };

  /**
   * Prepara el formulario para editar un personal existente
   * Carga todos los datos del personal seleccionado en el formulario
   * @param {Object} person - Objeto personal a editar
   */
  const handleEdit = (person) => {
    setFormData(person);
    setEditingId(person.id);
    setShowModal(true);
  };

  /**
   * Abre el modal para crear un nuevo personal
   * Resetea el formulario y limpia los errores
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
    setFormData({ nombre: '', cargo: '', celular: '' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0 }}>Recursos Humanos</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Gestión de personal operativo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generatePersonalReport(data)} title="Generar reporte en PDF" style={{
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
            { label: 'Cargo', key: 'cargo' },
            { label: 'Celular', key: 'celular' }
          ], 'Personal')} title="Exportar a Excel" style={{
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
            <UserPlus size={18} /> Nuevo
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

      <div>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: '#111411',
            borderRadius: '12px',
            border: '1px solid #1f241f',
            color: '#666'
          }}>
            <p>{search ? 'No hay resultados' : 'No hay personal registrado'}</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} style={{
              background: '#111411',
              border: '1px solid #1f241f',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{ background: '#1a221a', padding: '10px', borderRadius: '50%' }}>
                  <Users size={20} color="#FFD700" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#e0e0e0' }}>{p.nombre}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>{p.cargo}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} /> {p.celular}
                </p>
                <button onClick={() => handleEdit(p)} style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer'
                }}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => deleteItem(p.id)} style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer'
                }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Personal' : 'Nuevo Personal'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Usar el formulario detallado con todas las secciones expandibles */}
          <FormPersonalDetallado
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
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Personal' : 'Crear Personal'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Personal;