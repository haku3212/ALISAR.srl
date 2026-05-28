import React, { useState, memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * CalendarPicker Component
 * Pequeño calendario desplegable para seleccionar fechas
 * Memoizado para evitar re-renders innecesarios
 */
const CalendarPicker = memo(({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    try {
      return value ? new Date(value) : new Date();
    } catch {
      return new Date();
    }
  });

  const getDaysInMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }, []);

  const handlePrevMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  }, []);

  const handleSelectDay = useCallback((day) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateString = selected.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  }, [viewDate, onChange]);

  const formatDate = useCallback(() => {
    if (!value) return '';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return value;
    }
  }, [value]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDay = getFirstDayOfMonth(viewDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDate = value ? new Date(value) : null;
  const isCurrentMonth = selectedDate &&
    selectedDate.getFullYear() === viewDate.getFullYear() &&
    selectedDate.getMonth() === viewDate.getMonth();

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <input
        type="text"
        value={formatDate()}
        readOnly
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #1f241f',
          borderRadius: '8px',
          background: '#0d0f0d',
          color: '#e0e0e0',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onFocus={(e) => {
          if (!disabled && !isOpen) {
            e.target.style.borderColor = '#60a5fa';
            e.target.style.background = '#111411';
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#1f241f';
          e.target.style.background = '#0d0f0d';
        }}
      />

      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: '#1a1d1a',
            border: '1px solid #1f241f',
            borderRadius: '8px',
            padding: '12px',
            zIndex: 1000,
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header con navegación */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}
          >
            <button
              onClick={handlePrevMonth}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <div style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: 'bold' }}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>

            <button
              onClick={handleNextMonth}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Días de la semana */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px'
            }}
          >
            {weekDays.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#666',
                  fontWeight: 'bold',
                  padding: '4px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px'
            }}
          >
            {days.map((day, idx) => (
              <button
                key={`day-${idx}`}
                onClick={() => day && handleSelectDay(day)}
                type="button"
                disabled={!day}
                style={{
                  padding: '6px 4px',
                  background: day === null ? 'transparent' :
                    isCurrentMonth && day === selectedDate.getDate() ? '#FFD700' :
                    '#111411',
                  color: day === null ? 'transparent' :
                    isCurrentMonth && day === selectedDate.getDate() ? '#000' : '#e0e0e0',
                  border: day === null ? 'none' : '1px solid #1f241f',
                  borderRadius: '4px',
                  cursor: day ? 'pointer' : 'default',
                  fontSize: '12px',
                  fontWeight: day === null ? 'normal' : 'bold',
                  transition: 'all 0.2s ease',
                  opacity: day ? 1 : 0.3
                }}
                onMouseEnter={(e) => {
                  if (day) {
                    e.target.style.background = '#222522';
                    e.target.style.borderColor = '#60a5fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (day) {
                    e.target.style.background = isCurrentMonth && day === selectedDate.getDate() ? '#FFD700' : '#111411';
                    e.target.style.borderColor = '#1f241f';
                  }
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.disabled === nextProps.disabled
  );
});

CalendarPicker.displayName = 'CalendarPicker';

export default CalendarPicker;
