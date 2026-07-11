import { useData } from '../context/DataContext';
import { computeAlerts, computeGoalStats, computeTotals, expensesByCategory, monthlySeries } from '../utils/calc';
import { formatDate, formatHours, money, monthLabel } from '../utils/format';
import { yearMonth } from '../utils/dates';
import { todayISO } from '../utils/dates';
import { StatCard, ProgressBar } from '../components/common';
import { CategoryBars, GroupedBars, SERIES_COLORS } from '../components/charts';
import { Icon } from '../components/Icon';

export function Dashboard() {
  const { data } = useData();
  const totals = computeTotals(data);
  const goal = computeGoalStats(data, totals);
  const alerts = computeAlerts(data, totals, goal);
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);
  const series = monthlySeries(data, 6);
  const byCategory = expensesByCategory(data, yearMonth(todayISO())).slice(0, 6);

  return (
    <div>
      <h1 className="page-title">Hola, {data.settings.user_name} 👋</h1>
      <p className="page-subtitle">Resumen de tu dinero al día de hoy</p>

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

      <div className="cards">
        <StatCard label="Saldo actual" value={fmt(totals.balance)} icon="wallet" tone="accent" sub="Ahorro menos pasajes adelantados" />
        <StatCard label="Total ingresos" value={fmt(totals.totalIncome)} icon="incomes" tone="good" />
        <StatCard label="Total gastos" value={fmt(totals.totalExpense)} icon="expenses" tone="bad" />
        <StatCard label="Total ahorrado" value={fmt(goal.saved)} icon="target" tone="good" sub="Ingresos menos gastos" />
      </div>

      <div className="panel">
        <h3>
          {data.goal.name}: {fmt(goal.target)}
        </h3>
        <ProgressBar pct={goal.pct} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
          <span>
            <strong>{fmt(goal.saved)}</strong> ahorrado · <strong>{goal.pct}%</strong> completado
          </span>
          <span className="muted">Falta {fmt(goal.remaining)}</span>
        </div>
        {goal.etaDate && goal.remaining > 0 && (
          <div className="muted mt" style={{ fontSize: 13.5 }}>
            A tu ritmo actual ({fmt(goal.avgDaily)}/día) llegarías alrededor del {formatDate(goal.etaDate, data.settings)}.
          </div>
        )}
        {goal.remaining <= 0 && <div className="mt" style={{ color: 'var(--good-text)', fontWeight: 600 }}>🎉 ¡Meta cumplida!</div>}
      </div>

      <div className="cards">
        <StatCard
          label="Horas pendientes de pago"
          value={formatHours(totals.pendingHours)}
          icon="clock"
          sub={`Pago estimado: ${fmt(totals.pendingPay)}`}
        />
        <StatCard label="Pago pendiente" value={fmt(totals.pendingPay)} icon="incomes" tone="accent" />
        <StatCard label="Pasajes por devolver" value={fmt(totals.pendingFares)} icon="bus" sub={`Recuperados: ${fmt(totals.refundedFares)}`} />
        <StatCard label="Gastos de hoy" value={fmt(totals.expensesToday)} icon="expenses" />
        <StatCard label="Gastos de la semana" value={fmt(totals.expensesWeek)} icon="expenses" />
        <StatCard label="Gastos del mes" value={fmt(totals.expensesMonth)} icon="expenses" />
      </div>

      <div className="row">
        <div className="panel">
          <h3>Ingresos vs gastos (últimos 6 meses)</h3>
          <GroupedBars
            labels={series.map((s) => monthLabel(s.ym).slice(0, 3))}
            series={[
              { name: 'Ingresos', color: 'var(--series-1)', values: series.map((s) => s.income) },
              { name: 'Gastos', color: 'var(--series-6)', values: series.map((s) => s.expense) }
            ]}
            format={fmt}
          />
        </div>
        <div className="panel">
          <h3>Gastos del mes por categoría</h3>
          <CategoryBars
            items={byCategory.map((c, i) => ({ label: c.category.name, value: c.total, color: SERIES_COLORS[i % 8] }))}
            format={fmt}
          />
        </div>
      </div>
    </div>
  );
}
