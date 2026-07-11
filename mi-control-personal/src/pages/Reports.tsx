import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common';
import { Icon } from '../components/Icon';
import { computeGoalStats, computeTotals, expensesByCategory, monthlySeries, round2 } from '../utils/calc';
import { formatDate, formatHours, money, monthLabel } from '../utils/format';
import { CategoryBars, GroupedBars, SERIES_COLORS } from '../components/charts';
import { todayISO, yearMonth } from '../utils/dates';

type Sheet = { name: string; headers: string[]; rows: (string | number)[][] };

export function Reports() {
  const { data, notify } = useData();
  const [month, setMonth] = useState(yearMonth(todayISO()));
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);

  const totals = computeTotals(data);
  const goal = computeGoalStats(data, totals);
  const series = monthlySeries(data, 6);
  const catName = (id: number) => data.categories.find((c) => c.id === id)?.name ?? '—';

  const months = useMemo(() => {
    const set = new Set<string>([yearMonth(todayISO())]);
    for (const list of [data.incomes, data.expenses, data.workEntries, data.fares] as const) {
      for (const item of list) set.add(yearMonth(item.date));
    }
    return [...set].sort().reverse();
  }, [data]);

  const monthIncomes = data.incomes.filter((m) => yearMonth(m.date) === month);
  const monthExpenses = data.expenses.filter((m) => yearMonth(m.date) === month);
  const monthWork = data.workEntries.filter((w) => yearMonth(w.date) === month);
  const monthFares = data.fares.filter((f) => yearMonth(f.date) === month);
  const sumOf = (nums: number[]) => round2(nums.reduce((a, b) => a + b, 0));
  const byCategory = expensesByCategory(data, month);

  const buildSheets = (): Sheet[] => [
    {
      name: 'Resumen',
      headers: ['Concepto', `Monto (${cur})`],
      rows: [
        ['Ingresos del mes', sumOf(monthIncomes.map((m) => m.amount))],
        ['Gastos del mes', sumOf(monthExpenses.map((m) => m.amount))],
        ['Horas trabajadas del mes', sumOf(monthWork.map((w) => w.hours))],
        ['Pago generado del mes', sumOf(monthWork.map((w) => w.amount))],
        ['Pago pendiente (total)', totals.pendingPay],
        ['Pagos recibidos (total)', totals.paidPay],
        ['Pasajes pendientes (total)', totals.pendingFares],
        ['Meta de ahorro', goal.target],
        ['Ahorrado', goal.saved],
        ['Falta para la meta', goal.remaining],
        ['Progreso de la meta (%)', goal.pct]
      ]
    },
    {
      name: 'Horas',
      headers: ['Fecha', 'Entrada', 'Salida', 'Descanso (min)', 'Horas', `Tarifa (${cur})`, `Pago (${cur})`, 'Estado', 'Observación'],
      rows: monthWork.map((w) => [w.date, w.start_time ?? '', w.end_time ?? '', w.break_minutes, w.hours, w.hourly_rate, w.amount, w.status, w.note])
    },
    {
      name: 'Ingresos',
      headers: ['Fecha', 'Categoría', 'Descripción', `Monto (${cur})`, 'Método', 'Observación'],
      rows: monthIncomes.map((m) => [m.date, catName(m.category_id), m.description, m.amount, m.payment_method, m.note])
    },
    {
      name: 'Gastos',
      headers: ['Fecha', 'Categoría', 'Descripción', `Monto (${cur})`, 'Método', 'Observación'],
      rows: monthExpenses.map((m) => [m.date, catName(m.category_id), m.description, m.amount, m.payment_method, m.note])
    },
    {
      name: 'Pasajes',
      headers: ['Fecha', `Ida (${cur})`, `Vuelta (${cur})`, `Total (${cur})`, 'Descripción', 'Estado'],
      rows: monthFares.map((f) => [f.date, f.outbound, f.inbound, f.total, f.description, f.status])
    },
    {
      name: 'Gastos por categoría',
      headers: ['Categoría', `Total (${cur})`],
      rows: byCategory.map((c) => [c.category.name, c.total])
    }
  ];

  const toBase64 = (bytes: Uint8Array) => {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
  };

  const exportCsv = async () => {
    const sheets = buildSheets();
    const esc = (v: string | number) => {
      const s = String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const parts = sheets.map(
      (s) => `${s.name}\n${s.headers.map(esc).join(',')}\n${s.rows.map((r) => r.map(esc).join(',')).join('\n')}`
    );
    const content = '﻿' + parts.join('\n\n');
    const bytes = new TextEncoder().encode(content);
    const result = await api.saveFile(`reporte-${month}.csv`, toBase64(bytes), 'csv', 'Archivo CSV');
    if (result.ok && result.data) notify(`CSV guardado en ${result.data}`);
    else if (!result.ok) notify(result.error, true);
  };

  const exportExcel = async () => {
    const wb = XLSX.utils.book_new();
    for (const s of buildSheets()) {
      const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
      XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
    }
    const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    const result = await api.saveFile(`reporte-${month}.xlsx`, toBase64(new Uint8Array(out)), 'xlsx', 'Libro de Excel');
    if (result.ok && result.data) notify(`Excel guardado en ${result.data}`);
    else if (!result.ok) notify(result.error, true);
  };

  const exportPdf = async () => {
    const result = await api.exportPdf(`reporte-${month}.pdf`);
    if (result.ok && result.data) notify(`PDF guardado en ${result.data}`);
    else if (!result.ok) notify(result.error, true);
  };

  return (
    <div>
      <h1 className="page-title">Reportes</h1>
      <p className="page-subtitle">Resúmenes mensuales y exportación de tus datos.</p>

      <div className="toolbar no-print">
        <label style={{ fontWeight: 600, fontSize: 14 }}>Mes:</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--baseline)', background: 'var(--surface)', color: 'var(--text)' }}
        >
          {months.map((m) => (
            <option key={m} value={m} style={{ textTransform: 'capitalize' }}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <div className="spacer" />
        <button className="btn" onClick={exportCsv}>
          <Icon name="download" size={15} /> CSV
        </button>
        <button className="btn" onClick={exportExcel}>
          <Icon name="download" size={15} /> Excel
        </button>
        <button className="btn primary" onClick={exportPdf}>
          <Icon name="download" size={15} /> PDF
        </button>
      </div>

      <div className="cards">
        <StatCard label="Ingresos del mes" value={fmt(sumOf(monthIncomes.map((m) => m.amount)))} icon="incomes" tone="good" />
        <StatCard label="Gastos del mes" value={fmt(sumOf(monthExpenses.map((m) => m.amount)))} icon="expenses" tone="bad" />
        <StatCard label="Horas trabajadas" value={formatHours(sumOf(monthWork.map((w) => w.hours)))} icon="clock" sub={`Pago generado: ${fmt(sumOf(monthWork.map((w) => w.amount)))}`} />
        <StatCard label="Pago pendiente (total)" value={fmt(totals.pendingPay)} icon="clock" tone="accent" />
        <StatCard label="Pagos recibidos (total)" value={fmt(totals.paidPay)} icon="check" tone="good" />
        <StatCard label="Pasajes pendientes" value={fmt(totals.pendingFares)} icon="bus" />
        <StatCard label="Progreso de la meta" value={`${goal.pct}%`} icon="target" sub={`${fmt(goal.saved)} de ${fmt(goal.target)}`} />
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
          <h3 style={{ textTransform: 'capitalize' }}>Gastos por categoría · {monthLabel(month)}</h3>
          <CategoryBars items={byCategory.map((c, i) => ({ label: c.category.name, value: c.total, color: SERIES_COLORS[i % 8] }))} format={fmt} />
        </div>
      </div>

      <div className="panel">
        <h3 style={{ textTransform: 'capitalize' }}>Detalle de {monthLabel(month)}</h3>
        {buildSheets()
          .slice(1)
          .map((s) => (
            <div key={s.name} className="mt">
              <h4 style={{ margin: '10px 0 8px' }}>{s.name}</h4>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      {s.headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.rows.map((r, i) => (
                      <tr key={i}>
                        {r.map((cell, j) => (
                          <td key={j} className={typeof cell === 'number' ? 'num' : ''}>
                            {typeof cell === 'number' ? new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(cell) : String(cell).startsWith('20') && /^\d{4}-\d{2}-\d{2}$/.test(String(cell)) ? formatDate(String(cell), data.settings) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {s.rows.length === 0 && (
                      <tr>
                        <td colSpan={s.headers.length} className="empty">
                          Sin registros este mes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
