import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/common';
import { formatDate, formatHours, money, monthName, weekdayName } from '../utils/format';
import { round2 } from '../utils/calc';
import { todayISO, toISO } from '../utils/dates';

interface DayInfo {
  hours: number;
  pay: number;
  expenses: number;
  incomes: number;
  fares: number;
  notes: string[];
}

export function CalendarPage() {
  const { data } = useData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [selected, setSelected] = useState<string | null>(null);
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);
  const today = todayISO();

  const byDay = useMemo(() => {
    const map = new Map<string, DayInfo>();
    const ensure = (d: string) => {
      if (!map.has(d)) map.set(d, { hours: 0, pay: 0, expenses: 0, incomes: 0, fares: 0, notes: [] });
      return map.get(d)!;
    };
    for (const w of data.workEntries) {
      const info = ensure(w.date);
      info.hours = round2(info.hours + w.hours);
      info.pay = round2(info.pay + w.amount);
      if (w.note) info.notes.push(w.note);
    }
    for (const e of data.expenses) {
      const info = ensure(e.date);
      info.expenses = round2(info.expenses + e.amount);
      if (e.note) info.notes.push(e.note);
    }
    for (const i of data.incomes) {
      const info = ensure(i.date);
      info.incomes = round2(info.incomes + i.amount);
      if (i.note) info.notes.push(i.note);
    }
    for (const f of data.fares) {
      const info = ensure(f.date);
      info.fares = round2(info.fares + f.total);
    }
    return map;
  }, [data]);

  const weekStartMonday = data.settings.week_start === 'lunes';
  const headers = weekStartMonday ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    let offset = first.getDay(); // 0 = domingo
    if (weekStartMonday) offset = offset === 0 ? 6 : offset - 1;
    const start = new Date(year, month, 1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { iso: toISO(d), day: d.getDate(), inMonth: d.getMonth() === month };
    });
  }, [year, month, weekStartMonday]);

  const prev = () => (month === 0 ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1));
  const next = () => (month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1));

  const selInfo = selected ? byDay.get(selected) : undefined;

  return (
    <div>
      <h1 className="page-title">Calendario</h1>
      <p className="page-subtitle">Tu actividad día por día. Pulsa un día para ver el detalle.</p>

      <div className="toolbar">
        <button className="btn" onClick={prev}>
          ← Anterior
        </button>
        <strong style={{ fontSize: 17, textTransform: 'capitalize' }}>
          {monthName(month)} {year}
        </strong>
        <button className="btn" onClick={next}>
          Siguiente →
        </button>
        <div className="spacer" />
        <button
          className="btn small"
          onClick={() => {
            setYear(now.getFullYear());
            setMonth(now.getMonth());
          }}
        >
          Hoy
        </button>
      </div>

      <div className="panel">
        <div className="calendar-grid">
          {headers.map((h) => (
            <div key={h} className="calendar-head">
              {h}
            </div>
          ))}
          {cells.map((c) => {
            const info = byDay.get(c.iso);
            return (
              <button
                key={c.iso}
                className={`calendar-day ${c.inMonth ? '' : 'other-month'} ${c.iso === today ? 'today' : ''}`}
                onClick={() => setSelected(c.iso)}
              >
                <div className="day-num">{c.day}</div>
                {info && info.hours > 0 && (
                  <span className="day-tag" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    {formatHours(info.hours)} · {fmt(info.pay)}
                  </span>
                )}
                {info && info.incomes > 0 && (
                  <span className="day-tag" style={{ background: 'rgba(12,163,12,0.12)', color: 'var(--good-text)' }}>
                    + {fmt(info.incomes)}
                  </span>
                )}
                {info && info.expenses > 0 && (
                  <span className="day-tag" style={{ background: 'var(--danger-soft)', color: 'var(--series-6)' }}>
                    − {fmt(info.expenses)}
                  </span>
                )}
                {info && info.fares > 0 && (
                  <span className="day-tag" style={{ background: 'rgba(250,178,25,0.14)', color: '#8a6100' }}>
                    🚌 {fmt(info.fares)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <Modal title={`${weekdayName(selected)} ${formatDate(selected, data.settings)}`} onClose={() => setSelected(null)}>
          {!selInfo ? (
            <p className="muted">No hay actividad registrada este día.</p>
          ) : (
            <div>
              <div className="cards" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="card">
                  <div className="card-label">Horas trabajadas</div>
                  <div className="card-value" style={{ fontSize: 19 }}>
                    {formatHours(selInfo.hours)}
                  </div>
                  <div className="card-sub">Pago generado: {fmt(selInfo.pay)}</div>
                </div>
                <div className="card">
                  <div className="card-label">Ingresos</div>
                  <div className="card-value" style={{ fontSize: 19, color: 'var(--good-text)' }}>
                    {fmt(selInfo.incomes)}
                  </div>
                </div>
                <div className="card">
                  <div className="card-label">Gastos</div>
                  <div className="card-value" style={{ fontSize: 19, color: 'var(--series-6)' }}>
                    {fmt(selInfo.expenses)}
                  </div>
                </div>
                <div className="card">
                  <div className="card-label">Pasajes</div>
                  <div className="card-value" style={{ fontSize: 19 }}>
                    {fmt(selInfo.fares)}
                  </div>
                </div>
              </div>

              {data.workEntries.filter((w) => w.date === selected).map((w) => (
                <p key={`w${w.id}`} style={{ fontSize: 14 }}>
                  🕐 {w.start_time ? `${w.start_time}–${w.end_time}` : formatHours(w.hours)} → {fmt(w.amount)}{' '}
                  {w.status === 'pagado' ? '(pagado)' : '(pendiente)'} {w.note && `· ${w.note}`}
                </p>
              ))}
              {data.incomes.filter((m) => m.date === selected).map((m) => (
                <p key={`i${m.id}`} style={{ fontSize: 14 }}>
                  💰 + {fmt(m.amount)} {m.description && `· ${m.description}`}
                </p>
              ))}
              {data.expenses.filter((m) => m.date === selected).map((m) => (
                <p key={`e${m.id}`} style={{ fontSize: 14 }}>
                  🛒 − {fmt(m.amount)} {m.description && `· ${m.description}`}
                </p>
              ))}
              {data.fares.filter((f) => f.date === selected).map((f) => (
                <p key={`f${f.id}`} style={{ fontSize: 14 }}>
                  🚌 {fmt(f.total)} ({f.status === 'pendiente' ? 'pendiente de devolución' : 'devuelto'}) {f.description && `· ${f.description}`}
                </p>
              ))}
            </div>
          )}
          <div className="modal-actions">
            <button className="btn" onClick={() => setSelected(null)}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
