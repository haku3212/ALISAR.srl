import { useMemo, useState } from 'react';
import type { WorkEntry, WorkEntryInput } from '../../shared/types';
import { api } from '../api';
import { useData } from '../context/DataContext';
import { ConfirmDialog, Field, Modal, StatCard } from '../components/common';
import { Icon } from '../components/Icon';
import { formatDate, formatHours, money, weekdayName } from '../utils/format';
import { groupWorkByPeriod, round2 } from '../utils/calc';
import { startOfWeek, todayISO, yearMonth } from '../utils/dates';

const EMPTY: WorkEntryInput = { date: todayISO(), start_time: null, end_time: null, break_minutes: 0, hours: null, note: '' };

export function WorkHours() {
  const { data, call } = useData();
  const [editing, setEditing] = useState<{ id: number | null; input: WorkEntryInput } | null>(null);
  const [mode, setMode] = useState<'horas' | 'horario'>('horas');
  const [deleting, setDeleting] = useState<WorkEntry | null>(null);
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);

  const entries = data.workEntries;
  const pending = entries.filter((e) => e.status === 'pendiente');
  const paid = entries.filter((e) => e.status === 'pagado');

  const today = todayISO();
  const thisWeek = startOfWeek(today, data.settings.week_start);
  const { byWeek, byMonth } = useMemo(() => groupWorkByPeriod(entries, data.settings.week_start), [entries, data.settings.week_start]);
  const weekTotals = byWeek.get(thisWeek) ?? { hours: 0, amount: 0 };
  const monthTotals = byMonth.get(yearMonth(today)) ?? { hours: 0, amount: 0 };

  const open = (entry?: WorkEntry) => {
    if (entry) {
      setMode(entry.start_time ? 'horario' : 'horas');
      setEditing({
        id: entry.id,
        input: {
          date: entry.date,
          start_time: entry.start_time,
          end_time: entry.end_time,
          break_minutes: entry.break_minutes,
          hours: entry.hours,
          note: entry.note
        }
      });
    } else {
      setMode('horas');
      setEditing({ id: null, input: { ...EMPTY, date: todayISO() } });
    }
  };

  const save = async () => {
    if (!editing) return;
    const input: WorkEntryInput =
      mode === 'horas'
        ? { date: editing.input.date, hours: editing.input.hours, note: editing.input.note }
        : {
            date: editing.input.date,
            start_time: editing.input.start_time,
            end_time: editing.input.end_time,
            break_minutes: editing.input.break_minutes ?? 0,
            note: editing.input.note
          };
    const ok = await call(
      editing.id === null ? api.createWorkEntry(input) : api.updateWorkEntry(editing.id, input),
      editing.id === null ? 'Horas registradas' : 'Registro actualizado'
    );
    if (ok) setEditing(null);
  };

  const upd = (patch: Partial<WorkEntryInput>) => setEditing((e) => (e ? { ...e, input: { ...e.input, ...patch } } : e));

  const previewHours = (() => {
    if (!editing) return null;
    if (mode === 'horas') return editing.input.hours ?? null;
    if (editing.input.start_time && editing.input.end_time) {
      const [sh, sm] = editing.input.start_time.split(':').map(Number);
      const [eh, em] = editing.input.end_time.split(':').map(Number);
      const mins = eh * 60 + em - sh * 60 - sm - (editing.input.break_minutes ?? 0);
      return mins > 0 ? round2(mins / 60) : null;
    }
    return null;
  })();

  const renderTable = (rows: WorkEntry[], isPaid: boolean) => (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Día</th>
            <th>Horario</th>
            <th className="num">Horas</th>
            <th className="num">Tarifa</th>
            <th className="num">Pago</th>
            <th>Observación</th>
            {isPaid && <th>Pagado el</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id}>
              <td>{formatDate(w.date, data.settings)}</td>
              <td style={{ textTransform: 'capitalize' }}>{weekdayName(w.date)}</td>
              <td>
                {w.start_time ? `${w.start_time} – ${w.end_time}` : '—'}
                {w.break_minutes > 0 && <span className="muted"> (desc. {w.break_minutes} min)</span>}
              </td>
              <td className="num">{formatHours(w.hours)}</td>
              <td className="num">{fmt(w.hourly_rate)}</td>
              <td className="num">
                <strong>{fmt(w.amount)}</strong>
              </td>
              <td>{w.note}</td>
              {isPaid && <td>{w.paid_date ? formatDate(w.paid_date, data.settings) : ''}</td>}
              <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                {!isPaid ? (
                  <>
                    <button
                      className="btn small"
                      title="Marcar como pagado"
                      onClick={() => call(api.setWorkEntryPaid(w.id, true), 'Marcado como pagado; se registró el ingreso automáticamente')}
                    >
                      <Icon name="check" size={14} /> Pagado
                    </button>{' '}
                    <button className="icon-btn" title="Editar" onClick={() => open(w)}>
                      <Icon name="edit" size={16} />
                    </button>
                    <button className="icon-btn danger" title="Eliminar" onClick={() => setDeleting(w)}>
                      <Icon name="trash" size={16} />
                    </button>
                  </>
                ) : (
                  <button className="btn small" title="Volver a pendiente" onClick={() => call(api.setWorkEntryPaid(w.id, false), 'Marcado como pendiente')}>
                    Volver a pendiente
                  </button>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="empty">
                {isPaid ? 'Todavía no hay pagos recibidos.' : 'No hay horas pendientes de pago.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Horas trabajadas</h1>
      <p className="page-subtitle">
        Tu hora vale <strong>{fmt(data.settings.hourly_rate)}</strong> (se cambia en Configuración)
      </p>

      <div className="cards">
        <StatCard label="Pendiente de recibir" value={fmt(pending.reduce((a, w) => a + w.amount, 0))} icon="clock" tone="accent" sub={`${formatHours(pending.reduce((a, w) => a + w.hours, 0))} sin pagar`} />
        <StatCard label="Pago de esta semana" value={fmt(weekTotals.amount)} icon="calendar" sub={formatHours(weekTotals.hours)} />
        <StatCard label="Pago de este mes" value={fmt(monthTotals.amount)} icon="calendar" sub={formatHours(monthTotals.hours)} />
        <StatCard label="Total ya cobrado" value={fmt(paid.reduce((a, w) => a + w.amount, 0))} icon="check" tone="good" />
      </div>

      <div className="toolbar">
        <button className="btn primary" onClick={() => open()}>
          <Icon name="plus" size={16} /> Registrar horas
        </button>
      </div>

      <div className="panel">
        <h3>
          <span className="badge pendiente">Pendiente de pago</span>
        </h3>
        {renderTable(pending, false)}
      </div>

      <div className="panel">
        <h3>
          <span className="badge ok">Historial de pagos recibidos</span>
        </h3>
        {renderTable(paid, true)}
      </div>

      {editing && (
        <Modal title={editing.id === null ? 'Registrar horas trabajadas' : 'Editar registro'} onClose={() => setEditing(null)}>
          <div className="toolbar no-print">
            <button className={`btn small ${mode === 'horas' ? 'primary' : ''}`} onClick={() => setMode('horas')}>
              Cantidad de horas
            </button>
            <button className={`btn small ${mode === 'horario' ? 'primary' : ''}`} onClick={() => setMode('horario')}>
              Entrada y salida
            </button>
          </div>
          <div className="form-grid">
            <Field label="Fecha">
              <input type="date" value={editing.input.date} onChange={(e) => upd({ date: e.target.value })} />
            </Field>
            {mode === 'horas' ? (
              <Field label="Horas trabajadas">
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={editing.input.hours ?? ''}
                  placeholder="Ej: 5"
                  onChange={(e) => upd({ hours: e.target.value === '' ? null : Number(e.target.value) })}
                />
              </Field>
            ) : (
              <>
                <Field label="Hora de entrada">
                  <input type="time" value={editing.input.start_time ?? ''} onChange={(e) => upd({ start_time: e.target.value })} />
                </Field>
                <Field label="Hora de salida">
                  <input type="time" value={editing.input.end_time ?? ''} onChange={(e) => upd({ end_time: e.target.value })} />
                </Field>
                <Field label="Descanso no pagado (minutos)">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={editing.input.break_minutes ?? 0}
                    onChange={(e) => upd({ break_minutes: Number(e.target.value) })}
                  />
                </Field>
              </>
            )}
            <Field label="Observación">
              <input value={editing.input.note ?? ''} placeholder="Opcional" onChange={(e) => upd({ note: e.target.value })} />
            </Field>
          </div>
          {previewHours !== null && previewHours > 0 && (
            <p className="muted" style={{ fontSize: 14 }}>
              Día: <strong style={{ textTransform: 'capitalize' }}>{weekdayName(editing.input.date)}</strong> · {formatHours(previewHours)} ·
              pago estimado <strong>{fmt(round2(previewHours * data.settings.hourly_rate))}</strong>
            </p>
          )}
          <div className="modal-actions">
            <button className="btn" onClick={() => setEditing(null)}>
              Cancelar
            </button>
            <button className="btn primary" onClick={save}>
              <Icon name="save" size={15} /> Guardar
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          text={`¿Eliminar el registro del ${formatDate(deleting.date, data.settings)} (${formatHours(deleting.hours)})?`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await call(api.deleteWorkEntry(deleting.id), 'Registro eliminado');
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
