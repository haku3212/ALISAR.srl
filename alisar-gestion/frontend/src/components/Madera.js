/**
 * Componente Madera
 * Gestiona la interfaz de usuario para administrar inventario de madera/rodeos
 * Incluye funcionalidades CRUD con búsqueda, filtrado por especie y campamento,
 * y exportación a PDF/Excel con formulario detallado
 */

import React, { useState, useMemo } from 'react';
import { Trees, Plus, Edit2, Trash2, Download, FileText } from 'lucide-react';
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
    if (!formData.especie.trim()) errors.especie = 'Especie requerida';
    if (!formData.volumen.toString().trim()) errors.volumen = 'Volumen requerido';
    if (!formData.cantidad || formData.cantidad < 1) errors.cantidad = 'Cantidad debe ser mayor a 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetFormData = () => {
    setFormData({
      especie: '', nombre_comun: '', nombre_cientifico: '', procedencia: '', destino: '', tipo_corte: '',
      largo: '', ancho: '', espesor: '', volumen: '', cantidad: '', peso_estimado: '',
      grado_calidad: '', estado_conservacion: '', humedad: '', defectos: '',
      campamento: '', ubicacion_exacta: '', fecha_recepcion: '', fecha_aserrado: '',
      precio_unitario: '', valor_total: '', notas: ''
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
   * Prepara el formulario para editar un registro de madera existente
   */
  const handleEdit = (madera) => {
    setFormData(madera);
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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#fff' }}>Control de Rodeos / Madera</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Gestión de volúmenes y especies</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => generateMaderaReport(data)} title="Generar reporte en PDF" style={{
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
            { label: 'Especie', key: 'especie' },
            { label: 'Piezas', key: 'piezas' },
            { label: 'Volumen', key: 'volumen' },
            { label: 'Campamento', key: 'campamento' }
          ], 'Madera')} title="Exportar a Excel" style={{
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
            background: '#4ade80',
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
        placeholder="Buscar por especie, volumen o campamento..."
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(m => (
            <div key={m.id} style={{
              background: '#111411',
              border: '1px solid #1f241f',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div style={{ background: '#1a221a', padding: '8px', borderRadius: '50%' }}>
                    <Trees size={18} color="#4ade80" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#e0e0e0' }}>{m.especie}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>ID: {m.id}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(m)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteItem(m.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #1f241f' }}>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>PIEZAS</p>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{m.piezas}</p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>VOLUMEN</p>
                  <p style={{ color: '#4ade80', fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{m.volumen}</p>
                </div>
              </div>

              <div>
                <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>CAMPAMENTO</p>
                <p style={{ color: '#e0e0e0', fontSize: '14px', margin: '4px 0 0 0' }}>{m.campamento}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Rodeo' : 'Nuevo Rodeo'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Usar el formulario detallado con todas las secciones expandibles */}
          <FormMaderaDetallado
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
              background: '#4ade80',
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

export default Madera;
