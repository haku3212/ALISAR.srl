import { useState } from 'react';
import { api } from '../api';
import { useData } from '../context/DataContext';
import { Field, Modal, ProgressBar, StatCard } from '../components/common';
import { Icon } from '../components/Icon';
import { computeGoalStats, computeTotals, monthlySeries } from '../utils/calc';
import { formatDate, money, monthLabel } from '../utils/format';
import { LineChart } from '../components/charts';

export function GoalPage() {
  const { data, call } = useData();
  const [editing, setEditing] = useState<{ name: string; target: number; start: string; targetDate: string } | null>(null);
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);

  const totals = computeTotals(data);
  const goal = computeGoalStats(data, totals);
  const series = monthlySeries(data, 6);
  let acc = 0;
  const savingsLine = series.map((s) => {
    acc += s.savings;
    return { label: monthLabel(s.ym).slice(0, 3), value: Math.round(acc * 100) / 100 };
  });

  const save = async () => {
    if (!editing) return;
    const ok = await call(
      api.updateGoal({
        name: editing.name,
        target_amount: editing.target,
        start_date: editing.start,
        target_date: editing.targetDate || null
      }),
      'Meta actualizada'
    );
    if (ok) setEditing(null);
  };

  return (
    <div>
      <h1 className="page-title">Meta de ahorro</h1>
      <p className="page-subtitle">Tu objetivo y cuánto te falta para lograrlo.</p>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: 20 }}>
            {data.goal.name}: {fmt(goal.target)}
          </h3>
          <button
            className="btn small"
            onClick={() =>
              setEditing({
                name: data.goal.name,
                target: data.goal.target_amount,
                start: data.goal.start_date,
                targetDate: data.goal.target_date ?? ''
              })
            }
          >
            <Icon name="edit" size={14} /> Editar meta
          </button>
        </div>
        <div className="mt">
          <ProgressBar pct={goal.pct} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span>
            <strong>{fmt(goal.saved)}</strong> acumulado · <strong>{goal.pct}%</strong>
          </span>
          <span className="muted">Falta {fmt(goal.remaining)}</span>
        </div>
      </div>

      <div className="cards">
        <StatCard label="Fecha de inicio" value={formatDate(data.goal.start_date, data.settings)} icon="calendar" />
        <StatCard
          label="Fecha estimada de llegada"
          value={goal.remaining <= 0 ? '¡Cumplida! 🎉' : goal.etaDate ? formatDate(goal.etaDate, data.settings) : 'Sin ritmo aún'}
          icon="target"
          tone="accent"
          sub={goal.etaDays !== null && goal.remaining > 0 ? `En unos ${goal.etaDays} días al ritmo actual` : goal.remaining > 0 ? 'Registra ingresos para estimar' : undefined}
        />
        <StatCard label="Promedio diario de ahorro" value={fmt(goal.avgDaily)} icon="chart" />
        <StatCard label="Promedio semanal" value={fmt(goal.avgWeekly)} icon="chart" />
        <StatCard label="Promedio mensual" value={fmt(goal.avgMonthly)} icon="chart" />
      </div>

      {data.goal.target_date && goal.remaining > 0 && goal.neededDaily !== null && (
        <div className="panel">
          <h3>Para llegar el {formatDate(data.goal.target_date, data.settings)} necesitas ahorrar</h3>
          <div className="cards" style={{ marginBottom: 0 }}>
            <StatCard label="Por día" value={fmt(goal.neededDaily)} tone={goal.avgDaily >= goal.neededDaily ? 'good' : 'bad'} sub={`Hoy ahorras ${fmt(goal.avgDaily)}/día`} />
            <StatCard label="Por semana" value={fmt(goal.neededWeekly!)} />
            <StatCard label="Por mes" value={fmt(goal.neededMonthly!)} />
          </div>
        </div>
      )}

      <div className="panel">
        <h3>Ahorro acumulado (últimos 6 meses)</h3>
        <LineChart points={savingsLine} color="var(--series-2)" format={fmt} />
      </div>

      {editing && (
        <Modal title="Editar meta de ahorro" onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Nombre de la meta">
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label={`Monto objetivo (${cur})`}>
              <input type="number" min="1" step="50" value={editing.target} onChange={(e) => setEditing({ ...editing, target: Number(e.target.value) })} />
            </Field>
            <Field label="Fecha de inicio">
              <input type="date" value={editing.start} onChange={(e) => setEditing({ ...editing, start: e.target.value })} />
            </Field>
            <Field label="Fecha objetivo (opcional)">
              <input type="date" value={editing.targetDate} onChange={(e) => setEditing({ ...editing, targetDate: e.target.value })} />
            </Field>
          </div>
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
    </div>
  );
}
