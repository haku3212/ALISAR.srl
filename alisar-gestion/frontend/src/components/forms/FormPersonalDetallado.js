/**
 * FormPersonalDetallado.js - VERSIÓN MEJORADA
 * Componente de formulario ampliado para gestión de personal
 * ✨ Nuevas características:
 *    - Colores corporativos: Amarillo (#FFD700) y Negro (#000000)
 *    - Integración con Google Maps para ubicación
 *    - Validaciones mejoradas
 *    - Secciones expandibles/colapsables
 *    - Comentarios completos
 *    - Mejor UX y accesibilidad
 */

import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import GoogleMapsLocation from '../common/GoogleMapsLocation';

/**
 * Componente FormPersonalDetallado
 * Renderiza un formulario completo para crear/editar personal con 4 secciones
 *
 * Estructura de secciones:
 * 1. Información Básica: Datos personales identificadores
 * 2. Información Laboral: Cargo, departamento, contrato
 * 3. Contacto de Emergencia: Información crítica de emergencias
 * 4. Información Adicional: Dirección con Google Maps y notas
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario actual
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.submitting - Indica si se está enviando el formulario
 */
const FormPersonalDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  // ═══════════════════════════════════════════════════════════
  // ESTADO LOCAL
  // ═══════════════════════════════════════════════════════════

  /**
   * Control de sección expandida
   * Solo una sección puede estar expandida al mismo tiempo
   */
  const [expandedSection, setExpandedSection] = useState('basico');

  // ═══════════════════════════════════════════════════════════
  // FUNCIONES MANEJADORAS
  // ═══════════════════════════════════════════════════════════

  /**
   * Manejador para cambios en los inputs de texto
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

  /**
   * Manejador para cambios de ubicación desde Google Maps
   * Guarda dirección y coordenadas
   * @param {Object} locationData - {address, coordinates: {lat, lng}}
   */
  const handleLocationChange = (locationData) => {
    handleChange('direccion', locationData.address);
    handleChange('ubicacion_coordenadas', locationData.coordinates);
  };

  /**
   * Estilos reutilizables para mantener consistencia
   */
  const styles = {
    sectionContainer: {
      background: '#1a1a1a',
      border: '1px solid #333333',
      borderRadius: '14px',
      overflow: 'hidden',
      marginBottom: '16px'
    },
    sectionHeader: (color) => ({
      padding: '14px 16px',
      background: `linear-gradient(135deg, rgba(${color.r}, ${color.g}, ${color.b}, 0.12), rgba(${color.r}, ${color.g}, ${color.b}, 0.04))`,
      borderBottom: '1px solid #333333',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.2s ease',
      userSelect: 'none'
    }),
    sectionTitle: (color) => ({
      margin: 0,
      fontSize: '14px',
      fontWeight: '600',
      color: `rgb(${color.r}, ${color.g}, ${color.b})`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }),
    sectionContent: {
      padding: '16px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    fieldLabel: {
      display: 'block',
      marginBottom: '8px',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  /**
   * Colores corporativos RGB
   */
  const colors = {
    primary: { r: 255, g: 215, b: 0 },      // Amarillo corporativo
    secondary: { r: 96, g: 165, b: 250 },   // Azul
    tertiary: { r: 251, g: 191, b: 36 },    // Naranja
    danger: { r: 248, g: 113, b: 113 }      // Rojo
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      <div style={styles.sectionContainer}>
        {/* Encabezado - Clickeable para expandir/contraer */}
        <div
          onClick={() => setExpandedSection(expandedSection === 'basico' ? null : 'basico')}
          style={styles.sectionHeader(colors.primary)}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <h3 style={styles.sectionTitle(colors.primary)}>
            👤 Información Básica
          </h3>
          <span style={{ color: '#999999', fontSize: '16px', transition: 'transform 0.2s' }}>
            {expandedSection === 'basico' ? '▼' : '▶'}
          </span>
        </div>

        {/* Contenido expandible */}
        {expandedSection === 'basico' && (
          <div style={styles.sectionContent}>
            {/* Campo: Nombre Completo */}
            <FormInput
              label="Nombre Completo *"
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
              <label style={styles.fieldLabel}>Género</label>
              <select
                value={formData.genero || ''}
                onChange={(e) => handleChange('genero', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: errors.genero ? '1px solid #f87171' : '1px solid #333333',
                  background: '#252525',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  opacity: submitting ? 0.6 : 1
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

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: INFORMACIÓN LABORAL */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      <div style={styles.sectionContainer}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'laboral' ? null : 'laboral')}
          style={styles.sectionHeader(colors.secondary)}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <h3 style={styles.sectionTitle(colors.secondary)}>
            💼 Información Laboral
          </h3>
          <span style={{ color: '#999999', fontSize: '16px' }}>
            {expandedSection === 'laboral' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'laboral' && (
          <div style={styles.sectionContent}>
            {/* Campo: Cargo/Puesto */}
            <FormInput
              label="Cargo *"
              value={formData.cargo || ''}
              onChange={(e) => handleChange('cargo', e.target.value)}
              error={errors.cargo}
              disabled={submitting}
              required
              placeholder="Ej: Operador de Motoniveladora"
            />

            {/* Campo: Departamento */}
            <div>
              <label style={styles.fieldLabel}>Departamento</label>
              <select
                value={formData.departamento || ''}
                onChange={(e) => handleChange('departamento', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #333333',
                  background: '#252525',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="operaciones">Operaciones</option>
                <option value="administrativo">Administrativo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="seguridad">Seguridad</option>
                <option value="recursos-humanos">Recursos Humanos</option>
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
              <label style={styles.fieldLabel}>Tipo de Contrato</label>
              <select
                value={formData.tipo_contrato || ''}
                onChange={(e) => handleChange('tipo_contrato', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #333333',
                  background: '#252525',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: submitting ? 0.6 : 1
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
              <label style={styles.fieldLabel}>Estado</label>
              <select
                value={formData.estado || 'Activo'}
                onChange={(e) => handleChange('estado', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #333333',
                  background: '#252525',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: submitting ? 0.6 : 1
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

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 3: CONTACTO DE EMERGENCIA */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      <div style={styles.sectionContainer}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'emergencia' ? null : 'emergencia')}
          style={styles.sectionHeader(colors.tertiary)}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <h3 style={styles.sectionTitle(colors.tertiary)}>
            🆘 Contacto de Emergencia
          </h3>
          <span style={{ color: '#999999', fontSize: '16px' }}>
            {expandedSection === 'emergencia' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'emergencia' && (
          <div style={styles.sectionContent}>
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

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 4: INFORMACIÓN ADICIONAL + GOOGLE MAPS */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      <div style={styles.sectionContainer}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'adicional' ? null : 'adicional')}
          style={styles.sectionHeader(colors.danger)}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <h3 style={styles.sectionTitle(colors.danger)}>
            📍 Ubicación y Notas
          </h3>
          <span style={{ color: '#999999', fontSize: '16px' }}>
            {expandedSection === 'adicional' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'adicional' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Campo: Ubicación con Google Maps - ANCHO COMPLETO */}
            <GoogleMapsLocation
              label="Dirección con Ubicación GPS"
              address={formData.direccion || ''}
              coordinates={formData.ubicacion_coordenadas || { lat: -14.8391, lng: -65.3672 }}
              onLocationChange={handleLocationChange}
              disabled={submitting}
              placeholder="Buscar dirección en Google Maps..."
            />

            {/* Campo: Notas/Observaciones - ANCHO COMPLETO */}
            <div>
              <label style={styles.fieldLabel}>Notas/Observaciones</label>
              <textarea
                value={formData.notas || ''}
                onChange={(e) => handleChange('notas', e.target.value)}
                disabled={submitting}
                placeholder="Información adicional relevante..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #333333',
                  background: '#252525',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                  opacity: submitting ? 0.6 : 1
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* INDICADORES DE VALIDACIÓN */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#f87171',
          fontSize: '13px',
          marginBottom: '8px'
        }}>
          ⚠️ Por favor, corrige los errores indicados en el formulario
        </div>
      )}
    </div>
  );
};

export default FormPersonalDetallado;
