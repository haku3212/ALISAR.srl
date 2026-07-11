import type { AppData, Budget, Category, Movement, WorkEntry } from '../../shared/types';
import { addDays, daysBetween, daysInMonth, startOfMonth, startOfWeek, todayISO, yearMonth } from './dates';

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const sum = (nums: number[]) => round2(nums.reduce((a, b) => a + b, 0));

export interface Totals {
  totalIncome: number;
  totalExpense: number;
  pendingFares: number; // pasajes adelantados sin devolver
  refundedFares: number;
  advancedFares: number; // total adelantado histórico
  savings: number; // ingresos - gastos (los pasajes pendientes no son gasto definitivo)
  balance: number; // dinero disponible = ahorro - pasajes pendientes
  pendingHours: number;
  pendingPay: number;
  paidPay: number;
  expensesToday: number;
  expensesWeek: number;
  expensesMonth: number;
  incomesMonth: number;
}

export function computeTotals(data: AppData): Totals {
  const today = todayISO();
  const weekStartDay = startOfWeek(today, data.settings.week_start);
  const monthStart = startOfMonth(today);

  const totalIncome = sum(data.incomes.map((i) => i.amount));
  const totalExpense = sum(data.expenses.map((e) => e.amount));
  const pendingFares = sum(data.fares.filter((f) => f.status === 'pendiente').map((f) => f.total));
  const refundedFares = sum(data.fares.filter((f) => f.status === 'devuelto').map((f) => f.total));
  const savings = round2(totalIncome - totalExpense);

  const pending = data.workEntries.filter((w) => w.status === 'pendiente');
  const paid = data.workEntries.filter((w) => w.status === 'pagado');

  const inRange = (m: Movement, from: string) => m.date >= from && m.date <= today;

  return {
    totalIncome,
    totalExpense,
    pendingFares,
    refundedFares,
    advancedFares: round2(pendingFares + refundedFares),
    savings,
    balance: round2(savings - pendingFares),
    pendingHours: sum(pending.map((w) => w.hours)),
    pendingPay: sum(pending.map((w) => w.amount)),
    paidPay: sum(paid.map((w) => w.amount)),
    expensesToday: sum(data.expenses.filter((e) => e.date === today).map((e) => e.amount)),
    expensesWeek: sum(data.expenses.filter((e) => inRange(e, weekStartDay)).map((e) => e.amount)),
    expensesMonth: sum(data.expenses.filter((e) => inRange(e, monthStart)).map((e) => e.amount)),
    incomesMonth: sum(data.incomes.filter((i) => inRange(i, monthStart)).map((i) => i.amount))
  };
}

export interface GoalStats {
  target: number;
  saved: number;
  remaining: number;
  pct: number; // 0..100
  daysElapsed: number;
  avgDaily: number;
  avgWeekly: number;
  avgMonthly: number;
  etaDate: string | null; // estimación al ritmo actual
  etaDays: number | null;
  // si hay fecha objetivo: cuánto habría que ahorrar
  neededDaily: number | null;
  neededWeekly: number | null;
  neededMonthly: number | null;
}

export function computeGoalStats(data: AppData, totals: Totals): GoalStats {
  const today = todayISO();
  const target = data.goal.target_amount;
  const saved = Math.max(0, totals.savings);
  const remaining = Math.max(0, round2(target - saved));
  const pct = target > 0 ? Math.min(100, round2((saved / target) * 100)) : 0;

  const daysElapsed = Math.max(1, daysBetween(data.goal.start_date, today) + 1);
  const avgDaily = round2(saved / daysElapsed);
  const avgWeekly = round2(avgDaily * 7);
  const avgMonthly = round2(avgDaily * 30);

  let etaDays: number | null = null;
  let etaDate: string | null = null;
  if (remaining <= 0) {
    etaDays = 0;
    etaDate = today;
  } else if (avgDaily > 0) {
    etaDays = Math.ceil(remaining / avgDaily);
    etaDate = addDays(today, etaDays);
  }

  let neededDaily: number | null = null;
  let neededWeekly: number | null = null;
  let neededMonthly: number | null = null;
  if (data.goal.target_date && remaining > 0) {
    const daysLeft = Math.max(1, daysBetween(today, data.goal.target_date));
    neededDaily = round2(remaining / daysLeft);
    neededWeekly = round2(neededDaily * 7);
    neededMonthly = round2(neededDaily * 30);
  }

  return {
    target, saved, remaining, pct, daysElapsed,
    avgDaily, avgWeekly, avgMonthly, etaDate, etaDays,
    neededDaily, neededWeekly, neededMonthly
  };
}

export interface BudgetStatus {
  budget: Budget;
  category: Category;
  spent: number;
  pct: number;
  over: boolean;
  projected: number; // proyección a fin de mes al ritmo actual
  projectedOver: boolean;
}

export function computeBudgetStatus(data: AppData): BudgetStatus[] {
  const today = todayISO();
  const ym = yearMonth(today);
  const dayOfMonth = Number(today.slice(8, 10));
  const totalDays = daysInMonth(ym);

  return data.budgets
    .map((budget) => {
      const category = data.categories.find((c) => c.id === budget.category_id);
      if (!category) return null;
      const spent = sum(
        data.expenses.filter((e) => yearMonth(e.date) === ym && e.category_id === budget.category_id).map((e) => e.amount)
      );
      const projected = round2((spent / dayOfMonth) * totalDays);
      return {
        budget, category, spent,
        pct: budget.monthly_limit > 0 ? Math.min(999, round2((spent / budget.monthly_limit) * 100)) : 0,
        over: spent > budget.monthly_limit,
        projected,
        projectedOver: projected > budget.monthly_limit && spent <= budget.monthly_limit
      };
    })
    .filter((x): x is BudgetStatus => x !== null);
}

