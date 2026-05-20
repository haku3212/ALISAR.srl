import React from 'react';

const FormInput = ({ label, name, type = 'text', value, onChange, error, required, placeholder, disabled, min, max, step }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: '#e0e0e0',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {label} {required && <span style={{ color: '#f87171' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          border: error ? '1px solid #f87171' : '1px solid #1f241f',
          background: disabled ? '#0a0c0a' : '#111411',
          color: '#e0e0e0',
          outline: 'none',
          boxSizing: 'border-box',
          fontSize: '14px',
          transition: 'border-color 0.2s'
        }}
      />
      {error && (
        <span style={{
          display: 'block',
          marginTop: '4px',
          color: '#f87171',
          fontSize: '12px'
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
