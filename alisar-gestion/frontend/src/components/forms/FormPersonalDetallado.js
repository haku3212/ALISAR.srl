/**
 * FormPersonalDetallado.js
 * Componente de formulario ampliado para gestión de personal
 * Incluye validación, campos detallados y comentarios completos
 */

import React, { useState } from 'react';
import FormInput from '../common/FormInput';

/**
 * Componente FormPersonalDetallado
 * Renderiza un formulario completo para crear/editar personal con campos extensos
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario actual
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.submitting - Indica si se está enviando el formulario
 */
const FormPersonalDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  // Estado para controlar qué sección está expandida
  const [expandedSection, setExpandedSection] = useState('basico');

  /**
   * Manejador para cambios en los inputs
   * Actualiza el estado del formulario y notifica al padre
   * @param {string} field - Nombre del campo que cambió
   * @param {any} value - Nuevo valor del campo
   */
  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        {/* Encabezado de la sección - Clickeable para expandir/contraer */}
        <div
          onClick={() => setExpandedSection(expandedSection === 'basico' ? null : 'basico')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(74,222,128,.12), rgba(74,222,128,.04))',
            borderBottom: expandedSection === 'basico' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#4ade80' }}>
            👤 Información Básica
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'basico' ? '▼' : '▶'}
          </span>
        </div>

        {/* Contenido de la sección - Se muestra/oculta según expandedSection */}
        {expandedSection === 'basico' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Nombre Completo */}
            <FormInput
              label="Nombre Completo"
              value={formData.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              error={errors.nombre}
              disabled={submitting}
              required
              placeholder="Ej: Juan Carlos Mendoza"
            />

            {/* Campo: Cédula de Identidad */}
            <FormInput
              label="Cédula de Identidad"
              value={formData.cedula || ''}
              onChange={(e) => handleChange('cedula', e.target.value)}
              error={errors.cedula}
              disabled={submitting}
              placeholder="Ej: 1234567-BO"
            />

            {/* Campo: Email Principal */}
            <FormInput
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              disabled={submitting}
              placeholder="juan@example.com"
            />

            {/* Campo: Teléfono/Celular */}
            <FormInput
              label="Celular"
              value={formData.celular || ''}
              onChange={(e) => handleChange('celular', e.target.value)}
              error={errors.celular}
              disabled={submitting}
              placeholder="Ej: 76123456"
            />

            {/* Campo: Fecha de Nacimiento */}
            <FormInput
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento || ''}
              onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Género */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Género
              </label>
              <select
                value={formData.genero || ''}
                onChange={(e) => handleChange('genero', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: errors.genero ? '1px solid #f87171' : '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: INFORMACIÓN LABORAL */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'laboral' ? null : 'laboral')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(96,165,250,.12), rgba(96,165,250,.04))',
            borderBottom: expandedSection === 'laboral' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#60a5fa' }}>
            💼 Información Laboral
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'laboral' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'laboral' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Cargo/Puesto */}
            <FormInput
              label="Cargo"
              value={formData.cargo || ''}
              onChange={(e) => handleChange('cargo', e.target.value)}
              error={errors.cargo}
              disabled={submitting}
              required
              placeholder="Ej: Operador de Motoniveladora"
            />

            {/* Campo: Departamento */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Departamento
              </label>
              <select
                value={formData.departamento || ''}
                onChange={(e) => handleChange('departamento', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: errors.departamento ? '1px solid #f87171' : '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="operaciones">Operaciones</option>
                <option value="administrativo">Administrativo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="seguridad">Seguridad</option>
              </select>
            </div>

            {/* Campo: Fecha de Ingreso */}
            <FormInput
              label="Fecha de Ingreso"
              type="date"
              value={formData.fecha_ingreso || ''}
              onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Salario */}
            <FormInput
              label="Salario Base (Bs)"
              type="number"
              value={formData.salario || ''}
              onChange={(e) => handleChange('salario', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 4500"
              min="0"
              step="100"
            />

            {/* Campo: Tipo de Contrato */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Tipo de Contrato
              </label>
              <select
                value={formData.tipo_contrato || ''}
                onChange={(e) => handleChange('tipo_contrato', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="indefinido">Contrato Indefinido</option>
                <option value="plazo_fijo">Plazo Fijo</option>
                <option value="temporal">Temporal</option>
                <option value="practicante">Practicante</option>
              </select>
            </div>

            {/* Campo: Estado/Situación */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Estado
              </label>
              <select
                value={formData.estado || 'Activo'}
                onChange={(e) => handleChange('estado', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="Activo">Activo</option>
                <option value="Licencia">Licencia</option>
                <option value="Suspensión">Suspensión</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: INFORMACIÓN DE CONTACTO DE EMERGENCIA */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'emergencia' ? null : 'emergencia')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(248,113,113,.12), rgba(248,113,113,.04))',
            borderBottom: expandedSection === 'emergencia' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f87171' }}>
            🆘 Contacto de Emergencia
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'emergencia' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'emergencia' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Nombre Contacto de Emergencia */}
            <FormInput
              label="Nombre Contacto de Emergencia"
              value={formData.contacto_emergencia_nombre || ''}
              onChange={(e) => handleChange('contacto_emergencia_nombre', e.target.value)}
              disabled={submitting}
              placeholder="Ej: María López"
            />

            {/* Campo: Teléfono Contacto de Emergencia */}
            <FormInput
              label="Teléfono Contacto de Emergencia"
              value={formData.contacto_emergencia_tel || ''}
              onChange={(e) => handleChange('contacto_emergencia_tel', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 76654321"
            />

            {/* Campo: Relación con Contacto de Emergencia */}
            <FormInput
              label="Relación"
              value={formData.contacto_emergencia_relacion || ''}
              onChange={(e) => handleChange('contacto_emergencia_relacion', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Esposa, Hermano, etc"
            />
          </div>
        )}
      </div>

      {/* SECCIÓN 4: INFORMACIÓN ADICIONAL */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'adicional' ? null : 'adicional')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(251,191,36,.04))',
            borderBottom: expandedSection === 'adicional' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
            📝 Información Adicional
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'adicional' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'adicional' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {/* Campo: Dirección */}
            <FormInput
              label="Dirección"
              value={formData.direccion || ''}
              onChange={(e) => handleChange('direccion', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Calle Principal 123, Riberalta"
            />

            {/* Campo: Notas/Observaciones */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Notas/Observaciones
              </label>
              <textarea
                value={formData.notas || ''}
                onChange={(e) => handleChange('notas', e.target.value)}
                disabled={submitting}
                placeholder="Información adicional relevante..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPersonalDetallado;
