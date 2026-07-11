import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Field } from '../components/common';
import { formatDate, formatHours, money } from '../utils/format';

type Kind = 'todos' | 'horas' | 'pasaje' | 'ingreso' | 'gasto';
type StatusFilter = 'todos' | 'pendiente' | 'completado';

interface Row {
  kind: Exclude<Kind, 'todos'>;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: string | null;
  searchText: string;
}

export function History() {
  const { data } = useData();
  const [kind, setKind] = useState<Kind>('todos');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [category, setCategory] = useState('todas');
  const [search, setSearch] = useState('');
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);

  const catName = (id: number) => data.categories.find((c) => c.id === id)?.name ?? '—';

  const rows = useMemo<Row[]>(() => {
    const all: Row[] = [];
    for (const w of data.workEntries) {
      all.push({
        kind: 'horas', date: w.date, description: `${formatHours(w.hours)} trabajadas${w.note ? ` · ${w.note}` : ''}`,
        category: 'Trabajo', amount: w.amount, status: w.status,
        searchText: `horas ${w.note}`.toLowerCase()
      });
    }
    for (const f of data.fares) {
      all.push({
        kind: 'pasaje', date: f.date, description: f.description || 'Pasaje ida y vuelta',
        category: 'Pasajes', amount: f.total, status: f.status,
        searchText: `pasaje ${f.description}`.toLowerCase()
      });
    }
    for (const m of data.incomes) {
      all.push({
        kind: 'ingreso', date: m.date, description: m.description || '(sin descripción)',
        category: catName(m.category_id), amount: m.amount, status: null,
        searchText: `ingreso ${m.description} ${m.note} ${catName(m.category_id)}`.toLowerCase()
      });
    }
    for (const m of data.expenses) {
      all.push({
        kind: 'gasto', date: m.date, description: m.description || '(sin descripción)',
        category: catName(m.category_id), amount: m.amount, status: null,
        searchText: `gasto ${m.description} ${m.note} ${catName(m.category_id)}`.toLowerCase()
      });
    }
    return all.sort((a, b) => b.date.localeCompare(a.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const categories = useMemo(() => [...new Set(rows.map((r) => r.category))].sort(), [rows]);

  const filtered = rows.filter((r) => {
    if (kind !== 'todos' && r.kind !== kind) return false;
    if (status !== 'todos') {
      if (r.status === null) return false;
      const isPending = r.status === 'pendiente';
      if (status === 'pendiente' && !isPending) return false;
      if (status === 'completado' && isPending) return false;
    }
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    if (minAmount !== '' && r.amount < Number(minAmount)) return false;
    if (maxAmount !== '' && r.amount > Number(maxAmount)) return false;
    if (category !== 'todas' && r.category !== category) return false;
    if (search && !r.searchText.includes(search.toLowerCase())) return false;
    return true;
  });

  const KIND_LABEL: Record<Exclude<Kind, 'todos'>, string> = {
    horas: '🕐 Horas', pasaje: '🚌 Pasaje', ingreso: '💰 Ingreso', gasto: '🛒 Gasto'
  };

  return (
    <div>
      <h1 className="page-title">Historial</h1>
      <p className="page-subtitle">Todos tus movimientos en un solo lugar, con filtros y búsqueda.</p>

      <div className="panel">
        <div className="form-grid">
          <Field label="Buscar por texto">
            <input value={search} placeholder="Ej: coca, almuerzo, recarga…" onChange={(e) => setSearch(e.target.value)} />
          </Field>
          <Field label="Tipo de movimiento">
            <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              <option value="todos">Todos</option>
              <option value="horas">Horas trabajadas</option>
              <option value="pasaje">Pasajes</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
            </select>
          </Field>
          <Field label="Estado">
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente (pago o devolución)</option>
              <option value="completado">Pagado / devuelto</option>
            </select>
          </Field>
          <Field label="Categoría">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="todas">Todas</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Desde">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Hasta">
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label={`Monto mínimo (${cur})`}>
            <input type="number" min="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
          </Field>
          <Field label={`Monto máximo (${cur})`}>
            <input type="number" min="0" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="panel">
        <p className="muted" style={{ marginTop: 0 }}>
          {filtered.length} movimiento(s)
        </p>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th className="num">Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td>{formatDate(r.date, data.settings)}</td>
                  <td>{KIND_LABEL[r.kind]}</td>
                  <td>{r.description}</td>
                  <td>{r.category}</td>
                  <td className="num">
                    <strong style={{ color: r.kind === 'gasto' ? 'var(--series-6)' : r.kind === 'ingreso' ? 'var(--good-text)' : undefined }}>
                      {r.kind === 'gasto' ? '− ' : r.kind === 'ingreso' ? '+ ' : ''}
                      {fmt(r.amount)}
                    </strong>
                  </td>
                  <td>
                    {r.status === null ? (
                      <span className="muted">—</span>
                    ) : r.status === 'pendiente' ? (
                      <span className="badge pendiente">Pendiente</span>
                    ) : (
                      <span className="badge ok">{r.kind === 'pasaje' ? 'Devuelto' : 'Pagado'}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    No hay movimientos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
