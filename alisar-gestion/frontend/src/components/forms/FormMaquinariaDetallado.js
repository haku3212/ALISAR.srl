// PENDIENTE: campos del backend desactualizados — expandir backend antes de usar
/**
 * FormMaquinariaDetallado.js
 * Componente de formulario ampliado para gestión de maquinaria
 * Incluye validación, campos detallados, secciones expandibles y comentarios completos
 * Permite capturar información técnica, operativa y de mantenimiento de equipos
 */

import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import GoogleMapsLocation from '../common/GoogleMapsLocation';
import { validateRequired, validatePositive, validateNonNegative } from '../../utils/validators';

/**
 * Componente FormMaquinariaDetallado
 * Renderiza un formulario completo para crear/editar maquinaria con campos extensos
 *
 * Estructura de secciones:
 * 1. Información Básica: Datos identificadores del equipo
 * 2. Especificaciones Técnicas: Características técnicas y de rendimiento
 * 3. Operación y Mantenimiento: Información de uso y mantenimiento
 * 4. Documentación: Referencias a documentos y garantías
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario actual
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.submitting - Indica si se está enviando el formulario
 */
const FormMaquinariaDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  /**
   * Estado para controlar qué sección está expandida
   * Solo una sección puede estar expandida al mismo tiempo
   */
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
      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 1: INFORMACIÓN BÁSICA                                */}
      {/* ═════════════════════════════════════════════════════════════ */}
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
            background: 'linear-gradient(135deg, rgba(255,215,0,.12), rgba(255,215,0,.04))',
            borderBottom: expandedSection === 'basico' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#FFD700' }}>
            🏗️ Información Básica
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'basico' ? '▼' : '▶'}
          </span>
        </div>

        {/* Contenido de la sección - Se muestra/oculta según expandedSection */}
        {expandedSection === 'basico' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Nombre/Descripción del equipo */}
            <FormInput
              label="Nombre/Descripción"
              value={formData.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              error={errors.nombre}
              disabled={submitting}
              required
              placeholder="Ej: Motoniveladora CAT 12G"
            />

            {/* Campo: Tipo de Maquinaria */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Tipo de Maquinaria
              </label>
              <select
                value={formData.tipo || ''}
                onChange={(e) => handleChange('tipo', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: errors.tipo ? '1px solid #f87171' : '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="motoniveladora">Motoniveladora</option>
                <option value="excavadora">Excavadora</option>
                <option value="cargadora">Cargadora Frontal</option>
                <option value="rodillo">Rodillo Compactador</option>
                <option value="volquete">Volquete</option>
                <option value="hormigonera">Hormigonera</option>
                <option value="aserrador">Aserrador</option>
                <option value="otra">Otra</option>
              </select>
            </div>

            {/* Campo: Modelo */}
            <FormInput
              label="Modelo"
              value={formData.modelo || ''}
              onChange={(e) => handleChange('modelo', e.target.value)}
              disabled={submitting}
              placeholder="Ej: CAT 120M, JCB 3CX"
            />

            {/* Campo: Año de Fabricación */}
            <FormInput
              label="Año de Fabricación"
              type="number"
              value={formData.anio || ''}
              onChange={(e) => handleChange('anio', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 2018"
              min="1950"
              max={new Date().getFullYear()}
            />

            {/* Campo: Número de Serie */}
            <FormInput
              label="Número de Serie"
              value={formData.numero_serie || ''}
              onChange={(e) => handleChange('numero_serie', e.target.value)}
              disabled={submitting}
              placeholder="Ej: SN-12345-AB"
            />

            {/* Campo: Placa de Registro */}
            <FormInput
              label="Placa de Registro"
              value={formData.placa || ''}
              onChange={(e) => handleChange('placa', e.target.value)}
              disabled={submitting}
              placeholder="Ej: AB-12345"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: ESPECIFICACIONES TÉCNICAS                         */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'tecnico' ? null : 'tecnico')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(96,165,250,.12), rgba(96,165,250,.04))',
            borderBottom: expandedSection === 'tecnico' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#60a5fa' }}>
            ⚙️ Especificaciones Técnicas
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'tecnico' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'tecnico' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Potencia (HP) */}
            <FormInput
              label="Potencia (HP)"
              type="number"
              value={formData.potencia || ''}
              onChange={(e) => handleChange('potencia', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 150"
              min="0"
              step="10"
            />

            {/* Campo: Capacidad de Carga */}
            <FormInput
              label="Capacidad de Carga (Toneladas)"
              type="number"
              value={formData.capacidad_carga || ''}
              onChange={(e) => handleChange('capacidad_carga', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 5"
              min="0"
              step="0.5"
            />

            {/* Campo: Consumo de Combustible */}
            <FormInput
              label="Consumo de Combustible (L/h)"
              type="number"
              value={formData.consumo_combustible || ''}
              onChange={(e) => handleChange('consumo_combustible', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 25.5"
              min="0"
              step="0.5"
            />

            {/* Campo: Tipo de Combustible */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Tipo de Combustible
              </label>
              <select
                value={formData.tipo_combustible || ''}
                onChange={(e) => handleChange('tipo_combustible', e.target.value)}
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
                <option value="diesel">Diesel</option>
                <option value="gasolina">Gasolina</option>
                <option value="gas">Gas</option>
                <option value="electrico">Eléctrico</option>
              </select>
            </div>

            {/* Campo: Ancho de Trabajo */}
            <FormInput
              label="Ancho de Trabajo (metros)"
              type="number"
              value={formData.ancho_trabajo || ''}
              onChange={(e) => handleChange('ancho_trabajo', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 3.5"
              min="0"
              step="0.1"
            />

            {/* Campo: Profundidad Máxima */}
            <FormInput
              label="Profundidad Máxima (metros)"
              type="number"
              value={formData.profundidad_maxima || ''}
              onChange={(e) => handleChange('profundidad_maxima', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 2.5"
              min="0"
              step="0.1"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 3: OPERACIÓN Y MANTENIMIENTO                         */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'operacion' ? null : 'operacion')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(251,191,36,.04))',
            borderBottom: expandedSection === 'operacion' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
            🔧 Operación y Mantenimiento
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'operacion' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'operacion' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Estado Actual */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Estado Actual
              </label>
              <select
                value={formData.estado || 'Operativo'}
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
                <option value="Operativo">Operativo</option>
                <option value="Mantenimiento">En Mantenimiento</option>
                <option value="Reparacion">En Reparación</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Desmantelado">Desmantelado</option>
              </select>
            </div>

            {/* Campo: Horas de Operación */}
            <FormInput
              label="Horas de Operación Totales"
              type="number"
              value={formData.horas_operacion || ''}
              onChange={(e) => handleChange('horas_operacion', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 5000"
              min="0"
              step="100"
            />

            {/* Campo: Próximo Mantenimiento */}
            <FormInput
              label="Próximo Mantenimiento"
              type="date"
              value={formData.mantenimiento_proximo || ''}
              onChange={(e) => handleChange('mantenimiento_proximo', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Última Revisión */}
            <FormInput
              label="Última Revisión Técnica"
              type="date"
              value={formData.ultima_revision || ''}
              onChange={(e) => handleChange('ultima_revision', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Operador Asignado */}
            <FormInput
              label="Operador Asignado"
              value={formData.operador_asignado || ''}
              onChange={(e) => handleChange('operador_asignado', e.target.value)}
              disabled={submitting}
              placeholder="Nombre del operador"
            />

            {/* Campo: Costo de Mantenimiento Anual */}
            <FormInput
              label="Costo Mantenimiento Anual (Bs)"
              type="number"
              value={formData.costo_mantenimiento_anual || ''}
              onChange={(e) => handleChange('costo_mantenimiento_anual', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 5000"
              min="0"
              step="100"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 4: DOCUMENTACIÓN Y REFERENCIAS                       */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'documentacion' ? null : 'documentacion')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(248,113,113,.12), rgba(248,113,113,.04))',
            borderBottom: expandedSection === 'documentacion' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f87171' }}>
            📄 Documentación
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'documentacion' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'documentacion' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {/* Campo: Número de Garantía */}
            <FormInput
              label="Número de Garantía"
              value={formData.numero_garantia || ''}
              onChange={(e) => handleChange('numero_garantia', e.target.value)}
              disabled={submitting}
              placeholder="Ej: GAR-2024-12345"
            />

            {/* Campo: Fecha de Vencimiento de Garantía */}
            <FormInput
              label="Vencimiento de Garantía"
              type="date"
              value={formData.fecha_vencimiento_garantia || ''}
              onChange={(e) => handleChange('fecha_vencimiento_garantia', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Documento de Adquisición */}
            <FormInput
              label="Documento de Adquisición"
              value={formData.documento_adquisicion || ''}
              onChange={(e) => handleChange('documento_adquisicion', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Factura #001234"
            />

            {/* Campo: Ubicación del Equipo con Google Maps */}
            <div style={{ gridColumn: '1 / -1' }}>
              <GoogleMapsLocation
                label="Ubicación del Equipo (GPS)"
                address={formData.ubicacion_equipo || ''}
                coordinates={formData.ubicacion_coords || { lat: null, lng: null }}
                onLocationChange={(data) => {
                  handleChange('ubicacion_equipo', data.address);
                  handleChange('ubicacion_coords', data.coordinates);
                }}
                placeholder="Buscar ubicación del equipo..."
              />
            </div>

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

export default FormMaquinariaDetallado;
