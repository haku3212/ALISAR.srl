/**
 * Componente Documentos
 * 📄 Gestiona la interfaz de usuario para administrar documentos y permisos
 * Controla permisos forestales (POAT), contratos, certificados, guías, etc.
 * Incluye alertas de vencimiento y funcionalidades CRUD
 * Basado en requerimientos de ALISAR S. (Entrevista al Gerente)
 */

import React, { useState, useMemo } from 'react';
import { FileText, Plus, Edit2, Trash2, Download, AlertCircle } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import FormDocumentosDetallado from './forms/FormDocumentosDetallado';
import SearchBar from './common/SearchBar';
import { generateExcelReport } from '../utils/reportGenerator';

/**
 * Componente Principal de Gestión de Documentos
 * Proporciona interfaz completa para CRUD de documentos con:
 * - Listado de documentos con búsqueda en tiempo real
 * - Filtrado por tipo y estado de vencimiento
 * - Alertas visuales para documentos próximos a vencer
 * - Creación y edición con formulario detallado
 * - Exportación a Excel
 * - Eliminación de registros
 */
const Documentos = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  // Hook CRUD para gestionar documentos
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
    dataService.getDocumentos,
    dataService.createDocumento,
    dataService.updateDocumento,
    dataService.deleteDocumento
  );

  // Estados para controlar el modal, búsqueda y formulario
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  // Estado del formulario con todos los campos expandidos
  const [formData, setFormData] = useState({
    // Sección: Información Básica
    tipo_documento: '',
    numero_documento: '',
    entidad_emisora: '',
    responsable: '',

    // Sección: Fechas y Validez
    fecha_emision: '',
    fecha_vencimiento: '',
    periodo_validez: '',

    // Sección: Asociación
    asociado_rodeo: '',
    asociado_proyecto: '',
    asociado_maquinaria: '',
    asociado_campamento: '',

    // Sección: Documentación
    referencia_archivo: '',
    url_documento: '',
    observaciones: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Obtener tipos únicos para filtros
  const uniqueTypes = useMemo(() => {
    return [...new Set(data.map(d => d.tipo_documento).filter(Boolean))];
  }, [data]);

  // Calcular estado de vencimiento para cada documento
  const getEstadoVencimiento = (fechaVencimiento) => {
    if (!fechaVencimiento) return 'sin_fecha';
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'vencido';
    if (diffDays === 0) return 'vence_hoy';
    if (diffDays < 30) return 'proximo_vencer';
    return 'vigente';
  };

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'tipo_documento',
      label: 'Tipo de Documento',
      type: 'select',
      options: uniqueTypes.map(tipo => ({ label: tipo, value: tipo }))
    },
    {
      id: 'estado_vencimiento',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Vigente', value: 'vigente' },
        { label: 'Próximo a vencer (<30 días)', value: 'proximo_vencer' },
        { label: 'Vence hoy', value: 'vence_hoy' },
        { label: 'Vencido', value: 'vencido' }
      ]
    }
  ], [uniqueTypes]);

  // Filtrado y búsqueda
  const filtered = useMemo(() => {
    let result = data.filter(d =>
      d.numero_documento?.toLowerCase().includes(search.toLowerCase()) ||
      d.tipo_documento?.toLowerCase().includes(search.toLowerCase()) ||
      d.entidad_emisora?.toLowerCase().includes(search.toLowerCase()) ||
      d.responsable?.toLowerCase().includes(search.toLowerCase())
    );

    // Aplicar filtros
    if (filters.tipo_documento) {
      result = result.filter(d => d.tipo_documento === filters.tipo_documento);
    }
    if (filters.estado_vencimiento) {
      result = result.filter(d => getEstadoVencimiento(d.fecha_vencimiento) === filters.estado_vencimiento);
    }

    // Ordenar por fecha de vencimiento (próximos primero)
    result.sort((a, b) => {
      const fechaA = new Date(a.fecha_vencimiento || '9999-12-31');
      const fechaB = new Date(b.fecha_vencimiento || '9999-12-31');
      return fechaA - fechaB;
    });

    return result;
  }, [data, search, filters]);

  /**
   * Valida los campos requeridos del formulario
   */
  const validate = () => {
    const errors = {};
    if (!formData.tipo_documento?.trim()) errors.tipo_documento = 'Tipo de documento requerido';
    if (!formData.numero_documento?.trim()) errors.numero_documento = 'Número requerido';
    if (!formData.entidad_emisora?.trim()) errors.entidad_emisora = 'Entidad emisora requerida';
    if (!formData.fecha_emision?.trim()) errors.fecha_emision = 'Fecha de emisión requerida';
    if (!formData.fecha_vencimiento?.trim()) errors.fecha_vencimiento = 'Fecha de vencimiento requerida';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetFormData = () => {
    setFormData({
      tipo_documento: '',
      numero_documento: '',
      entidad_emisora: '',
      responsable: '',
      fecha_emision: '',
      fecha_vencimiento: '',
      periodo_validez: '',
      asociado_rodeo: '',
      asociado_proyecto: '',
      asociado_maquinaria: '',
      asociado_campamento: '',
      referencia_archivo: '',
      url_documento: '',
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
   * Prepara el formulario para editar un documento existente
   */
  const handleEdit = (documento) => {
    setFormData(documento);
    setEditingId(documento.id);
    setShowModal(true);
  };

  /**
   * Abre el modal para crear un nuevo documento
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

  // Contar alertas críticas
  const documentosCriticos = data.filter(d => {
    const estado = getEstadoVencimiento(d.fecha_vencimiento);
    return estado === 'vencido' || estado === 'vence_hoy' || estado === 'proximo_vencer';
  }).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#fff' }}>Gestión de Documentos y Permisos</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Control de permisos forestales, contratos y certificados</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {documentosCriticos > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              background: '#2a1a1a',
              border: '1px solid #f87171',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <AlertCircle size={16} />
              {documentosCriticos} alerta(s) de vencimiento
            </div>
          )}
          <button onClick={() => generateExcelReport(data, [
            { label: 'Tipo', key: 'tipo_documento' },
            { label: 'Número', key: 'numero_documento' },
            { label: 'Entidad', key: 'entidad_emisora' },
            { label: 'Emisión', key: 'fecha_emision' },
            { label: 'Vencimiento', key: 'fecha_vencimiento' },
            { label: 'Estado', key: 'estado' }
          ], 'Documentos')} title="Exportar a Excel" style={{
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
            <Plus size={18} /> Nuevo Documento
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      <SearchBar
        placeholder="Buscar por número, tipo, entidad o responsable..."
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
          <p>{search ? 'No hay resultados' : 'No hay documentos registrados'}</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111411', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Número</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Entidad</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Vencimiento</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid #1f241f', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const estado = getEstadoVencimiento(d.fecha_vencimiento);
              const estadoColor = {
                vigente: '#4ade80',
                proximo_vencer: '#fbbf24',
                vence_hoy: '#f97316',
                vencido: '#f87171',
                sin_fecha: '#999'
              };
              const estadoTexto = {
                vigente: 'Vigente',
                proximo_vencer: 'Por vencer',
                vence_hoy: 'Vence hoy',
                vencido: 'Vencido',
                sin_fecha: 'Sin fecha'
              };

              return (
                <tr key={d.id}>
                  <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={16} color="#FFD700" /> {d.tipo_documento}
                    </div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>{d.numero_documento}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>{d.entidad_emisora}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                    {d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString() : 'Sin fecha'}
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #1f241f' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: 'transparent',
                      color: estadoColor[estado],
                      fontWeight: '600',
                      border: `1px solid ${estadoColor[estado]}`
                    }}>
                      {estadoTexto[estado]}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #1f241f', display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleEdit(d)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                      <Edit2 size={18} />
                    </button>
                    {isAdmin && (
                      <button onClick={() => deleteItem(d.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Documento' : 'Nuevo Documento'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormDocumentosDetallado
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
            {submitting ? 'Guardando...' : editingId ? 'Actualizar Documento' : 'Crear Documento'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Documentos;
