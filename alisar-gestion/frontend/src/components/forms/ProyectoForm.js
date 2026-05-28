/**
 * ProyectoForm Component
 * Formulario completo para crear/editar proyectos con análisis financiero
 * 6 secciones totalmente editables con cálculos automáticos
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import InputGroup from './InputGroup';

const ProyectoForm = memo(({ proyecto, maquinaria = [], personal = [], onSubmit = () => {}, onCancel = () => {} }) => {
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
    empleados: [
      { nombre: 'Operarios', cantidad: 0, salario: 6000, dias: 0 },
      { nombre: 'Ayudantes', cantidad: 0, salario: 5250, dias: 0 },
      { nombre: 'Encargado', cantidad: 0, salario: 6000, dias: 0 },
      { nombre: 'Cocinera', cantidad: 0, salario: 35, dias: 0 }
    ],
    maquinaria_asignada: [],
    personal_asignado: []
  });

  const [expandedSections, setExpandedSections] = useState({
    basico: true,
    presupuesto: true,
    gastos: true,
    maquinaria: false,
    personal_: false
  });

  useEffect(() => {
    // Solo actualizar si proyecto es un objeto válido con propiedades
    if (proyecto && typeof proyecto === 'object') {
      const proyectoKeys = Object.keys(proyecto);
      if (proyectoKeys.length > 0) {
        // Filtra solo las propiedades que existen en el proyecto
        const proyectoData = {};
        proyectoKeys.forEach(key => {
          if (key in formData || key === 'id') {
            proyectoData[key] = proyecto[key];
          }
        });
        setFormData(prev => ({ ...prev, ...proyectoData }));
      }
    }
  }, [proyecto]);

  // Recalcular gasto de personal cuando cambian los días o el personal asignado
  useEffect(() => {
    setFormData(prev => {
      const personalAsignado = prev.personal_asignado || [];

      if (Array.isArray(personal) && personal.length > 0 && personalAsignado.length > 0) {
        const gastoCalculado = personalAsignado.reduce((total, pId) => {
          const empleado = personal.find(p => p.id === pId || String(p.id) === String(pId));
          if (empleado && empleado.salario) {
            const salarioDiario = (empleado.salario / 30);
            const costePorPersona = salarioDiario * (prev.duracion_dias || 1);
            return total + costePorPersona;
          }
          return total;
        }, 0);

        return {
          ...prev,
          gasto_personal: gastoCalculado
        };
      }

      return prev;
    });
  }, [formData.duracion_dias, formData.personal_asignado, personal]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Auto-calculate duracion_dias when dates change
      if (field === 'fecha_inicio' || field === 'fecha_fin') {
        if (updated.fecha_inicio && updated.fecha_fin) {
          try {
            const start = new Date(updated.fecha_inicio);
            const end = new Date(updated.fecha_fin);

            // Validar que las fechas sean válidas
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              // Asegurar que la fecha inicio sea menor o igual a la fecha fin
              if (start <= end) {
                const diffTime = end - start;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
                updated.duracion_dias = Math.max(1, diffDays);
              }
            }
          } catch (err) {
            console.warn('Error calculating duration:', err);
          }
        }
      }

      return updated;
    });
  }, []);

  const handleEmpleadoChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updatedEmpleados = [...prev.empleados];
      updatedEmpleados[index][field] = value;
      return {
        ...prev,
        empleados: updatedEmpleados
      };
    });
  }, []);

  const handleAgregarEmpleado = useCallback(() => {
    setFormData(prev => {
      // Validar que no existan empleados vacíos antes de agregar uno nuevo
      const hasEmptyEmployees = prev.empleados.some(emp => !emp.nombre || emp.nombre.trim() === '');
      if (hasEmptyEmployees) {
        alert('Por favor completa los campos vacíos de los empleados existentes antes de agregar otro.');
        return prev;
      }

      return {
        ...prev,
        empleados: [...prev.empleados, { nombre: '', cantidad: 0, salario: 0, dias: 0 }]
      };
    });
  }, []);

  const handleEliminarEmpleado = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      empleados: prev.empleados.filter((_, i) => i !== index)
    }));
  }, []);

  const handleToggleMaquinaria = useCallback((machineId) => {
    if (!machineId && machineId !== 0) {
      console.error('Error: machineId is invalid', machineId);
      return;
    }

    setFormData(prev => {
      const idAsString = String(machineId);
      const currentAsignada = prev.maquinaria_asignada || [];
      const isSelected = currentAsignada.some(id => String(id) === idAsString);

      return {
        ...prev,
        maquinaria_asignada: isSelected
          ? currentAsignada.filter(id => String(id) !== idAsString)
          : [...currentAsignada, machineId],
        cantidad_maquinas: isSelected
          ? prev.cantidad_maquinas - 1
          : prev.cantidad_maquinas + 1
      };
    });
  }, []);

  const handleTogglePersonal = useCallback((personaId) => {
    if (!personaId && personaId !== 0) {
      console.error('Error: personaId is invalid', personaId);
      return;
    }

    setFormData(prev => {
      const idAsString = String(personaId);
      const currentAsignado = prev.personal_asignado || [];
      const isSelected = currentAsignado.some(id => String(id) === idAsString);

      // Calcular automáticamente el gasto de personal asignado
      const newPersonalAsignado = isSelected
        ? currentAsignado.filter(id => String(id) !== idAsString)
        : [...currentAsignado, personaId];

      // Calcular gasto_personal basado en el personal asignado del sistema
      let gastoPersonalCalculado = 0;
      if (Array.isArray(personal) && personal.length > 0 && newPersonalAsignado.length > 0) {
        gastoPersonalCalculado = newPersonalAsignado.reduce((total, pId) => {
          const empleado = personal.find(p => p.id === pId || String(p.id) === String(pId));
          if (empleado && empleado.salario) {
            // Salario mensual / 30 días × duracion_dias del proyecto
            const salarioDiario = (empleado.salario / 30);
            const costePorPersona = salarioDiario * (prev.duracion_dias || 1);
            return total + costePorPersona;
          }
          return total;
        }, 0);
      }

      return {
        ...prev,
        personal_asignado: newPersonalAsignado,
        gasto_personal: gastoPersonalCalculado
      };
    });
  }, [personal]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.nombre || formData.nombre.trim() === '') {
      console.error('Error: Nombre del proyecto es requerido');
      alert('Por favor ingresa un nombre para el proyecto');
      return;
    }

    // Validar que los empleados tengan datos válidos si tienen valores
    const empleadosValidos = formData.empleados.filter(emp => {
      // Permitir empleados vacíos al inicio, pero si tienen datos deben ser válidos
      return emp.nombre && emp.nombre.trim() !== '';
    });

    // Preparar datos para envío
    const dataToSubmit = {
      ...formData,
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion?.trim() || '',
      empleados: empleadosValidos, // Solo incluir empleados con datos válidos
      // Asegurar que los arrays de IDs sean válidos
      personal_asignado: Array.isArray(formData.personal_asignado)
        ? formData.personal_asignado.filter(id => id || id === 0)
        : [],
      maquinaria_asignada: Array.isArray(formData.maquinaria_asignada)
        ? formData.maquinaria_asignada.filter(id => id || id === 0)
        : []
    };

    console.log('Enviando datos del proyecto:', dataToSubmit);
    onSubmit(dataToSubmit);
  }, [formData, onSubmit]);

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
      {expandedSections[section] ? <ChevronUp size={20} color="#FFD700" /> : <ChevronDown size={20} color="#666" />}
    </div>
  );
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* SECCIÓN 1: DATOS BÁSICOS */}
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
          <InputGroup
            label="Nombre del Proyecto"
            value={formData.nombre}
            onChange={(v) => handleInputChange('nombre', v)}
            required
          />
          <InputGroup
            label="Estado"
            value={formData.estado}
            onChange={(v) => handleInputChange('estado', v)}
          />
          <InputGroup
            label="Fecha Inicio"
            value={formData.fecha_inicio}
            onChange={(v) => handleInputChange('fecha_inicio', v)}
            type="date"
          />
          <InputGroup
            label="Fecha Fin"
            value={formData.fecha_fin}
            onChange={(v) => handleInputChange('fecha_fin', v)}
            type="date"
          />
          <InputGroup
            label="Km Totales"
            value={formData.kilometros_totales}
            onChange={(v) => handleInputChange('kilometros_totales', parseFloat(v))}
            type="number"
          />
          <InputGroup
            label="Duración (días)"
            value={formData.duracion_dias}
            onChange={(v) => handleInputChange('duracion_dias', parseInt(v))}
            type="number"
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <InputGroup
              label="Descripción"
              value={formData.descripcion}
              onChange={(v) => handleInputChange('descripcion', v)}
            />
          </div>
        </div>
      )}

      {/* SECCIÓN 2: TIPO DE PRESUPUESTO */}
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

      {/* SECCIÓN 3: GASTOS OPERATIVOS */}
      <SectionHeader title="Gastos Operativos (TODO EDITABLE)" section="gastos" icon="📊" />
      {expandedSections.gastos && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {/* Diesel */}
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

          {/* Personal */}
          <div style={{ marginBottom: '24px', padding: '12px', background: '#111411', borderRadius: '8px', borderLeft: '4px solid #60a5fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ color: '#60a5fa', margin: '0 0 4px 0' }}>💼 Costos de Personal Personalizados</h4>
                <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>Usa esto para roles genéricos o costos adicionales no cubiertos por personal del sistema</p>
              </div>
              <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                Subtotal: <span style={{ color: '#FFD700' }}>{(formData.empleados.reduce((sum, emp) => sum + (emp.cantidad * emp.salario * emp.dias), 0)).toLocaleString('es-BO', { maximumFractionDigits: 0 })} Bs</span>
              </div>
            </div>

            {/* Nota sobre gasto_personal total */}
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
                💡 Costo Total de Personal (del sistema): <strong>{(formData.gasto_personal || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })} Bs</strong>
              </div>
            )}

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
                    <td style={{ padding: '8px', textAlign: 'right', color: '#60a5fa', fontWeight: 'bold' }}>
                      {(emp.cantidad * emp.salario * emp.dias).toLocaleString('es-BO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {/* Comida */}
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

          {/* Mantenimiento */}
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

          {/* Otros */}
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

      {/* SECCIÓN 4: MAQUINARIA ASIGNADA */}
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
              if (!maq || !maq.id) return null;
              return (
                <label key={maq.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#111411',
                  borderRadius: '8px',
                  border: (formData.maquinaria_asignada || []).some(id => String(id) === String(maq.id)) ? '2px solid #FFD700' : '1px solid #1f241f',
                  cursor: 'pointer',
                  color: '#e0e0e0',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={(formData.maquinaria_asignada || []).some(id => String(id) === String(maq.id))}
                    onChange={() => handleToggleMaquinaria(maq.id)}
                    style={{ marginRight: '8px', cursor: 'pointer', accentColor: '#FFD700' }}
                  />
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

      {/* SECCIÓN 5: PERSONAL ASIGNADO */}
      <SectionHeader title="Personal Asignado del Sistema" section="personal_" icon="👥" />
      {expandedSections.personal_ && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {personal && personal.length > 0 ? (
              personal.map((pers) => {
                if (!pers || !pers.id) return null;
                const isSelected = (formData.personal_asignado || []).some(id => String(id) === String(pers.id));
                const salarioDiario = pers.salario ? (pers.salario / 30).toFixed(0) : 0;
                return (
                  <label key={pers.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#111411',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #FFD700' : '1px solid #1f241f',
                    cursor: 'pointer',
                    color: '#e0e0e0',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePersonal(pers.id)}
                      style={{ marginRight: '8px', cursor: 'pointer', accentColor: '#FFD700' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{pers.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {pers.cargo} • {pers.salario.toLocaleString('es-BO')} Bs/mes ({salarioDiario} Bs/día)
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

      {/* BOTONES */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', marginBottom: '32px' }}>
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
            fontSize: '14px'
          }}
        >
          💾 Guardar Proyecto
        </button>
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
            fontSize: '14px'
          }}
        >
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para evitar re-renders innecesarios
  return (
    prevProps.proyecto === nextProps.proyecto &&
    prevProps.maquinaria === nextProps.maquinaria &&
    prevProps.personal === nextProps.personal &&
    prevProps.onSubmit === nextProps.onSubmit &&
    prevProps.onCancel === nextProps.onCancel
  );
});

ProyectoForm.displayName = 'ProyectoForm';

export default ProyectoForm;
