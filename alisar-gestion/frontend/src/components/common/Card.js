/**
 * Card Component - Componente Card Reutilizable
 * Reemplaza divs con estilos inline para cards
 */

import React from 'react';

const Card = ({
  children,
  className = '',
  onClick = null,
  title = null,
  subtitle = null,
  footer = null,
  ...props
}) => {
  return (
    <div className={`card ${className}`} onClick={onClick} {...props}>
      {(title || subtitle) && (
        <div className="card-header" style={{ marginBottom: '16px' }}>
          {title && <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#e7ebe5' }}>{title}</h3>}
          {subtitle && <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{subtitle}</p>}
        </div>
      )}

      <div className="card-body">
        {children}
      </div>

      {footer && (
        <div className="card-footer" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1f241f' }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
