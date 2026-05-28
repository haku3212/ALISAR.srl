/**
 * ProyectoForm Component - VERSIÓN CORREGIDA
 *
 * Formulario para crear/editar proyectos con análisis financiero.
 * Calcula automáticamente:
 * - duracion_dias: a partir de fecha_inicio y fecha_fin
 * - gasto_personal: salario_diario × duracion_dias para cada personal asignado
 *
 * IMPORTANTE: El cálculo de gasto_personal se hace:
 * 1. Cuando se asigna/desasigna personal (handleTogglePersonal)
 * 2. Cuando cambian los días y hay personal asignado (handleInputChange)
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import InputGroup from './InputGroup';

const ProyectoForm = memo(({ proyecto, maquinaria = [], personal = [], onSubmit = () => {}, onCancel = () => {} }) => {
  // ==================== STATE ====================
  // Estado principal del formulario con todos los datos del proyecto
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    kilometros_totales: 0,
    duracion_dias: 0,
    estado: 'planeado',
    tipo_presupuesto: 'fijo',
    presupuesto_adjudicado: 0,
    tarifa_km: 23000,
    diesel_litros: 0,
    diesel_precio: 9.8,
    gasto_comida: 0,
    dias_comida: 0,
    costo_comida_dia: 400,
    cantidad_maquinas: 0,
    costo_mantenimiento_maquina: 1200,
    gasto_otros: 0,
    // ⚠️ NOTA: gasto_personal se calcula automáticamente, NO se edita manualmente
    gasto_personal: 0,
    // ⚠️ NOTA: empleados[] es para costos personalizados, NO para personal del sistema
    empleados: [
      { nombre: 'Operarios', cantidad: 0, salario: 6000, dias: 0 },
      { nombre: 'Ayudantes', cantidad: 0, salario: 5250, dias: 0 },
      { nombre: 'Encargado', cantidad: 0, salario: 6000, dias: 0 },
      { nombre: 'Cocinera', cantidad: 0, salario: 35, dias: 0 }
    ],
    // personal_asignado = IDs del personal del sistema (no salarios)
    maquinaria_asignada: [],
    personal_asignado: []
  });

  // Estado para controlar qué secciones están expandidas/colapsadas
  const [expandedSections, setExpandedSections] = useState({
    basico: true,
    presupuesto: true,
    gastos: true,
    maquinaria: false,
    personal_: false
  });

  // ==================== EFFECTS ====================
  /**
   * Efecto 1: Cargar datos de proyecto al abrir (edición)
   * Corre una sola vez cuando el prop "proyecto" cambia
   */
  useEffect(() => {
    // Si proyecto existe y tiene propiedades, cargarlo al estado
    if (proyecto && typeof proyecto === 'object') {
      const proyectoKeys = Object.keys(proyecto);
      if (proyectoKeys.length > 0) {
        // Filtra solo las propiedades que existen en formData
        const proyectoData = {};
        proyectoKeys.forEach(key => {
          if (key in formData || key === 'id') {
            proyectoData[key] = proyecto[key];
          }
        });
        setFormData(prev => ({ ...prev, ...proyectoData }));
      }
    }
  }, [proyecto]); // Solo depende de proyecto, no de formData

  // ==================== FUNCIONES AUXILIARES ====================
  /**
   * Calcula el gasto de personal del sistema basado en los IDs asignados
   * Fórmula: (salario_mensual / 30) × duracion_dias para cada persona
   *
   * @param {number[]} personalAsignadoIds - Array de IDs de personal asignado
   * @param {number} dias - Número de días del proyecto
   * @returns {number} Gasto total de personal
   */
  const calcularGastoPersonal = useCallback((personalAsignadoIds, dias) => {
    // Si no hay personal asignado o no tenemos datos, retorna 0
    if (!Array.isArray(personalAsignadoIds) || personalAsignadoIds.length === 0) {
      return 0;
    }

    // Si no hay días definidos, retorna 0 (el usuario aún no seleccionó fechas)
    if (!dias || dias <= 0) {
      return 0;
    }

    // Suma el costo de cada persona asignada
    return personalAsignadoIds.reduce((total, personaId) => {
      // Busca el empleado en el array de personal disponible
      // Compara tanto como número como string por si acaso
      const empleado = personal.find(p =>
        p.id === personaId || String(p.id) === String(personaId)
      );

      // Si encontramos el empleado y tiene salario, calcula su costo
      if (empleado && empleado.salario) {
        // Divide salario mensual por 30 para obtener salario diario
        const salarioDiario = empleado.salario / 30;
        // Multiplica por el número de días del proyecto
        const costePorPersona = salarioDiario * dias;
        // Suma al total
        return total + costePorPersona;
      }

      // Si no hay salario, no agrega nada
      return total;
    }, 0);
  }, [personal]); // Depende de personal (datos del backend)

  // ==================== HANDLERS ====================
  /**
   * Alternar expandir/colapsar una sección del formulario
   */
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  /**
   * Maneja cambios en inputs de texto, números y fechas
   *
   * Casos especiales:
   * - Si es una fecha (fecha_inicio o fecha_fin): calcula duracion_dias automáticamente
   * - Si es duracion_dias y hay personal asignado: recalcula gasto_personal
   *
   * @param {string} field - Nombre del campo que cambió
   * @param {any} value - Nuevo valor del campo
   */
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      // Copia el estado anterior
      const updated = {
        ...prev,
        [field]: value
      };

      // ⚠️ CASO ESPECIAL: Si cambian las fechas, calcula duracion_dias automáticamente
      if (field === 'fecha_inicio' || field === 'fecha_fin') {
        // Solo calcula si AMBAS fechas están definidas
        if (updated.fecha_inicio && updated.fecha_fin) {
          try {
            // Convierte strings a objetos Date
            const start = new Date(updated.fecha_inicio);
            const end = new Date(updated.fecha_fin);

            // Valida que las fechas sean válidas (no son NaN)
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              // Asegura que fecha inicio <= fecha fin
              if (start <= end) {
                // Calcula la diferencia en milisegundos
                const diffTime = end - start;
                // Convierte a días: ms / (1000 * 60 * 60 * 24)
                // +1 para incluir ambas fechas (ej: 1 al 2 = 2 días)
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                // Asegura que sea al menos 1 día
                updated.duracion_dias = Math.max(1, diffDays);
              }
            }
          } catch (err) {
            // Si hay error en el cálculo, solo log, no rompe la app
            console.warn('Error calculando duracion_dias:', err);
          }
        }
      }

      // ⚠️ CASO ESPECIAL: Si cambia duracion_dias y hay personal asignado, recalcula gasto
      if (field === 'duracion_dias' && Array.isArray(prev.personal_asignado) && prev.personal_asignado.length > 0) {
        updated.gasto_personal = calcularGastoPersonal(prev.personal_asignado, value);
      }

      return updated;
    });
  }, [calcularGastoPersonal]);

  /**
   * Maneja cambios en la tabla de empleados personalizados
   * @param {number} index - Índice del empleado en el array
   * @param {string} field - Campo que cambió (nombre, cantidad, salario, dias)
   * @param {any} value - Nuevo valor
   */
  const handleEmpleadoChange = useCallback((index, field, value) => {
    setFormData(prev => {
      // Copia el array de empleados
      const updatedEmpleados = [...prev.empleados];
      // Actualiza el campo específico
      updatedEmpleados[index][field] = value;
      // Retorna el estado actualizado
      return {
        ...prev,
        empleados: updatedEmpleados
      };
    });
  }, []);

  /**
   * Agrega una nueva fila de empleado personalizado
   * Valida que no haya empleados vacíos antes de agregar uno nuevo
   */
  const handleAgregarEmpleado = useCallback(() => {
    setFormData(prev => {
      // Verifica si hay empleados con nombre vacío
      const hasEmptyEmployees = prev.empleados.some(emp =>
        !emp.nombre || emp.nombre.trim() === ''
      );

      // Si hay vacíos, muestra alerta y no agrega nada
      if (hasEmptyEmployees) {
        alert('Por favor completa los campos vacíos de los empleados existentes antes de agregar otro.');
        return prev;
      }

      // Agrega un nuevo empleado vacío
      return {
        ...prev,
        empleados: [...prev.empleados, { nombre: '', cantidad: 0, salario: 0, dias: 0 }]
      };
    });
  }, []);

  /**
   * Elimina un empleado personalizado de la tabla
   * @param {number} index - Índice del empleado a eliminar
   */
  const handleEliminarEmpleado = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      // Filtra el empleado en el índice especificado
      empleados: prev.empleados.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Alterna la asignación de una maquinaria
   *
   * @param {number} machineId - ID de la máquina
   */
  const handleToggleMaquinaria = useCallback((machineId) => {
    // Valida que el ID sea válido (puede ser 0, por eso se comprueba así)
    if (!machineId && machineId !== 0) {
      console.error('Error: machineId is invalid', machineId);
      return;
    }

    setFormData(prev => {
      // Convierte el ID a string para comparación consistente
      const idAsString = String(machineId);
      // Obtiene el array actual de máquinas asignadas
      const currentAsignada = prev.maquinaria_asignada || [];
      // Verifica si esta máquina ya está asignada
      const isSelected = currentAsignada.some(id => String(id) === idAsString);

      // Toglea: si está asignada, la quita; si no está, la agrega
      return {
        ...prev,
        maquinaria_asignada: isSelected
          ? currentAsignada.filter(id => String(id) !== idAsString) // Quita
          : [...currentAsignada, machineId], // Agrega
        // Actualiza la cantidad de máquinas (para el resumen financiero)
        cantidad_maquinas: isSelected
          ? prev.cantidad_maquinas - 1
          : prev.cantidad_maquinas + 1
      };
    });
  }, []);

  /**
   * Alterna la asignación de una persona del sistema
   *
   * ⚠️ IMPORTANTE: AQUÍ SE CALCULA EL GASTO DE PERSONAL AUTOMÁTICAMENTE
   * - Cuando se asigna: suma el costo de esa persona
   * - Cuando se desasigna: resta su costo
   * - El cálculo es: (salario_mensual / 30) × duracion_dias
   *
   * @param {number} personaId - ID de la persona
   */
  const handleTogglePersonal = useCallback((personaId) => {
    // Valida que el ID sea válido
    if (!personaId && personaId !== 0) {
      console.error('Error: personaId is invalid', personaId);
      return;
    }

    setFormData(prev => {
      // Convierte el ID a string para comparación consistente
      const idAsString = String(personaId);
      // Obtiene el array actual de personal asignado
      const currentAsignado = prev.personal_asignado || [];
      // Verifica si esta persona ya está asignada
      const isSelected = currentAsignado.some(id => String(id) === idAsString);

      // Calcula el nuevo array de personal asignado
      const newPersonalAsignado = isSelected
        ? currentAsignado.filter(id => String(id) !== idAsString) // Quita la persona
        : [...currentAsignado, personaId]; // Agrega la persona

      // Recalcula el gasto de personal con el nuevo array
      const gastoPersonalCalculado = calcularGastoPersonal(newPersonalAsignado, prev.duracion_dias);

      return {
        ...prev,
        personal_asignado: newPersonalAsignado,
        gasto_personal: gastoPersonalCalculado // Actualiza el gasto automáticamente
      };
    });
  }, [calcularGastoPersonal]);

  /**
   * Valida y envía el formulario
   *
   * Validaciones:
   * - Nombre es obligatorio
   * - Empleados personalizados deben tener nombre
   * - IDs deben ser válidos (filtra nulls/undefined)
   *
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // ✅ VALIDACIÓN 1: Nombre es requerido
    if (!formData.nombre || formData.nombre.trim() === '') {
      console.error('Error: Nombre del proyecto es requerido');
      alert('Por favor ingresa un nombre para el proyecto');
      return;
    }

    // ✅ VALIDACIÓN 2: Empleados personalizados deben tener nombre
    const empleadosValidos = formData.empleados.filter(emp =>
      emp.nombre && emp.nombre.trim() !== ''
    );

    // Prepara los datos para enviar al backend
    const dataToSubmit = {
      ...formData,
      // Limpia el nombre (trim)
      nombre: formData.nombre.trim(),
      // Limpia la descripción
      descripcion: formData.descripcion?.trim() || '',
      // Solo incluye empleados personalizados que tengan nombre
      empleados: empleadosValidos,
      // Filtra personal asignado: solo IDs válidos (no null/undefined)
      personal_asignado: Array.isArray(formData.personal_asignado)
        ? formData.personal_asignado.filter(id => id || id === 0)
        : [],
      // Filtra maquinaria asignada: solo IDs válidos
      maquinaria_asignada: Array.isArray(formData.maquinaria_asignada)
        ? formData.maquinaria_asignada.filter(id => id || id === 0)
        : []
    };

    // Log para debugging
    console.log('✅ Enviando datos del proyecto:', {
      nombre: dataToSubmit.nombre,
      dias: dataToSubmit.duracion_dias,
      personalAsignado: dataToSubmit.personal_asignado,
      gastoPersonal: dataToSubmit.gasto_personal,
      total: dataToSubmit
    });

    // Llama al callback onSubmit (que está en Proyectos.js)
    onSubmit(dataToSubmit);
  }, [formData, onSubmit]);

  // ==================== COMPONENTES AUXILIARES ====================
  /**
   * Componente para encabezado de sección colapsable
   */
  const SectionHeader = ({ title, section, icon }) => (
    <div
      onClick={() => toggleSection(section)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        background: '#111411',
        border: '1px solid #1f241f',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '16px',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <h3 style={{ color: '#FFD700', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          {title}
        </h3>
      </div>
      {expandedSections[section] ?
        <ChevronUp size={20} color="#FFD700" /> :
        <ChevronDown size={20} color="#666" />
      }
    </div>
  );

  // ==================== RENDER ====================
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* ============== SECCIÓN 1: DATOS BÁSICOS ============== */}
      <SectionHeader title="Datos Básicos" section="basico" icon="📋" />
      {expandedSections.basico && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          {/* Campo: Nombre del Proyecto */}
          <InputGroup
            label="Nombre del Proyecto"
            value={formData.nombre}
            onChange={(v) => handleInputChange('nombre', v)}
            required
          />

          {/* Campo: Estado */}
          <InputGroup
            label="Estado"
            value={formData.estado}
            onChange={(v) => handleInputChange('estado', v)}
          />

          {/* Campo: Fecha Inicio - Usa el calendario interactivo */}
          <InputGroup
            label="Fecha Inicio"
            value={formData.fecha_inicio}
            onChange={(v) => handleInputChange('fecha_inicio', v)}
            type="date"
          />

          {/* Campo: Fecha Fin - Se calcula automáticamente duracion_dias */}
          <InputGroup
            label="Fecha Fin"
            value={formData.fecha_fin}
            onChange={(v) => handleInputChange('fecha_fin', v)}
            type="date"
          />

          {/* Campo: Km Totales */}
          <InputGroup
            label="Km Totales"
            value={formData.kilometros_totales}
            onChange={(v) => handleInputChange('kilometros_totales', parseFloat(v))}
            type="number"
          />

          {/* Campo: Duración (días) - Se calcula automáticamente de las fechas - Solo lectura */}
          <InputGroup
            label="Duración (días)"
            value={formData.duracion_dias}
            onChange={(v) => handleInputChange('duracion_dias', parseInt(v))}
            type="number"
            disabled={true}
          />

          {/* Campo: Descripción - Ocupa dos columnas */}
          <div style={{ gridColumn: '1 / -1' }}>
            <InputGroup
              label="Descripción"
              value={formData.descripcion}
              onChange={(v) => handleInputChange('descripcion', v)}
            />
          </div>
        </div>
      )}

      {/* ============== SECCIÓN 2: TIPO DE PRESUPUESTO ============== */}
      <SectionHeader title="Tipo de Presupuesto" section="presupuesto" icon="💰" />
      {expandedSections.presupuesto && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          {/* Opciones: Presupuesto Fijo vs Por Tarifa */}
          <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
            <label style={{ color: '#e7ebe5', marginRight: '20px', cursor: 'pointer' }}>
              <input
                type="radio"
                value="fijo"
                checked={formData.tipo_presupuesto === 'fijo'}
                onChange={(e) => handleInputChange('tipo_presupuesto', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Presupuesto Fijo (Licitación)
            </label>
            <label style={{ color: '#e7ebe5', cursor: 'pointer' }}>
              <input
                type="radio"
                value="tarifa"
                checked={formData.tipo_presupuesto === 'tarifa'}
                onChange={(e) => handleInputChange('tipo_presupuesto', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Por Tarifa (km × precio)
            </label>
          </div>

          {/* Muestra presupuesto fijo o tarifa según la selección */}
          {formData.tipo_presupuesto === 'fijo' ? (
            <InputGroup
              label="Presupuesto Adjudicado (Bs)"
              value={formData.presupuesto_adjudicado}
              onChange={(v) => handleInputChange('presupuesto_adjudicado', parseFloat(v))}
              type="number"
            />
          ) : (
            <InputGroup
              label="Tarifa por KM (Bs)"
              value={formData.tarifa_km}
              onChange={(v) => handleInputChange('tarifa_km', parseFloat(v))}
              type="number"
            />
          )}
        </div>
      )}

      {/* ============== SECCIÓN 3: GASTOS OPERATIVOS ============== */}
      <SectionHeader title="Gastos Operativos (TODO EDITABLE)" section="gastos" icon="📊" />
      {expandedSections.gastos && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {/* --- Subsección: DIESEL --- */}
          <div style={{ marginBottom: '24px', padding: '12px', background: '#111411', borderRadius: '8px', borderLeft: '4px solid #fbbf24' }}>
            <h4 style={{ color: '#fbbf24', margin: '0 0 12px 0' }}>🛢️ Diesel</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputGroup
                label="Litros"
                value={formData.diesel_litros}
                onChange={(v) => handleInputChange('diesel_litros', parseFloat(v))}
                type="number"
              />
              <InputGroup
                label="Precio/Litro (Bs)"
                value={formData.diesel_precio}
                onChange={(v) => handleInputChange('diesel_precio', parseFloat(v))}
                type="number"
                step="0.01"
              />
            </div>
          </div>

          {/* --- Subsección: PERSONAL --- */}
          <div style={{ marginBottom: '24px', padding: '12px', background: '#111411', borderRadius: '8px', borderLeft: '4px solid #60a5fa' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <h4 style={{ color: '#60a5fa', margin: '0 0 4px 0' }}>💼 Costos de Personal Personalizados</h4>
                <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>
                  Usa esto para roles genéricos o costos adicionales no cubiertos por personal del sistema
                </p>
              </div>
              <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                Subtotal: <span style={{ color: '#FFD700' }}>
                  {(formData.empleados.reduce((sum, emp) =>
                    sum + (emp.cantidad * emp.salario * emp.dias), 0
                  )).toLocaleString('es-BO', { maximumFractionDigits: 0 })} Bs
                </span>
              </div>
            </div>

            {/* Mostrar costo total de personal del sistema si hay asignado */}
            {(formData.gasto_personal || 0) > 0 && (
              <div style={{
                background: '#0d0f0d',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '12px',
                borderLeft: '3px solid #FFD700',
                fontSize: '11px',
                color: '#FFD700'
              }}>
                💡 Costo Total de Personal (del sistema): <strong>
                  {(formData.gasto_personal || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })} Bs
                </strong>
              </div>
            )}

            {/* Tabla de empleados personalizados */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f241f' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#999' }}>Rol</th>
                  <th style={{ textAlign: 'center', padding: '8px', color: '#999' }}>Cant.</th>
                  <th style={{ textAlign: 'center', padding: '8px', color: '#999' }}>Salario/día</th>
                  <th style={{ textAlign: 'center', padding: '8px', color: '#999' }}>Días</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#999' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {formData.empleados.map((emp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1f241f' }}>
                    {/* Columna: Nombre/Rol */}
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={emp.nombre}
                        onChange={(e) => handleEmpleadoChange(idx, 'nombre', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          background: '#0d0f0d',
                          border: '1px solid #1f241f',
                          borderRadius: '4px',
                          color: '#e0e0e0',
                          fontSize: '12px'
                        }}
                      />
                    </td>

                    {/* Columna: Cantidad */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={emp.cantidad}
                        onChange={(e) => handleEmpleadoChange(idx, 'cantidad', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '6px',
                          background: '#0d0f0d',
                          border: '1px solid #1f241f',
                          borderRadius: '4px',
                          color: '#e0e0e0',
                          fontSize: '12px',
                          textAlign: 'center'
                        }}
                      />
                    </td>

                    {/* Columna: Salario por día */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={emp.salario}
                        onChange={(e) => handleEmpleadoChange(idx, 'salario', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '6px',
                          background: '#0d0f0d',
                          border: '1px solid #1f241f',
                          borderRadius: '4px',
                          color: '#e0e0e0',
                          fontSize: '12px',
                          textAlign: 'center'
                        }}
                      />
                    </td>

                    {/* Columna: Días */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={emp.dias}
                        onChange={(e) => handleEmpleadoChange(idx, 'dias', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '6px',
                          background: '#0d0f0d',
                          border: '1px solid #1f241f',
                          borderRadius: '4px',
                          color: '#e0e0e0',
                          fontSize: '12px',
                          textAlign: 'center'
                        }}
                      />
                    </td>

                    {/* Columna: Subtotal (solo lectura, se calcula) */}
                    <td style={{ padding: '8px', textAlign: 'right', color: '#60a5fa', fontWeight: 'bold' }}>
                      {(emp.cantidad * emp.salario * emp.dias).toLocaleString('es-BO')}
                    </td>

                    {/* Columna: Botón eliminar */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleEliminarEmpleado(idx)}
                        style={{
                          background: '#f87171',
                          border: 'none',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Botón para agregar nueva fila de empleado */}
            <button
              onClick={handleAgregarEmpleado}
              type="button"
              title="Agregar una nueva fila de costos de personal para este proyecto"
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#111411',
                border: '1px solid #60a5fa',
                color: '#60a5fa',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#1a1d1a';
                e.currentTarget.style.borderColor = '#a78bfa';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#111411';
                e.currentTarget.style.borderColor = '#60a5fa';
              }}
            >
              <Plus size={14} /> Agregar fila de costo
            </button>
          </div>

          {/* --- Subsección: COMIDA --- */}
          <div style={{ marginBottom: '24px', padding: '12px', background: '#111411', borderRadius: '8px', borderLeft: '4px solid #4ade80' }}>
            <h4 style={{ color: '#4ade80', margin: '0 0 12px 0' }}>🍽️ Comida</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputGroup
                label="Costo Total (Bs)"
                value={formData.gasto_comida}
                onChange={(v) => handleInputChange('gasto_comida', parseFloat(v))}
                type="number"
              />
              <div style={{ color: '#999', fontSize: '12px', paddingTop: '32px' }}>
                O: {formData.dias_comida} días × {formData.costo_comida_dia} Bs/día
              </div>
            </div>
          </div>

          {/* --- Subsección: MANTENIMIENTO MAQUINARIA --- */}
          <div style={{ marginBottom: '24px', padding: '12px', background: '#111411', borderRadius: '8px', borderLeft: '4px solid #a78bfa' }}>
            <h4 style={{ color: '#a78bfa', margin: '0 0 12px 0' }}>🏗️ Mantenimiento Maquinaria</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputGroup
                label="Cantidad de Máquinas"
                value={formData.cantidad_maquinas}
                onChange={(v) => handleInputChange('cantidad_maquinas', parseInt(v))}
                type="number"
              />
              <InputGroup
                label="Costo por Máquina (Bs)"
                value={formData.costo_mantenimiento_maquina}
                onChange={(v) => handleInputChange('costo_mantenimiento_maquina', parseInt(v))}
                type="number"
              />
            </div>
          </div>

          {/* --- Subsección: OTROS GASTOS --- */}
          <div style={{ padding: '12px', background: '#111411', borderRadius: '8px', borderLeft: '4px solid #f97316' }}>
            <h4 style={{ color: '#f97316', margin: '0 0 12px 0' }}>📋 Otros Gastos</h4>
            <InputGroup
              label="Otros Gastos (Bs)"
              value={formData.gasto_otros}
              onChange={(v) => handleInputChange('gasto_otros', parseFloat(v))}
              type="number"
            />
          </div>
        </div>
      )}

      {/* ============== SECCIÓN 4: MAQUINARIA ASIGNADA ============== */}
      <SectionHeader title="Maquinaria Asignada" section="maquinaria" icon="🏗️" />
      {expandedSections.maquinaria && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          {maquinaria && maquinaria.length > 0 ? (
            maquinaria.map((maq) => {
              // Valida que la máquina tenga ID
              if (!maq || !maq.id) return null;

              return (
                <label key={maq.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#111411',
                  borderRadius: '8px',
                  // Resalta si está seleccionada
                  border: (formData.maquinaria_asignada || []).some(id =>
                    String(id) === String(maq.id)
                  ) ? '2px solid #FFD700' : '1px solid #1f241f',
                  cursor: 'pointer',
                  color: '#e0e0e0',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={(formData.maquinaria_asignada || []).some(id =>
                      String(id) === String(maq.id)
                    )}
                    onChange={() => handleToggleMaquinaria(maq.id)}
                    style={{ marginRight: '8px', cursor: 'pointer', accentColor: '#FFD700' }}
                  />
                  {/* Nombre de la máquina */}
                  <span style={{ flex: 1 }}>
                    {maq.nombre}
                  </span>
                </label>
              );
            })
          ) : (
            <p style={{ color: '#999', fontSize: '12px', gridColumn: '1 / -1' }}>
              No hay maquinaria disponible. Crea maquinaria primero en el módulo "Maquinaria".
            </p>
          )}
        </div>
      )}

      {/* ============== SECCIÓN 5: PERSONAL ASIGNADO DEL SISTEMA ============== */}
      <SectionHeader title="Personal Asignado del Sistema" section="personal_" icon="👥" />
      {expandedSections.personal_ && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {/* Explicación de cómo funciona */}
          <div style={{
            background: '#111411',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '3px solid #60a5fa',
            fontSize: '12px',
            color: '#999'
          }}>
            ℹ️ Selecciona el personal de tu sistema. El costo se calcula automáticamente: <br/>
            <strong>Salario mensual ÷ 30 × Días del proyecto</strong>
          </div>

          {/* Grid de personal disponible */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {personal && personal.length > 0 ? (
              personal.map((pers) => {
                // Valida que la persona tenga ID
                if (!pers || !pers.id) return null;

                const isSelected = (formData.personal_asignado || []).some(id =>
                  String(id) === String(pers.id)
                );
                // Calcula salario diario (mensual / 30)
                const salarioDiario = pers.salario ? (pers.salario / 30).toFixed(0) : 0;

                return (
                  <label key={pers.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#111411',
                    borderRadius: '8px',
                    // Resalta si está seleccionada
                    border: isSelected ? '2px solid #FFD700' : '1px solid #1f241f',
                    cursor: 'pointer',
                    color: '#e0e0e0',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}>
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePersonal(pers.id)}
                      style={{ marginRight: '8px', cursor: 'pointer', accentColor: '#FFD700' }}
                    />

                    {/* Información de la persona */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                        {pers.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {pers.cargo} • {(pers.salario || 0).toLocaleString('es-BO')} Bs/mes ({salarioDiario} Bs/día)
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <p style={{ color: '#999', fontSize: '12px', gridColumn: '1 / -1' }}>
                No hay personal disponible. Crea personal primero en el módulo "Personal".
              </p>
            )}
          </div>
        </div>
      )}

      {/* ============== BOTONES DE ACCIÓN ============== */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', marginBottom: '32px' }}>
        {/* Botón Guardar */}
        <button
          type="submit"
          style={{
            padding: '12px 32px',
            background: '#FFD700',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#ffc700'}
          onMouseOut={(e) => e.target.style.background = '#FFD700'}
        >
          💾 Guardar Proyecto
        </button>

        {/* Botón Cancelar */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 32px',
            background: '#1a1d1a',
            color: '#e0e0e0',
            border: '1px solid #1f241f',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.borderColor = '#60a5fa'}
          onMouseOut={(e) => e.target.style.borderColor = '#1f241f'}
        >
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para evitar re-renders innecesarios
  // Retorna TRUE si los props son iguales (no renderizar)
  // Retorna FALSE si son diferentes (renderizar)
  return (
    prevProps.proyecto === nextProps.proyecto &&
    prevProps.maquinaria === nextProps.maquinaria &&
    prevProps.personal === nextProps.personal &&
    prevProps.onSubmit === nextProps.onSubmit &&
    prevProps.onCancel === nextProps.onCancel
  );
});

// Nombre de debug para React DevTools
ProyectoForm.displayName = 'ProyectoForm';

export default ProyectoForm;
