/**
 * Componente Maquinaria
 * Gestiona la interfaz de usuario para administrar maquinaria y equipos
 * Incluye funcionalidades CRUD con búsqueda, filtrado por tipo y estado,
 * y exportación a PDF/Excel con formulario detallado
 */

import React, { useState, useMemo } from 'react';
import { Drill, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormMaquinariaDetallado from './forms/FormMaquinariaDetallado';
import SearchBar from './common/SearchBar';
import { generateMaquinariaReport, generateExcelReport } from '../utils/reportGenerator';

/**
 * Componente Principal de Gestión de Maquinaria
 */
const Maquinaria = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  // Hook CRUD para gestionar maquinaria
  const { data, loading, error, editingId, setEditingId, create, update, delete: deleteItem } = useCRUD(
    dataService.getMaquinaria,
    dataService.createMaquinaria,
    dataService.updateMaquinaria,
    dataService.deleteMaquinaria
  );

  // Estados para controlar el modal, búsqueda y formulario
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  // Estado del formulario con todos los campos expandidos
  const [formData, setFormData] = useState({
    // Sección: Información Básica
    nombre: '',
    tipo: '',
    modelo: '',
    anio: '',
    numero_serie: '',
    placa: '',

    // Sección: Especificaciones Técnicas
    potencia: '',
    capacidad_carga: '',
    consumo_combustible: '',
    tipo_combustible: '',
    ancho_trabajo: '',
    profundidad_maxima: '',

    // Sección: Operación y Mantenimiento
    estado: 'Operativo',
    horas_operacion: '',
    mantenimiento_proximo: '',
    ultimaRevision: '',
    operador_asignado: '',
    costo_mantenimiento_anual: '',

    // Sección: Documentación
    numero_garantia: '',
    fecha_vencimiento_garantia: '',
    documento_adquisicion: '',
    notas: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Obtener tipos y estados únicos para filtros
  const uniqueTypes = useMemo(() => {
    return [...new Set(data.map(m => m.tipo).filter(Boolean))];
  }, [data]);

  const uniqueStates = useMemo(() => {
    return [...new Set(data.map(m => m.estado).filter(Boolean))];
  }, [data]);

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'tipo',
      label: 'Tipo',
      type: 'select',
      options: uniqueTypes.map(tipo => ({ label: tipo, value: tipo }))
    },
    {
      id: 'estado',
      label: 'Estado',
      type: 'select',
      options: uniqueStates.map(estado => ({ label: estado, value: estado }))
    }
  ], [uniqueTypes, uniqueStates]);

  const filtered = useMemo(() => {
    let result = data.filter(m =>
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.tipo.toLowerCase().includes(search.toLowerCase()) ||
      m.estado.toLowerCase().includes(search.toLowerCase())
    );

    // Aplicar filtros
    if (filters.tipo) {
      result = result.filter(m => m.tipo === filters.tipo);
    }
    if (filters.estado) {
      result = result.filter(m => m.estado === filters.estado);
    }

    return result;
  }, [data, search, filters]);

  /**
   * Valida los campos requeridos del formulario
   */
  const validate = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.tipo.trim()) errors.tipo = 'Tipo requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetFormData = () => {
    setFormData({
      nombre: '', tipo: '', modelo: '', anio: '', numero_serie: '', placa: '',
      potencia: '', capacidad_carga: '', consumo_combustible: '', tipo_combustible: '',
      ancho_trabajo: '', profundidad_maxima: '',
      estado: 'Operativo', horas_operacion: '', mantenimiento_proximo: '', ultimaRevision: '',
      operador_asignado: '', costo_mantenimiento_anual: '',
      numero_garantia: '', fecha_vencimiento_garantia: '', documento_adquisicion: '', notas: ''
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
   * Prepara el formulario para editar una máquina existente
   */
  const handleEdit = (maquina) => {
    setFormData(maquina);
    setEditingId(maquina.id);
    setShowModal(true);
  };

  /**
   * Abre el modal para crear una nueva máquina
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
          <h1 style={{ margin: 0, color: '#fff' }}>Gestión de Maquinaria</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Control de activos de la planta</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateMaquinariaReport(data)} title="Generar reporte en PDF" style={{
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
            { label: 'Tipo', key: 'tipo' },
            { label: 'Estado', key: 'estado' },
            { label: 'Última Revisión', key: 'ultimaRevision' }
          ], 'Maquinaria')} title="Exportar a Excel" style={{
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
            <Plus size={18} /> Nuevo Equipo
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

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 32px',
          background: '#111411',
          borderRadius: '12px',
          border: '1px solid #1f241f',
          color: '#666'
        }}>
          <p>{search ? 'No hay resultados' : 'No hay maquinaria registrada'}</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111411', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Equipo</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Drill size={16} color="#FFD700" /> {m.nombre}
                  </div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>{m.tipo}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: m.estado === 'Operativo' ? '#1a221a' : '#221a1a',
                    color: m.estado === 'Operativo' ? '#FFD700' : '#f87171',
                    fontWeight: '600'
                  }}>
                    {m.estado}
                  </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #1f241f', display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEdit(m)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  {isAdmin && (
                    <button onClick={() => deleteItem(m.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Maquinaria' : 'Nuevo Equipo'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Usar el formulario detallado con todas las secciones expandibles */}
          <FormMaquinariaDetallado
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
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Maquinaria' : 'Crear Maquinaria'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Maquinaria;