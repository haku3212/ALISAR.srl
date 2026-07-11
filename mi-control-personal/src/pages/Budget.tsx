import { useState } from 'react';
import { api } from '../api';
import { useData } from '../context/DataContext';
import { Field, Modal, ProgressBar } from '../components/common';
import { Icon } from '../components/Icon';
import { computeAlerts, computeBudgetStatus, computeGoalStats, computeTotals } from '../utils/calc';
import { money } from '../utils/format';

export function BudgetPage() {
  const { data, call } = useData();
  const [adding, setAdding] = useState<{ categoryId: number; limit: number } | null>(null);
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);

  const statuses = computeBudgetStatus(data);
  const totals = computeTotals(data);
  const alerts = computeAlerts(data, totals, computeGoalStats(data, totals));
  const expenseCategories = data.categories.filter((c) => c.type === 'gasto');
  const withoutBudget = expenseCategories.filter((c) => !data.budgets.some((b) => b.category_id === c.id));

  const save = async () => {
    if (!adding) return;
    const ok = await call(api.upsertBudget(adding.categoryId, adding.limit), 'Presupuesto guardado');
    if (ok) setAdding(null);
  };

  return (
    <div>
      <h1 className="page-title">Presupuesto personal</h1>
      <p className="page-subtitle">Límites mensuales por categoría, con avisos cuando te pases.</p>

      {alerts.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {alerts.map((a, i) => (
            <div key={i} className={`alert ${a.level}`}>
              <Icon name="alert" size={17} />
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="toolbar">
        <button
          className="btn primary"
          onClick={() => setAdding({ categoryId: withoutBudget[0]?.id ?? expenseCategories[0]?.id ?? 0, limit: 100 })}
        >
          <Icon name="plus" size={16} /> Nuevo límite mensual
        </button>
      </div>

      {statuses.length === 0 && (
        <div className="panel">
          <div className="empty">Aún no definiste límites. Crea uno para Comida, Bebidas, Recargas, Entretenimiento u otra categoría.</div>
        </div>
      )}

      {statuses.map((s) => (
        <div key={s.budget.id} className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ margin: 0 }}>{s.category.name}</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 14 }}>
                {fmt(s.spent)} de {fmt(s.budget.monthly_limit)} este mes
              </span>
              <button className="icon-btn" title="Editar límite" onClick={() => setAdding({ categoryId: s.category.id, limit: s.budget.monthly_limit })}>
                <Icon name="edit" size={16} />
              </button>
              <button className="icon-btn danger" title="Quitar límite" onClick={() => call(api.deleteBudget(s.budget.id), 'Límite eliminado')}>
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>
          <div className="mt">
            <ProgressBar pct={s.pct} color={s.over ? 'var(--critical)' : s.pct > 80 ? 'var(--warning)' : 'var(--series-2)'} />
          </div>
          <div className="muted mt" style={{ fontSize: 13.5 }}>
            {s.over
              ? `Superaste el límite por ${fmt(Math.round((s.spent - s.budget.monthly_limit) * 100) / 100)}.`
              : s.projectedOver
                ? `A este ritmo terminarías el mes en ${fmt(s.projected)} (por encima del límite).`
                : `Proyección a fin de mes: ${fmt(s.projected)}.`}
          </div>
        </div>
      ))}

      {adding && (
        <Modal title="Límite mensual" onClose={() => setAdding(null)}>
          <div className="form-grid">
            <Field label="Categoría de gasto">
              <select value={adding.categoryId} onChange={(e) => setAdding({ ...adding, categoryId: Number(e.target.value) })}>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Límite mensual (${cur})`}>
              <input type="number" min="1" step="10" value={adding.limit} onChange={(e) => setAdding({ ...adding, limit: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setAdding(null)}>
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
