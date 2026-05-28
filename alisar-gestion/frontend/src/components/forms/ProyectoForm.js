/**
 * ProyectoForm Component
 * Formulario completo para crear/editar proyectos con análisis financiero
 * 6 secciones totalmente editables con cálculos automáticos
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

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

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    setFormData(prev => ({
      ...prev,
      empleados: [...prev.empleados, { nombre: 'Nuevo Empleado', cantidad: 1, salario: 0, dias: 0 }]
    }));
  }, []);

  const handleEliminarEmpleado = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      empleados: prev.empleados.filter((_, i) => i !== index)
    }));
  }, []);

  const handleToggleMaquinaria = useCallback((machineId) => {
    setFormData(prev => {
      const asignada = prev.maquinaria_asignada.includes(machineId);
      return {
        ...prev,
        maquinaria_asignada: asignada
          ? prev.maquinaria_asignada.filter(id => id !== machineId)
          : [...prev.maquinaria_asignada, machineId],
        cantidad_maquinas: asignada
          ? prev.cantidad_maquinas - 1
          : prev.cantidad_maquinas + 1
      };
    });
  }, []);

  const handleTogglePersonal = useCallback((personaId) => {
    setFormData(prev => ({
      ...prev,
      personal_asignado: prev.personal_asignado.includes(personaId)
        ? prev.personal_asignado.filter(id => id !== personaId)
        : [...prev.personal_asignado, personaId]
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
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

  const InputGroup = ({ label, value, onChange, type = 'text', required = false }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e7ebe5', fontWeight: '500' }}>
        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #1f241f',
          borderRadius: '8px',
          background: '#0d0f0d',
          color: '#e0e0e0',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
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
            <h4 style={{ color: '#60a5fa', margin: '0 0 12px 0' }}>👥 Personal</h4>
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
                fontWeight: 'bold'
              }}
            >
              <Plus size={14} /> Agregar empleado
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
          {maquinaria.map((maq) => (
            <label key={maq.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              background: '#111411',
              borderRadius: '8px',
              border: formData.maquinaria_asignada.includes(maq.id) ? '2px solid #FFD700' : '1px solid #1f241f',
              cursor: 'pointer',
              color: '#e0e0e0'
            }}>
              <input
                type="checkbox"
                checked={formData.maquinaria_asignada.includes(maq.id)}
                onChange={() => handleToggleMaquinaria(maq.id)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              {maq.nombre}
            </label>
          ))}
        </div>
      )}

      {/* SECCIÓN 5: PERSONAL ASIGNADO */}
      <SectionHeader title="Personal Asignado" section="personal_" icon="👥" />
      {expandedSections.personal_ && (
        <div style={{
          background: '#0d0f0d',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          {personal.map((pers) => (
            <label key={pers.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              background: '#111411',
              borderRadius: '8px',
              border: formData.personal_asignado.includes(pers.id) ? '2px solid #FFD700' : '1px solid #1f241f',
              cursor: 'pointer',
              color: '#e0e0e0'
            }}>
              <input
                type="checkbox"
                checked={formData.personal_asignado.includes(pers.id)}
                onChange={() => handleTogglePersonal(pers.id)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              {pers.nombre} ({pers.cargo})
            </label>
          ))}
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
