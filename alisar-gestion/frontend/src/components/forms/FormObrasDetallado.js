/**
 * FormObrasDetallado.js
 * Componente de formulario ampliado para gestión de obras/proyectos
 * Incluye validación, campos detallados, secciones expandibles y comentarios completos
 * Permite capturar información sobre ubicación, fases, personal responsable, presupuesto y cronograma
 */

import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import GoogleMapsLocation from '../common/GoogleMapsLocation';
import { validateRequired, validatePercentage, validatePositive } from '../../utils/validators';

/**
 * Componente FormObrasDetallado
 * Renderiza un formulario completo para crear/editar obras con campos extensos
 *
 * Estructura de secciones:
 * 1. Información General: Datos básicos del proyecto
 * 2. Ubicación y Fases: Localización geográfica y etapas del proyecto
 * 3. Personal y Responsables: Asignación de roles y responsabilidades
 * 4. Presupuesto y Cronograma: Información financiera y temporal
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario actual
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.submitting - Indica si se está enviando el formulario
 */
const FormObrasDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  /**
   * Estado para controlar qué sección está expandida
   */
  const [expandedSection, setExpandedSection] = useState('general');

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
      {/* SECCIÓN 1: INFORMACIÓN GENERAL                               */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'general' ? null : 'general')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(255,215,0,.12), rgba(255,215,0,.04))',
            borderBottom: expandedSection === 'general' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#FFD700' }}>
            📋 Información General
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'general' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'general' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Nombre de la Obra */}
            <FormInput
              label="Nombre de la Obra"
              value={formData.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              error={errors.nombre}
              disabled={submitting}
              required
              placeholder="Ej: Pavimentación Calle Principal"
            />

            {/* Campo: Código/Referencia */}
            <FormInput
              label="Código de Referencia"
              value={formData.codigo || ''}
              onChange={(e) => handleChange('codigo', e.target.value)}
              disabled={submitting}
              placeholder="Ej: OBR-2024-001"
            />

            {/* Campo: Descripción del Proyecto */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Descripción del Proyecto
              </label>
              <textarea
                value={formData.descripcion || ''}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                disabled={submitting}
                placeholder="Descripción detallada del proyecto..."
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
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Campo: Tipo de Obra */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Tipo de Obra
              </label>
              <select
                value={formData.tipo || ''}
                onChange={(e) => handleChange('tipo', e.target.value)}
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
                <option value="vial">Vial/Camino</option>
                <option value="edificacion">Edificación</option>
                <option value="saneamiento">Saneamiento</option>
                <option value="electrificacion">Electrificación</option>
                <option value="forestal">Forestal/Reforestación</option>
                <option value="otra">Otra</option>
              </select>
            </div>

            {/* Campo: Cliente/Solicitante */}
            <FormInput
              label="Cliente/Solicitante"
              value={formData.cliente || ''}
              onChange={(e) => handleChange('cliente', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Municipalidad de Riberalta"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: UBICACIÓN Y FASES                                 */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'ubicacion' ? null : 'ubicacion')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(96,165,250,.12), rgba(96,165,250,.04))',
            borderBottom: expandedSection === 'ubicacion' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#60a5fa' }}>
            📍 Ubicación y Fases
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'ubicacion' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'ubicacion' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Provincia */}
            <FormInput
              label="Provincia"
              value={formData.provincia || ''}
              onChange={(e) => handleChange('provincia', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Beni"
            />

            {/* Campo: Municipio */}
            <FormInput
              label="Municipio"
              value={formData.municipio || ''}
              onChange={(e) => handleChange('municipio', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Riberalta"
            />

            {/* Campo: Comunidad/Localidad */}
            <FormInput
              label="Comunidad/Localidad"
              value={formData.localidad || ''}
              onChange={(e) => handleChange('localidad', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Comunidad San Miguel"
            />

            {/* Campo: Dirección Exacta */}
            <FormInput
              label="Dirección Exacta"
              value={formData.direccion_exacta || ''}
              onChange={(e) => handleChange('direccion_exacta', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Calle Principal km 5"
            />

            {/* Campo: Ubicación Exacta con Google Maps */}
            <div style={{ gridColumn: '1 / -1' }}>
              <GoogleMapsLocation
                label="Ubicación Exacta de la Obra (GPS)"
                address={formData.ubicacion_obra || ''}
                coordinates={formData.ubicacion_obra_coords || { lat: null, lng: null }}
                onLocationChange={(data) => {
                  handleChange('ubicacion_obra', data.address);
                  handleChange('ubicacion_obra_coords', data.coordinates);
                }}
                placeholder="Buscar ubicación exacta de la obra..."
              />
            </div>

            {/* Campo: Fase Actual */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Fase Actual
              </label>
              <select
                value={formData.fase_actual || ''}
                onChange={(e) => handleChange('fase_actual', e.target.value)}
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
                <option value="planificacion">Planificación</option>
                <option value="diseño">Diseño/Proyecto</option>
                <option value="preparacion">Preparación del Terreno</option>
                <option value="ejecucion">Ejecución</option>
                <option value="acabados">Acabados</option>
                <option value="cierre">Cierre/Entrega</option>
                <option value="terminada">Terminada</option>
              </select>
            </div>

            {/* Campo: Porcentaje Avance */}
            <FormInput
              label="Porcentaje de Avance (%)"
              type="number"
              value={formData.avance || ''}
              onChange={(e) => handleChange('avance', e.target.value)}
              error={errors.avance}
              disabled={submitting}
              required
              placeholder="Ej: 45"
              min="0"
              max="100"
              step="5"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 3: PERSONAL Y RESPONSABLES                           */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'personal' ? null : 'personal')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(251,191,36,.04))',
            borderBottom: expandedSection === 'personal' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
            👥 Personal y Responsables
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'personal' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'personal' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Responsable Técnico */}
            <FormInput
              label="Responsable Técnico"
              value={formData.responsable_tecnico || ''}
              onChange={(e) => handleChange('responsable_tecnico', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Ing. Carlos López"
            />

            {/* Campo: Supervisor */}
            <FormInput
              label="Supervisor de Obra"
              value={formData.supervisor || ''}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Técnico Juan Pérez"
            />

            {/* Campo: Contratista */}
            <FormInput
              label="Contratista"
              value={formData.contratista || ''}
              onChange={(e) => handleChange('contratista', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Constructora ABC SRL"
            />

            {/* Campo: Personal Asignado */}
            <FormInput
              label="Personal Asignado (cantidad)"
              type="number"
              value={formData.personal_asignado || ''}
              onChange={(e) => handleChange('personal_asignado', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 15"
              min="0"
              step="1"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 4: PRESUPUESTO Y CRONOGRAMA                          */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'presupuesto' ? null : 'presupuesto')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(248,113,113,.12), rgba(248,113,113,.04))',
            borderBottom: expandedSection === 'presupuesto' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f87171' }}>
            💰 Presupuesto y Cronograma
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'presupuesto' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'presupuesto' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Presupuesto Total */}
            <FormInput
              label="Presupuesto Total (Bs)"
              type="number"
              value={formData.presupuesto || ''}
              onChange={(e) => handleChange('presupuesto', e.target.value)}
              error={errors.presupuesto}
              disabled={submitting}
              required
              placeholder="Ej: 500000"
              min="0"
              step="1000"
            />

            {/* Campo: Monto Ejecutado */}
            <FormInput
              label="Monto Ejecutado (Bs)"
              type="number"
              value={formData.monto_ejecutado || ''}
              onChange={(e) => handleChange('monto_ejecutado', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 225000"
              min="0"
              step="1000"
            />

            {/* Campo: Fecha Inicio Planeado */}
            <FormInput
              label="Fecha Inicio Planeado"
              type="date"
              value={formData.inicio_planeado || ''}
              onChange={(e) => handleChange('inicio_planeado', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Fecha Fin Planeado */}
            <FormInput
              label="Fecha Fin Planeado"
              type="date"
              value={formData.fin_planeado || ''}
              onChange={(e) => handleChange('fin_planeado', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Fecha Inicio Real */}
            <FormInput
              label="Fecha Inicio Real"
              type="date"
              value={formData.inicio_real || ''}
              onChange={(e) => handleChange('inicio_real', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Fecha Fin Real */}
            <FormInput
              label="Fecha Fin Real (Estimada)"
              type="date"
              value={formData.fin_real || ''}
              onChange={(e) => handleChange('fin_real', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Observaciones */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Observaciones y Notas
              </label>
              <textarea
                value={formData.observaciones || ''}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                disabled={submitting}
                placeholder="Problemas encontrados, cambios, retrasos..."
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

export default FormObrasDetallado;
