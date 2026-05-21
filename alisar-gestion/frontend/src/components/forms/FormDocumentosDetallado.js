/**
 * FormDocumentosDetallado.js
 * Componente de formulario para registrar y gestionar documentos
 * Incluye permisos forestales, contratos, certificados, etc.
 * Soporta control de vencimientos y alertas
 */

import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import { validateRequired, validateDate } from '../../utils/validators';

/**
 * Componente FormDocumentosDetallado
 * Renderiza un formulario para crear/editar documentos con secciones expandibles
 *
 * Tipos de documentos soportados:
 * - POAT (Plan Operativo Anual Forestal)
 * - Contrato (con clientes)
 * - Guía Forestal
 * - Certificado de Operación
 * - Permiso de Extracción
 * - Certificado de Inspección
 * - Otros permisos
 *
 * Estructura de secciones:
 * 1. Información Básica: Tipo, Número, Entidad
 * 2. Fechas y Validez: Emisión, Vencimiento
 * 3. Asociación: A qué rodeo/proyecto/máquina está asociado
 * 4. Documentación: Referencias de archivo, observaciones
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario actual
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Object} props.errors - Errores de validación
 * @param {boolean} props.submitting - Indica si se está enviando el formulario
 */
const FormDocumentosDetallado = ({ formData, onChange, errors = {}, submitting = false }) => {
  /**
   * Estado para controlar qué sección está expandida
   */
  const [expandedSection, setExpandedSection] = useState('basico');

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

  /**
   * Calcula los días hasta vencimiento
   */
  const calcularDiasVencimiento = () => {
    if (!formData.fecha_vencimiento) return null;
    const hoy = new Date();
    const vencimiento = new Date(formData.fecha_vencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasVencimiento = calcularDiasVencimiento();

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
            📋 Información Básica
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'basico' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'basico' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Tipo de Documento */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e7ebe5',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Tipo de Documento
              </label>
              <select
                value={formData.tipo_documento || ''}
                onChange={(e) => handleChange('tipo_documento', e.target.value)}
                error={errors.tipo_documento}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: errors.tipo_documento ? '1px solid #f87171' : '1px solid #28342a',
                  background: '#0d1410',
                  color: '#e7ebe5',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="POAT">POAT (Plan Operativo Anual Forestal)</option>
                <option value="contrato">Contrato con Cliente</option>
                <option value="guia_forestal">Guía Forestal</option>
                <option value="permiso_extraccion">Permiso de Extracción</option>
                <option value="certificado_operacion">Certificado de Operación</option>
                <option value="certificado_inspeccion">Certificado de Inspección</option>
                <option value="licencia_ambiental">Licencia Ambiental</option>
                <option value="otro">Otro Permiso</option>
              </select>
            </div>

            {/* Campo: Número de Documento */}
            <FormInput
              label="Número de Documento"
              value={formData.numero_documento || ''}
              onChange={(e) => handleChange('numero_documento', e.target.value)}
              error={errors.numero_documento}
              disabled={submitting}
              required
              placeholder="Ej: POAT-2024-001, CTR-001, GF-2024-001"
            />

            {/* Campo: Entidad Emisora */}
            <FormInput
              label="Entidad Emisora"
              value={formData.entidad_emisora || ''}
              onChange={(e) => handleChange('entidad_emisora', e.target.value)}
              error={errors.entidad_emisora}
              disabled={submitting}
              required
              placeholder="Ej: ABT (Autoridad de Fiscalización), Municipalidad"
            />

            {/* Campo: Responsable/Contacto */}
            <FormInput
              label="Responsable/Contacto"
              value={formData.responsable || ''}
              onChange={(e) => handleChange('responsable', e.target.value)}
              disabled={submitting}
              placeholder="Ej: Ing. Carlos López, Jefe de Permisos"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: FECHAS Y VALIDEZ                                  */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'fechas' ? null : 'fechas')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(96,165,250,.12), rgba(96,165,250,.04))',
            borderBottom: expandedSection === 'fechas' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#60a5fa' }}>
            📅 Fechas y Validez
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'fechas' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'fechas' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Fecha de Emisión */}
            <FormInput
              label="Fecha de Emisión"
              type="date"
              value={formData.fecha_emision || ''}
              onChange={(e) => handleChange('fecha_emision', e.target.value)}
              error={errors.fecha_emision}
              disabled={submitting}
              required
            />

            {/* Campo: Fecha de Vencimiento */}
            <FormInput
              label="Fecha de Vencimiento"
              type="date"
              value={formData.fecha_vencimiento || ''}
              onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
              error={errors.fecha_vencimiento}
              disabled={submitting}
              required
            />

            {/* Indicador de Vencimiento */}
            {diasVencimiento !== null && (
              <div style={{
                gridColumn: '1 / -1',
                padding: '12px',
                borderRadius: '8px',
                background: diasVencimiento < 0 ? '#2a1a1a' : diasVencimiento < 30 ? '#2a2a1a' : '#1a2a1a',
                border: `1px solid ${diasVencimiento < 0 ? '#f87171' : diasVencimiento < 30 ? '#fbbf24' : '#4ade80'}`,
                color: diasVencimiento < 0 ? '#f87171' : diasVencimiento < 30 ? '#fbbf24' : '#4ade80'
              }}>
                <strong>
                  {diasVencimiento < 0
                    ? `⚠️ VENCIDO hace ${Math.abs(diasVencimiento)} días`
                    : diasVencimiento === 0
                    ? '🔴 Vence HOY'
                    : diasVencimiento < 30
                    ? `⚠️ Vence en ${diasVencimiento} días`
                    : `✅ Vigente por ${diasVencimiento} días`}
                </strong>
              </div>
            )}

            {/* Campo: Vigencia (años) */}
            <FormInput
              label="Período de Validez (años)"
              type="number"
              value={formData.periodo_validez || ''}
              onChange={(e) => handleChange('periodo_validez', e.target.value)}
              disabled={submitting}
              placeholder="Ej: 1 (para documentos anuales)"
              min="0"
              step="0.5"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 3: ASOCIACIÓN                                         */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#182219',
        border: '1px solid #28342a',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div
          onClick={() => setExpandedSection(expandedSection === 'asociacion' ? null : 'asociacion')}
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(251,191,36,.04))',
            borderBottom: expandedSection === 'asociacion' ? '1px solid #28342a' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
            🔗 Asociación
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'asociacion' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'asociacion' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Campo: Asociado a Rodeo */}
            <FormInput
              label="Asociado a Rodeo (opcional)"
              value={formData.asociado_rodeo || ''}
              onChange={(e) => handleChange('asociado_rodeo', e.target.value)}
              disabled={submitting}
              placeholder="ID del rodeo o nombre"
            />

            {/* Campo: Asociado a Proyecto/Obra */}
            <FormInput
              label="Asociado a Proyecto/Obra (opcional)"
              value={formData.asociado_proyecto || ''}
              onChange={(e) => handleChange('asociado_proyecto', e.target.value)}
              disabled={submitting}
              placeholder="ID del proyecto o nombre"
            />

            {/* Campo: Asociado a Maquinaria */}
            <FormInput
              label="Asociado a Maquinaria (opcional)"
              value={formData.asociado_maquinaria || ''}
              onChange={(e) => handleChange('asociado_maquinaria', e.target.value)}
              disabled={submitting}
              placeholder="ID o nombre de máquina"
            />

            {/* Campo: Asociado a Campamento */}
            <FormInput
              label="Asociado a Campamento (opcional)"
              value={formData.asociado_campamento || ''}
              onChange={(e) => handleChange('asociado_campamento', e.target.value)}
              disabled={submitting}
              placeholder="Nombre del campamento"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 4: DOCUMENTACIÓN                                     */}
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
            📎 Documentación
          </h3>
          <span style={{ color: '#9aa39a' }}>
            {expandedSection === 'documentacion' ? '▼' : '▶'}
          </span>
        </div>

        {expandedSection === 'documentacion' && (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {/* Campo: Referencia de Archivo */}
            <FormInput
              label="Referencia/Ruta del Archivo (si está almacenado)"
              value={formData.referencia_archivo || ''}
              onChange={(e) => handleChange('referencia_archivo', e.target.value)}
              disabled={submitting}
              placeholder="Ej: \\\\carpeta\\POAT-2024-001.pdf o ID de Google Drive"
            />

            {/* Campo: URL o Link */}
            <FormInput
              label="URL o Link (si está en línea)"
              type="url"
              value={formData.url_documento || ''}
              onChange={(e) => handleChange('url_documento', e.target.value)}
              disabled={submitting}
              placeholder="Ej: https://drive.google.com/... o https://..."
            />

            {/* Campo: Observaciones */}
            <div>
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
                placeholder="Notas importantes, condiciones especiales, renovación automática, etc..."
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

export default FormDocumentosDetallado;
