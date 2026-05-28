/**
 * ResumenFinanciero Component
 * Muestra análisis financiero completo de un proyecto
 * Todos los cálculos son automáticos en tiempo real
 */

import React, { useMemo } from 'react';
import { calcularResumenFinanciero } from '../../utils/calculosFinancieros';

const ResumenFinanciero = ({ proyecto }) => {
  // Calcular resumen financiero automáticamente
  const resumen = useMemo(() => {
    // Asegurar que proyecto sea un objeto válido
    const proyectoData = proyecto && typeof proyecto === 'object' ? proyecto : {};
    return calcularResumenFinanciero(proyectoData);
  }, [proyecto]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const esGananciaPositiva = resumen.gananciaNeta > 0;

  return (
    <div style={{
      background: '#1a1d1a',
      border: '2px solid #FFD700',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px'
    }}>
      <h2 style={{
        color: '#FFD700',
        margin: '0 0 24px 0',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        📊 ANÁLISIS FINANCIERO DEL PROYECTO
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* COLUMNA 1: INGRESOS */}
        <div>
          <h3 style={{
            color: '#FFD700',
            margin: '0 0 16px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #FFD700',
            paddingBottom: '12px'
          }}>
            💰 INGRESOS
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#999', fontSize: '14px' }}>Presupuesto Bruto:</span>
            <span style={{ color: '#e0e0e0', fontWeight: '600' }}>
              {formatCurrency(resumen.presupuestoBruto)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#999', fontSize: '14px' }}>Impuestos (16%):</span>
            <span style={{ color: '#f87171', fontWeight: '600' }}>
              -{formatCurrency(resumen.impuestos)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#111411',
            borderRadius: '8px',
            border: '1px solid #FFD700'
          }}>
            <span style={{ color: '#FFD700', fontSize: '14px', fontWeight: 'bold' }}>Presupuesto Neto:</span>
            <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>
              {formatCurrency(resumen.presupuestoNeto)}
            </span>
          </div>
        </div>

        {/* COLUMNA 2: GASTOS */}
        <div>
          <h3 style={{
            color: '#60a5fa',
            margin: '0 0 16px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '1px solid #60a5fa',
            paddingBottom: '12px'
          }}>
            📋 GASTOS OPERATIVOS
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#999', fontSize: '12px' }}>Diesel:</span>
            <span style={{ color: '#e0e0e0', fontSize: '12px' }}>
              {formatCurrency(resumen.gastoDiesel)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#999', fontSize: '12px' }}>Personal:</span>
            <span style={{ color: '#e0e0e0', fontSize: '12px' }}>
              {formatCurrency(resumen.gastoPersonal)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#999', fontSize: '12px' }}>Comida:</span>
            <span style={{ color: '#e0e0e0', fontSize: '12px' }}>
              {formatCurrency(resumen.gastoComida)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#999', fontSize: '12px' }}>Mantenimiento:</span>
            <span style={{ color: '#e0e0e0', fontSize: '12px' }}>
              {formatCurrency(resumen.gastoMantenimiento)}
            </span>
          </div>

          {resumen.gastoOtros > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#999', fontSize: '12px' }}>Otros:</span>
              <span style={{ color: '#e0e0e0', fontSize: '12px' }}>
                {formatCurrency(resumen.gastoOtros)}
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#111411',
            borderRadius: '8px',
            border: '1px solid #60a5fa',
            marginTop: '12px'
          }}>
            <span style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 'bold' }}>Total Gastos:</span>
            <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '16px' }}>
              {formatCurrency(resumen.gastoTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* SEPARADOR */}
      <div style={{
        height: '1px',
        background: '#1f241f',
        margin: '24px 0'
      }} />

      {/* RESULTADO FINAL */}
      <div style={{
        background: esGananciaPositiva ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
        border: `2px solid ${esGananciaPositiva ? '#4ade80' : '#f87171'}`,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{
          color: esGananciaPositiva ? '#4ade80' : '#f87171',
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          💰 GANANCIA NETA
        </h3>

        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: esGananciaPositiva ? '#4ade80' : '#f87171',
          marginBottom: '12px'
        }}>
          {formatCurrency(resumen.gananciaNeta)}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '16px'
        }}>
          <div>
            <div style={{
              color: '#999',
              fontSize: '12px',
              marginBottom: '4px'
            }}>
              Margen
            </div>
            <div style={{
              color: esGananciaPositiva ? '#4ade80' : '#f87171',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              {resumen.margenGanancia.toFixed(1)}%
            </div>
          </div>

          {proyecto.kilometros_totales > 0 && (
            <div>
              <div style={{
                color: '#999',
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                Por KM
              </div>
              <div style={{
                color: '#60a5fa',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {formatCurrency(resumen.gananciaPorKm)}
              </div>
            </div>
          )}

          {proyecto.duracion_dias > 0 && (
            <div>
              <div style={{
                color: '#999',
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                Por Día
              </div>
              <div style={{
                color: '#a78bfa',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {formatCurrency(resumen.gananciaPorDia)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumenFinanciero;
