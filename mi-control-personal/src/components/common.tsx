import { useEffect } from 'react';
import { Icon } from './Icon';

export function StatCard({
  label, value, sub, icon, tone
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: string;
  tone?: 'accent' | 'good' | 'bad';
}) {
  return (
    <div className={`card ${tone ?? ''}`}>
      <div className="card-label">
        {icon && <Icon name={icon} size={15} />}
        {label}
      </div>
      <div className="card-value">{value}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, ...(color ? { background: color } : {}) }}
      />
    </div>
  );
}

export function Modal({
  title, onClose, children
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label, children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function ConfirmDialog({
  text, onConfirm, onCancel
}: {
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title="Confirmar" onClose={onCancel}>
      <p style={{ marginTop: 0 }}>{text}</p>
      <div className="modal-actions">
        <button className="btn" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn danger" onClick={onConfirm}>
          <Icon name="trash" size={15} /> Eliminar
        </button>
      </div>
    </Modal>
  );
}
