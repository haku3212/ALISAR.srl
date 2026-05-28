import React, { memo } from 'react';
import { Calendar } from 'lucide-react';
import CalendarPicker from '../common/CalendarPicker';

/**
 * InputGroup Component
 * Componente reutilizable para inputs del formulario
 * Memoizado para evitar re-renders innecesarios
 */
const InputGroup = memo(({ label, value, onChange, type = 'text', required = false, disabled = false }) => {
  if (type === 'date') {
    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e7ebe5', fontWeight: '500' }}>
          {label} {required && <span style={{ color: '#f87171' }}>*</span>}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <CalendarPicker
              value={value || ''}
              onChange={onChange}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e7ebe5', fontWeight: '500' }}>
        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #1f241f',
          borderRadius: '8px',
          background: '#0d0f0d',
          color: '#e0e0e0',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          outline: 'none',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#60a5fa';
          e.target.style.background = '#111411';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#1f241f';
          e.target.style.background = '#0d0f0d';
        }}
        required={required}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // No re-renderizar si los props son iguales
  return (
    prevProps.label === nextProps.label &&
    prevProps.value === nextProps.value &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.type === nextProps.type &&
    prevProps.required === nextProps.required &&
    prevProps.disabled === nextProps.disabled
  );
});

InputGroup.displayName = 'InputGroup';

export default InputGroup;