export interface Alert {
  level: 'peligro' | 'aviso' | 'info';
  text: string;
}

export function computeAlerts(data: AppData, totals: Totals, goal: GoalStats): Alert[] {
  const alerts: Alert[] = [];
  const currency = data.settings.currency;
  const fmt = (n: number) =>
    `${currency} ${new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(n)}`;

  for (const b of computeBudgetStatus(data)) {
    if (b.over) {
      alerts.push({
        level: 'peligro',
        text: `Superaste el presupuesto de ${b.category.name}: gastaste ${fmt(b.spent)} de ${fmt(b.budget.monthly_limit)} este mes.`
      });
    } else if (b.projectedOver) {
      alerts.push({
        level: 'aviso',
        text: `A este ritmo superarás el presupuesto de ${b.category.name}: proyección de ${fmt(b.projected)} frente a un límite de ${fmt(b.budget.monthly_limit)}.`
      });
    }
  }

  // Gastos pequeños que se repiten mucho en el mes
  const ym = yearMonth(todayISO());
  const monthExpenses = data.expenses.filter((e) => yearMonth(e.date) === ym);
  const byDesc = new Map<string, { count: number; total: number; sample: Movement }>();
  for (const e of monthExpenses) {
    const key = e.description.trim().toLowerCase() || `categoría ${e.category_id}`;
    const cur = byDesc.get(key) ?? { count: 0, total: 0, sample: e };
    cur.count += 1;
    cur.total = round2(cur.total + e.amount);
    byDesc.set(key, cur);
  }
  for (const [, info] of byDesc) {
    if (info.count >= 5) {
      const avg = round2(info.total / info.count);
      alerts.push({
        level: 'aviso',
        text: `"${info.sample.description}" se repitió ${info.count} veces este mes (${fmt(info.total)}). Si lo repites a diario serían ${fmt(round2(avg * 30))} al mes.`
      });
    }
  }

  // Varios días seguidos gastando por encima del promedio diario necesario
  const today = todayISO();
  const last3 = [addDays(today, -2), addDays(today, -1), today];
  const dailyTotals = last3.map((d) => sum(data.expenses.filter((e) => e.date === d).map((e) => e.amount)));
  const reference = goal.neededDaily ?? goal.avgDaily;
  if (reference > 0 && dailyTotals.every((t) => t > reference)) {
    alerts.push({
      level: 'aviso',
      text: `Llevas 3 días seguidos gastando más de ${fmt(reference)} por día, lo que frena tu meta de ahorro.`
    });
  }

  // Ahorro del mes por debajo de lo necesario (solo si hay fecha objetivo)
  if (goal.neededMonthly !== null) {
    const savedThisMonth = round2(totals.incomesMonth - totals.expensesMonth);
    if (savedThisMonth < goal.neededMonthly) {
      alerts.push({
        level: 'info',
        text: `Este mes llevas ahorrado ${fmt(savedThisMonth)} y necesitas ${fmt(goal.neededMonthly)} mensuales para llegar a la meta en la fecha objetivo.`
      });
    }
  }

  return alerts;
}

/** Agrupa horas trabajadas por semana y mes para los resúmenes de pago. */
export function groupWorkByPeriod(entries: WorkEntry[], weekStart: 'lunes' | 'domingo') {
  const byWeek = new Map<string, { hours: number; amount: number }>();
  const byMonth = new Map<string, { hours: number; amount: number }>();
  for (const w of entries) {
    const wk = startOfWeek(w.date, weekStart);
    const mo = yearMonth(w.date);
    const cw = byWeek.get(wk) ?? { hours: 0, amount: 0 };
    cw.hours = round2(cw.hours + w.hours);
    cw.amount = round2(cw.amount + w.amount);
    byWeek.set(wk, cw);
    const cm = byMonth.get(mo) ?? { hours: 0, amount: 0 };
    cm.hours = round2(cm.hours + w.hours);
    cm.amount = round2(cm.amount + w.amount);
    byMonth.set(mo, cm);
  }
  return { byWeek, byMonth };
}

/** Serie mensual de ingresos vs gastos para reportes y gráficos. */
export function monthlySeries(data: AppData, months = 6): Array<{ ym: string; income: number; expense: number; savings: number }> {
  const result: Array<{ ym: string; income: number; expense: number; savings: number }> = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const income = sum(data.incomes.filter((m) => yearMonth(m.date) === ym).map((m) => m.amount));
    const expense = sum(data.expenses.filter((m) => yearMonth(m.date) === ym).map((m) => m.amount));
    result.push({ ym, income, expense, savings: round2(income - expense) });
  }
  return result;
}

export function expensesByCategory(data: AppData, ym?: string): Array<{ category: Category; total: number }> {
  const filtered = ym ? data.expenses.filter((e) => yearMonth(e.date) === ym) : data.expenses;
  const map = new Map<number, number>();
  for (const e of filtered) map.set(e.category_id, round2((map.get(e.category_id) ?? 0) + e.amount));
  return [...map.entries()]
    .map(([id, total]) => ({ category: data.categories.find((c) => c.id === id)!, total }))
    .filter((x) => x.category)
    .sort((a, b) => b.total - a.total);
}
