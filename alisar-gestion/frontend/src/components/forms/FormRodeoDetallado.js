/**
 * FormRodeoDetallado.js
 * Componente de formulario para registrar rodeos (operaciones forestales)
 * Basado en los requerimientos del sistema ALISAR
 * Registra: fecha, volumen, especies, origen, destino, responsable y documentación
 */

import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import GoogleMapsLocation from '../common/GoogleMapsLocation';
import { validateRequired, validatePositive, validateDate } from '../../utils/validators';

/**
 * Componente FormRodeoDetallado
 * Renderiza un formulario para crear/editar rodeos con secciones expandibles
 *
 * Un rodeo comprende: tumbado, jalado, cargado y transporte de madera
 * Datos a registrar: fecha, volumen (m³), especies, origen, destino, responsable
 *
 * Estructura de secciones:
 * 1. Información del Rodeo: Fecha, Volumen, Responsable
 * 2. Especies y Origen: Tipos de madera, Procedencia
 * 3. Destino y Logística: Ubicación destino, Contrato, Google Maps
 * 4. Documentación: Permisos forestales, Notas
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario actual
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.submitting - Indica si se está enviando el formulario
 */
const FormRodeoDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  /**
   * Estado para controlar qué sección está expandida
   */
  const [expandedSection, setExpandedSection] = useState('rodeo');

  /**
   * Manejador para cambios en los inputs
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
      {/* SECCIÓN 1: INFORMACIÓN DEL RODEO                             */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'rodeo' ? null : 'rodeo')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(255,215,0,.12), rgba(255,215,0,.04))',
            borderBottom: expandedSection === 'rodeo' ? '1px solid #374151' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#FFD700' }}>
            🪚 Información del Rodeo
          </h3>
          <span style={{ color: '#9ca3af' }}>
            {expandedSection === 'rodeo' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'rodeo' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Fecha del Rodeo */}
            <FormInput
              label="Fecha del Rodeo"
              type="date"
              value={formData.fecha_rodeo || ''}
              onChange={(e) => handleChange('fecha_rodeo', e.target.value)}
              error={errors.fecha_rodeo}
              disabled={submitting}
              required
            />

            {/* Campo: Volumen Total en m³ */}
            <FormInput
              label="Volumen Total (m³)"
              type="number"
              value={formData.volumen_total || ''}
              onChange={(e) => handleChange('volumen_total', e.target.value)}
              error={errors.volumen_total}
              disabled={submitting}
              required
              placeholder="Ej: 50.5"
              min="0"
              step="0.1"
            />

            {/* Campo: Responsable del Rodeo */}
            <FormInput
              label="Responsable del Rodeo"
              value={formData.responsable_rodeo || ''}
              onChange={(e) => handleChange('responsable_rodeo', e.target.value)}
              error={errors.responsable_rodeo}
              disabled={submitting}
              required
              placeholder="Ej: Jefe de Monte / Ingeniero"
            />

            {/* Campo: Contrato/Proyecto Asociado */}
            <FormInput
              label="Contrato/Proyecto Asociado"
              value={formData.contrato_asociado || ''}
              onChange={(e) => handleChange('contrato_asociado', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Proyecto ABC-2024-001"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: ESPECIES Y ORIGEN                                 */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'especies' ? null : 'especies')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(96,165,250,.12), rgba(96,165,250,.04))',
            borderBottom: expandedSection === 'especies' ? '1px solid #374151' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#60a5fa' }}>
            🌳 Especies y Origen
          </h3>
          <span style={{ color: '#9ca3af' }}>
            {expandedSection === 'especies' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'especies' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Especies Principales */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e0e0e0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Especies Principales
              </label>
              <select
                value={formData.especie_principal || ''}
                onChange={(e) => handleChange('especie_principal', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #374151',
                  background: '#111827',
                  color: '#e0e0e0',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="cedro">Cedro</option>
                <option value="caoba">Caoba</option>
                <option value="mara">Mará</option>
                <option value="roble">Roble</option>
                <option value="teca">Teca</option>
                <option value="ocote">Ocote</option>
                <option value="pino">Pino</option>
                <option value="varias">Varias Especies</option>
                <option value="otra">Otra</option>
              </select>
            </div>

            {/* Campo: Otras Especies */}
            <FormInput
              label="Otras Especies (si aplica)"
              value={formData.otras_especies || ''}
              onChange={(e) => handleChange('otras_especies', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Cedro, Caoba, Mará"
            />

            {/* Campo: Procedencia/Origen */}
            <FormInput
              label="Procedencia (Origen del Bosque)"
              value={formData.procedencia || ''}
              onChange={(e) => handleChange('procedencia', e.target.value)}
              error={errors.procedencia}
              disabled={submitting}
              required
              placeholder="Ej: Comunidad San Miguel, Zona Norte"
            />

            {/* Campo: Ubicación de Origen con Google Maps */}
            <div>
              <GoogleMapsLocation
                label="Ubicación de Origen (GPS)"
                address={formData.ubicacion_origen || ''}
                coordinates={formData.ubicacion_origen_coords || { lat: null, lng: null }}
                onLocationChange={(data) => {
                  handleChange('ubicacion_origen', data.address);
                  handleChange('ubicacion_origen_coords', data.coordinates);
                }}
                placeholder="Buscar ubicación de extracción..."
              />
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 3: DESTINO Y LOGÍSTICA                               */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'destino' ? null : 'destino')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(251,191,36,.04))',
            borderBottom: expandedSection === 'destino' ? '1px solid #374151' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
            🚛 Destino y Logística
          </h3>
          <span style={{ color: '#9ca3af' }}>
            {expandedSection === 'destino' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'destino' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Destino Final */}
            <FormInput
              label="Destino Final"
              value={formData.destino_final || ''}
              onChange={(e) => handleChange('destino_final', e.target.value)}
              error={errors.destino_final}
              disabled={submitting}
              required
              placeholder="Ej: Depósito Central, Aserradero XYZ"
            />

            {/* Campo: Ubicación de Destino con Google Maps */}
            <div>
              <GoogleMapsLocation
                label="Ubicación de Destino (GPS)"
                address={formData.ubicacion_destino || ''}
                coordinates={formData.ubicacion_destino_coords || { lat: null, lng: null }}
                onLocationChange={(data) => {
                  handleChange('ubicacion_destino', data.address);
                  handleChange('ubicacion_destino_coords', data.coordinates);
                }}
                placeholder="Buscar ubicación de destino..."
              />
            </div>

            {/* Campo: Fecha de Transporte */}
            <FormInput
              label="Fecha de Transporte"
              type="date"
              value={formData.fecha_transporte || ''}
              onChange={(e) => handleChange('fecha_transporte', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Estado de Operación */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e0e0e0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Estado de Operación
              </label>
              <select
                value={formData.estado_operacion || 'En Proceso'}
                onChange={(e) => handleChange('estado_operacion', e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #374151',
                  background: '#111827',
                  color: '#e0e0e0',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="Planificado">Planificado</option>
                <option value="En Proceso">En Proceso</option>
                <option value="En Transporte">En Transporte</option>
                <option value="Entregado">Entregado</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 4: DOCUMENTACIÓN Y PERMISOS                          */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'documentacion' ? null : 'documentacion')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(248,113,113,.12), rgba(248,113,113,.04))',
            borderBottom: expandedSection === 'documentacion' ? '1px solid #374151' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f87171' }}>
            📋 Documentación y Permisos
          </h3>
          <span style={{ color: '#9ca3af' }}>
            {expandedSection === 'documentacion' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'documentacion' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: POAT (Plan Operativo Anual) */}
            <FormInput
              label="POAT (Plan Operativo Anual)"
              value={formData.poat_numero || ''}
              onChange={(e) => handleChange('poat_numero', e.target.value)}
              disabled={submitting}
              placeholder="Ej: POAT-2024-001"
            />

            {/* Campo: Fecha de Vencimiento POAT */}
            <FormInput
              label="Vencimiento del POAT"
              type="date"
              value={formData.poat_vencimiento || ''}
              onChange={(e) => handleChange('poat_vencimiento', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Otros Permisos Forestales */}
            <FormInput
              label="Otros Permisos Forestales"
              value={formData.otros_permisos || ''}
              onChange={(e) => handleChange('otros_permisos', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Permiso de Extracción, Guía Forestal"
            />

            {/* Campo: Fecha Límite de Permisos */}
            <FormInput
              label="Fecha Límite de Permisos"
              type="date"
              value={formData.fecha_limite_permisos || ''}
              onChange={(e) => handleChange('fecha_limite_permisos', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Notas y Observaciones */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e0e0e0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Observaciones y Notas
              </label>
              <textarea
                value={formData.observaciones || ''}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                disabled={submitting}
                placeholder="Información adicional, incidencias, cambios en la operación..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #374151',
                  background: '#111827',
                  color: '#e0e0e0',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormRodeoDetallado;
