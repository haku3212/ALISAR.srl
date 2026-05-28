/**
 * Componente Proyectos
 * Gestiona la interfaz financiera para proyectos de construcción
 * Muestra análisis financiero completo con tabla de presupuestos, gastos y ganancias
 * Incluye CRUD completo y cálculos en tiempo real
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Download, FileText, ChevronDown } from 'lucide-react';
import { dataService } from '../services/api';
import { useCRUD } from '../hooks/useCRUD';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import Modal from './common/Modal';
import ProyectoForm from './forms/ProyectoForm';
import SearchBar from './common/SearchBar';
import ResumenFinanciero from './common/ResumenFinanciero';
import { calcularResumenFinanciero } from '../utils/calculosFinancieros';
import { generateExcelReport } from '../utils/reportGenerator';

/**
 * Componente Principal de Gestión de Proyectos con Análisis Financiero
 */
const Proyectos = () => {
  // Hook CRUD para gestionar proyectos
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
  const [editingProyecto, setEditingProyecto] = useState(null);
  const [maquinaria, setMaquinaria] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Cargar maquinaria y personal disponibles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingData(true);
        const [maqRes, perRes] = await Promise.all([
          dataService.getMaquinaria(),
          dataService.getPersonal()
        ]);
        setMaquinaria(maqRes.data || []);
        setPersonal(perRes.data || []);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoadingData(false);
      }
    };
    cargarDatos();
  }, []);

  // Configuración de filtros avanzados
  const filterConfigs = useMemo(() => [
    {
      id: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Planeado', value: 'planeado' },
        { label: 'En Ejecución', value: 'ejecucion' },
        { label: 'Completado', value: 'completado' },
        { label: 'Suspendido', value: 'suspendido' }
      ]
    },
    {
      id: 'margenMin',
      label: 'Margen Mínimo (%)',
      type: 'range',
      min: -100,
      max: 100
    }
  ], []);

  // Calcular datos financieros para cada proyecto
  const proyectosConFinanzas = useMemo(() => {
    return data.map(proyecto => ({
      ...proyecto,
      finanzas: calcularResumenFinanciero(proyecto)
    }));
  }, [data]);

  // Filtrar proyectos según búsqueda y filtros
  const filtered = useMemo(() => {
    let result = proyectosConFinanzas.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(search.toLowerCase()))
    );

    // Aplicar filtro de estado
    if (filters.estado) {
      result = result.filter(p => p.estado === filters.estado);
    }

    // Aplicar filtro de margen mínimo
    if (filters.margenMin !== undefined && filters.margenMin !== '') {
      result = result.filter(p => p.finanzas.margenGanancia >= parseInt(filters.margenMin));
    }

    return result;
  }, [proyectosConFinanzas, search, filters]);

  // Calcular totales para la fila de resumen
  const totales = useMemo(() => {
    if (filtered.length === 0) return null;

    return {
      presupuestoBruto: filtered.reduce((sum, p) => sum + (p.finanzas.presupuestoBruto || 0), 0),
      impuestos: filtered.reduce((sum, p) => sum + (p.finanzas.impuestos || 0), 0),
      presupuestoNeto: filtered.reduce((sum, p) => sum + (p.finanzas.presupuestoNeto || 0), 0),
      gastoTotal: filtered.reduce((sum, p) => sum + (p.finanzas.gastoTotal || 0), 0),
      gananciaNeta: filtered.reduce((sum, p) => sum + (p.finanzas.gananciaNeta || 0), 0),
      margenGanancia: filtered.length > 0
        ? (filtered.reduce((sum, p) => sum + (p.finanzas.gananciaNeta || 0), 0) /
          filtered.reduce((sum, p) => sum + (p.finanzas.presupuestoBruto || 0), 1)) * 100
        : 0
    };
  }, [filtered]);

  /**
   * Formatea moneda en Bolivianos
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  /**
   * Prepara el formulario para editar un proyecto existente
   */
  const handleEdit = useCallback((proyecto) => {
    setEditingProyecto(proyecto);
    setEditingId(proyecto.id);
    setShowModal(true);
  }, []);

  /**
   * Abre el modal para crear un nuevo proyecto
   */
  const handleNew = useCallback(() => {
    setEditingProyecto({
      nombre: '',
      descripcion: '',
      estado: 'planeado',
      tipo_presupuesto: 'fijo',
      presupuesto_adjudicado: 0,
      presupuesto_bruto: 0,
      presupuesto_neto: 0,
      kilometros_totales: 0,
      duracion_dias: 0,
      fecha_inicio: '',
      fecha_fin: '',
      diesel_litros: 0,
      diesel_precio: 9.8,
      empleados: [],
      gasto_comida: 0,
      dias_comida: 0,
      costo_comida_dia: 0,
      cantidad_maquinas: 0,
      costo_mantenimiento_maquina: 0,
      gasto_otros: 0,
      maquinaria_asignada: [],
      personal_asignado: []
    });
    setEditingId(null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingId(null);
    setEditingProyecto(null);
  }, []);

  /**
   * Maneja el envío del formulario (crear o actualizar)
   */
  const handleFormSubmit = useCallback(async (formData) => {
    try {
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar proyecto:', err);
    }
  }, [editingId, update, create, handleCloseModal]);

  /**
   * Exporta tabla a Excel
   */
  const handleExportExcel = () => {
    const columns = [
      { label: 'Proyecto', key: 'nombre' },
      { label: 'Estado', key: 'estado' },
      { label: 'Presupuesto Bruto', key: 'presupuestoBruto', format: (v) => formatCurrency(v) },
      { label: 'Gastos Totales', key: 'gastoTotal', format: (v) => formatCurrency(v) },
      { label: 'Ganancia Neta', key: 'gananciaNeta', format: (v) => formatCurrency(v) },
      { label: 'Margen (%)', key: 'margenGanancia', format: (v) => `${v.toFixed(1)}%` }
    ];

    const dataForExport = filtered.map(p => ({
      nombre: p.nombre,
      estado: p.estado,
      presupuestoBruto: p.finanzas.presupuestoBruto,
      gastoTotal: p.finanzas.gastoTotal,
      gananciaNeta: p.finanzas.gananciaNeta,
      margenGanancia: p.finanzas.margenGanancia
    }));

    generateExcelReport(dataForExport, columns, 'Proyectos Financiero');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            📊 Proyectos Financiero
          </h1>
          <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>
            Gestión integral de presupuestos, gastos y ganancias por proyecto
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportExcel} title="Exportar a Excel" style={{
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
            fontSize: '14px',
            transition: 'all 0.2s'
          }} onMouseOver={(e) => e.target.style.background = '#3b82f6'}
          onMouseOut={(e) => e.target.style.background = '#60a5fa'}>
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
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseOver={(e) => e.target.style.background = '#ffc700'}
          onMouseOut={(e) => e.target.style.background = '#FFD700'}>
            <Plus size={18} /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => {}} />}

      {/* Search y Filters */}
      <SearchBar
        placeholder="Buscar por nombre o descripción..."
        onSearch={setSearch}
        onFilterChange={setFilters}
        filters={filterConfigs}
      />

      {/* Tabla de Proyectos */}
      <div style={{
        background: '#111411',
        borderRadius: '12px',
        border: '1px solid #1f241f',
        overflow: 'hidden',
        marginTop: '24px'
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            color: '#666'
          }}>
            <p>{search || Object.keys(filters).length > 0
              ? 'No hay proyectos que coincidan con los filtros'
              : 'No hay proyectos registrados'}</p>
          </div>
        ) : (
          <>
            {/* Tabla */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#1f241f', borderBottom: '2px solid #FFD700' }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      minWidth: '200px'
                    }}>Proyecto</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      minWidth: '100px'
                    }}>Estado</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'right',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      minWidth: '150px'
                    }}>Presupuesto Bruto</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'right',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      minWidth: '150px'
                    }}>Gastos Totales</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'right',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      minWidth: '150px'
                    }}>Ganancia Neta</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      minWidth: '100px'
                    }}>Margen (%)</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      minWidth: '80px'
                    }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((proyecto, idx) => {
                    const finanzas = proyecto.finanzas;
                    const esGananciaNegativa = finanzas.gananciaNeta < 0;

                    return (
                      <tr key={proyecto.id} style={{
                        borderBottom: '1px solid #1f241f',
                        background: idx % 2 === 0 ? '#111411' : '#0f120f',
                        transition: 'background 0.2s'
                      }} onMouseOver={(e) => e.currentTarget.style.background = '#1f241f'}
                      onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#111411' : '#0f120f'}>
                        {/* Nombre del Proyecto */}
                        <td style={{
                          padding: '16px',
                          color: '#FFD700',
                          fontWeight: '600'
                        }}>{proyecto.nombre}</td>

                        {/* Estado */}
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: proyecto.estado === 'ejecucion' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                            color: proyecto.estado === 'ejecucion' ? '#60a5fa' : '#999'
                          }}>
                            {proyecto.estado || 'Sin estado'}
                          </span>
                        </td>

                        {/* Presupuesto Bruto */}
                        <td style={{
                          padding: '16px',
                          textAlign: 'right',
                          color: '#e0e0e0',
                          fontVariantNumeric: 'tabular-nums'
                        }}>{formatCurrency(finanzas.presupuestoBruto)}</td>

                        {/* Gastos Totales */}
                        <td style={{
                          padding: '16px',
                          textAlign: 'right',
                          color: '#f87171',
                          fontVariantNumeric: 'tabular-nums'
                        }}>{formatCurrency(finanzas.gastoTotal)}</td>

                        {/* Ganancia Neta */}
                        <td style={{
                          padding: '16px',
                          textAlign: 'right',
                          color: esGananciaNegativa ? '#f87171' : '#4ade80',
                          fontWeight: '600',
                          fontVariantNumeric: 'tabular-nums'
                        }}>{formatCurrency(finanzas.gananciaNeta)}</td>

                        {/* Margen */}
                        <td style={{
                          padding: '16px',
                          textAlign: 'center',
                          color: esGananciaNegativa ? '#f87171' : '#4ade80',
                          fontWeight: '600'
                        }}>{finanzas.margenGanancia.toFixed(1)}%</td>

                        {/* Acciones */}
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEdit(proyecto)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#60a5fa',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#60a5fa'}
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar proyecto "${proyecto.nombre}"?`)) {
                                  deleteItem(proyecto.id);
                                }
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f87171',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#f87171'}
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fila de Totales */}
            {totales && (
              <div style={{
                background: '#1f241f',
                borderTop: '2px solid #FFD700',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '200px 100px 150px 150px 150px 100px 80px',
                gap: '16px',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ color: '#FFD700', fontWeight: 'bold', margin: 0 }}>TOTALES</p>
                </div>
                <div />
                <div style={{ textAlign: 'right', color: '#FFD700', fontWeight: 'bold' }}>
                  {formatCurrency(totales.presupuestoBruto)}
                </div>
                <div style={{ textAlign: 'right', color: '#f87171', fontWeight: 'bold' }}>
                  {formatCurrency(totales.gastoTotal)}
                </div>
                <div style={{ textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>
                  {formatCurrency(totales.gananciaNeta)}
                </div>
                <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: 'bold' }}>
                  {totales.margenGanancia.toFixed(1)}%
                </div>
                <div />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal con Formulario y ResumenFinanciero */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? `Editar: ${editingProyecto?.nombre}` : 'Nuevo Proyecto'}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Formulario a la izquierda */}
          <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
            <ProyectoForm
              proyecto={editingProyecto}
              maquinaria={maquinaria}
              personal={personal}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </div>
          {/* ResumenFinanciero a la derecha */}
          <div style={{ position: 'sticky', top: 0 }}>
            <ResumenFinanciero proyecto={editingProyecto || {}} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Proyectos;
