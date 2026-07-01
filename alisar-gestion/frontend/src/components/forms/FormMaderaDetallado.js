/**
 * FormMaderaDetallado.js
 * Componente de formulario ampliado para gestión de inventario de madera
 * Incluye validación, campos detallados, secciones expandibles y comentarios completos
 * Permite capturar información sobre especies, dimensiones, calidad y ubicación del inventario
 */

import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import GoogleMapsLocation from '../common/GoogleMapsLocation';
import { validateRequired, validatePositive, validateNonNegative } from '../../utils/validators';

/**
 * Componente FormMaderaDetallado
 * Renderiza un formulario completo para crear/editar registros de madera con campos extensos
 *
 * Estructura de secciones:
 * 1. Información de Especie: Tipo de madera y características botánicas
 * 2. Dimensiones y Medidas: Medidas físicas de las piezas
 * 3. Calidad y Condición: Grado de calidad y estado de conservación
 * 4. Ubicación y Logística: Dónde se encuentra y referencias logísticas
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario actual
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.submitting - Indica si se está enviando el formulario
 */
const FormMaderaDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  /**
   * Estado para controlar qué sección está expandida
   */
  const [expandedSection, setExpandedSection] = useState('especie');

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
      {/* SECCIÓN 1: INFORMACIÓN DE ESPECIE                            */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'especie' ? null : 'especie')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(255,215,0,.12), rgba(255,215,0,.04))',
            borderBottom: expandedSection === 'especie' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#FFD700' }}>
            🌳 Información de Especie
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'especie' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'especie' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Especie de Madera */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Especie de Madera
              </label>
              <select
                value={formData.especie || ''}
                onChange={(e) => handleChange('especie', e.target.value)}
                error={errors.especie}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: errors.especie ? '1px solid #f87171' : '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="cedro">Cedro</option>
                <option value="caoba">Caoba</option>
                <option value="ocote">Ocote</option>
                <option value="mara">Mará</option>
                <option value="roble">Roble</option>
                <option value="teca">Teca</option>
                <option value="pino">Pino</option>
                <option value="otra">Otra</option>
              </select>
            </div>

            {/* Campo: Nombre Común */}
            <FormInput
              label="Nombre Común"
              value={formData.nombre_comun || ''}
              onChange={(e) => handleChange('nombre_comun', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Cedro Rojo, Caoba Brasileña"
            />

            {/* Campo: Nombre Científico */}
            <FormInput
              label="Nombre Científico"
              value={formData.nombre_cientifico || ''}
              onChange={(e) => handleChange('nombre_cientifico', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Cedrela odorata"
            />

            {/* Campo: Procedencia/Origen */}
            <FormInput
              label="Procedencia/Origen"
              value={formData.procedencia || ''}
              onChange={(e) => handleChange('procedencia', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Comunidad Indígena San Miguel"
            />

            {/* Campo: Destino de la Madera */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Destino de la Madera
              </label>
              <select
                value={formData.destino || ''}
                onChange={(e) => handleChange('destino', e.target.value)}
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
                <option value="construccion">Construcción</option>
                <option value="muebles">Muebles</option>
                <option value="ebanisteria">Ebanistería</option>
                <option value="revestimiento">Revestimiento</option>
                <option value="energia">Energía/Combustible</option>
                <option value="pulpa">Pulpa/Papel</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Campo: Tipo de Corte */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Tipo de Corte
              </label>
              <select
                value={formData.tipo_corte || ''}
                onChange={(e) => handleChange('tipo_corte', e.target.value)}
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
                <option value="tabla">Tabla</option>
                <option value="viga">Viga</option>
                <option value="bloque">Bloque</option>
                <option value="rollizo">Rollizo</option>
                <option value="aserrado">Aserrado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: DIMENSIONES Y MEDIDAS                             */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'dimensiones' ? null : 'dimensiones')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(96,165,250,.12), rgba(96,165,250,.04))',
            borderBottom: expandedSection === 'dimensiones' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#60a5fa' }}>
            📏 Dimensiones y Medidas
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'dimensiones' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'dimensiones' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Largo (metros) */}
            <FormInput
              label="Largo (metros)"
              type="number"
              value={formData.largo || ''}
              onChange={(e) => handleChange('largo', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 4.5"
              min="0"
              step="0.1"
            />

            {/* Campo: Ancho (centímetros) */}
            <FormInput
              label="Ancho (centímetros)"
              type="number"
              value={formData.ancho || ''}
              onChange={(e) => handleChange('ancho', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 25"
              min="0"
              step="0.5"
            />

            {/* Campo: Espesor (centímetros) */}
            <FormInput
              label="Espesor (centímetros)"
              type="number"
              value={formData.espesor || ''}
              onChange={(e) => handleChange('espesor', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 5"
              min="0"
              step="0.5"
            />

            {/* Campo: Volumen Total (metros cúbicos) */}
            <FormInput
              label="Volumen Total (m³)"
              type="number"
              value={formData.volumen || ''}
              onChange={(e) => handleChange('volumen', e.target.value)}
              error={errors.volumen}
              disabled={submitting}
              required
              placeholder="Ej: 2.5"
              min="0"
              step="0.1"
            />

            {/* Campo: Cantidad de Piezas */}
            <FormInput
              label="Cantidad de Piezas"
              type="number"
              value={formData.piezas || ''}
              onChange={(e) => handleChange('piezas', e.target.value)}
              error={errors.piezas}
              disabled={submitting}
              required
              placeholder="Ej: 50"
              min="0"
              step="1"
            />

            {/* Campo: Peso Estimado (toneladas) */}
            <FormInput
              label="Peso Estimado (toneladas)"
              type="number"
              value={formData.peso_estimado || ''}
              onChange={(e) => handleChange('peso_estimado', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 3.2"
              min="0"
              step="0.1"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 3: CALIDAD Y CONDICIÓN                               */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'calidad' ? null : 'calidad')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(251,191,36,.04))',
            borderBottom: expandedSection === 'calidad' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
            ⭐ Calidad y Condición
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'calidad' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'calidad' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Grado de Calidad */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Grado de Calidad
              </label>
              <select
                value={formData.grado_calidad || ''}
                onChange={(e) => handleChange('grado_calidad', e.target.value)}
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
                <option value="premium">Premium (Exportación)</option>
                <option value="primera">Primera Calidad</option>
                <option value="segunda">Segunda Calidad</option>
                <option value="tercera">Tercera Calidad</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            {/* Campo: Estado de Conservación */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Estado de Conservación
              </label>
              <select
                value={formData.estado_conservacion || ''}
                onChange={(e) => handleChange('estado_conservacion', e.target.value)}
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
                <option value="excelente">Excelente</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="deficiente">Deficiente</option>
              </select>
            </div>

            {/* Campo: Porcentaje Humedad */}
            <FormInput
              label="Porcentaje de Humedad (%)"
              type="number"
              value={formData.humedad || ''}
              onChange={(e) => handleChange('humedad', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 18"
              min="0"
              max="100"
              step="1"
            />

            {/* Campo: Defectos Presentes */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Defectos Presentes
              </label>
              <textarea
                value={formData.defectos || ''}
                onChange={(e) => handleChange('defectos', e.target.value)}
                disabled={submitting}
                placeholder="Ej: grietas, nudos, alabeo..."
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
                  minHeight: '70px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 4: UBICACIÓN Y LOGÍSTICA                             */}
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
            background: 'linear-gradient(135deg, rgba(248,113,113,.12), rgba(248,113,113,.04))',
            borderBottom: expandedSection === 'ubicacion' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f87171' }}>
            📦 Ubicación y Logística
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'ubicacion' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'ubicacion' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Campamento/Depósito */}
            <FormInput
              label="Campamento/Depósito"
              value={formData.campamento || ''}
              onChange={(e) => handleChange('campamento', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Depósito Central"
            />

            {/* Campo: Ubicación Exacta */}
            <FormInput
              label="Ubicación Exacta"
              value={formData.ubicacion_exacta || ''}
              onChange={(e) => handleChange('ubicacion_exacta', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Fila 3, Pila 5"
            />

            {/* Campo: Ubicación del Campamento/Depósito con Google Maps */}
            <div style={{ gridColumn: '1 / -1' }}>
              <GoogleMapsLocation
                label="Ubicación del Campamento/Depósito (GPS)"
                address={formData.ubicacion_campamento || ''}
                coordinates={formData.ubicacion_campamento_coords || { lat: null, lng: null }}
                onLocationChange={(data) => {
                  handleChange('ubicacion_campamento', data.address);
                  handleChange('ubicacion_campamento_coords', data.coordinates);
                }}
                placeholder="Buscar ubicación del campamento o depósito..."
              />
            </div>

            {/* Campo: Fecha de Recepción */}
            <FormInput
              label="Fecha de Recepción"
              type="date"
              value={formData.fecha_recepcion || ''}
              onChange={(e) => handleChange('fecha_recepcion', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Fecha de Aserrado */}
            <FormInput
              label="Fecha de Aserrado/Procesamiento"
              type="date"
              value={formData.fecha_aserrado || ''}
              onChange={(e) => handleChange('fecha_aserrado', e.target.value)}
              disabled={submitting}
            />

            {/* Campo: Precio Unitario */}
            <FormInput
              label="Precio Unitario (Bs/m³)"
              type="number"
              value={formData.precio_unitario || ''}
              onChange={(e) => handleChange('precio_unitario', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 800"
              min="0"
              step="100"
            />

            {/* Campo: Valor Total */}
            <FormInput
              label="Valor Total (Bs)"
              type="number"
              value={formData.valor_total || ''}
              onChange={(e) => handleChange('valor_total', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 2000"
              min="0"
              step="100"
            />

            {/* Campo: Notas */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Notas y Observaciones
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

export default FormMaderaDetallado;
