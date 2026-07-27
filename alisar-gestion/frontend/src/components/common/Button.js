/**
 * Button Component - Componente Button Reutilizable
 * Reemplaza botones hardcodeados con estilos inline
 * Soporta múltiples variantes, tamaños y estados
 */

import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, success, info
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  block = false,
  icon: Icon = null,
  className = '',
  type = 'button',
  title = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const blockClass = block ? 'btn-block' : '';

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    blockClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      {...props}
    >
      {loading && <span className="spinner"></span>}
      {Icon && !loading && <Icon size={16} />}
      {children}
    </button>
  );
};

export default Button;
