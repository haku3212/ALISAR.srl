import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const C = {
  card: '#131513', border: '#1c221c', border2: '#232a23',
  yellow: '#FFD700', blue: '#60a5fa', green: '#34d399',
  text: '#e2e8e2', muted: '#6b7a6b',
};

const Modal = ({ isOpen, onClose, title, subtitle, mode = 'create', footer, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modeColor = mode === 'edit' ? C.blue : C.green;
  const modeLabel = mode === 'edit' ? 'EDITANDO' : 'NUEVO REGISTRO';

  return (
    <>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .modal-scroll::-webkit-scrollbar { width: 5px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: #232a23; border-radius: 4px; }
        .modal-scroll::-webkit-scrollbar-thumb:hover { background: #2e382e; }
      `}</style>

      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.78)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)',
          padding: '16px',
        }}
      >
        <div style={{
          background: C.card,
          borderRadius: '16px',
          width: 'min(100%, 900px)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${C.border2}`,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.22,1,0.36,1)',
        }}>

          {/* ── Header fijo ───────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '20px 28px 18px',
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            <div>
              <span style={{
                display: 'inline-block', marginBottom: '6px',
                background: `${modeColor}18`, color: modeColor,
                fontSize: '10px', fontWeight: '700', letterSpacing: '1.2px',
                padding: '3px 9px', borderRadius: '5px', border: `1px solid ${modeColor}28`
              }}>{modeLabel}</span>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '17px', fontWeight: '700', letterSpacing: '-0.2px' }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ margin: '4px 0 0 0', color: C.muted, fontSize: '12px' }}>{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border2}`,
                color: C.muted, cursor: 'pointer', borderRadius: '8px',
                width: '34px', height: '34px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0, marginLeft: '16px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(248,113,113,0.12)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = C.muted;
                e.currentTarget.style.borderColor = C.border2;
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Cuerpo scrollable ─────────────────────────────── */}
          <div className="modal-scroll" style={{
            flex: 1, overflowY: 'auto', padding: '24px 28px',
          }}>
            {children}
          </div>

          {/* ── Footer fijo ───────────────────────────────────── */}
          {footer && (
            <div style={{
              padding: '14px 28px',
              borderTop: `1px solid ${C.border}`,
              flexShrink: 0,
              background: '#0f110f',
              borderRadius: '0 0 16px 16px',
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
