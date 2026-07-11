import { useState } from 'react';
import type { Movement, MovementInput } from '../../shared/types';
import { api } from '../api';
import { useData } from '../context/DataContext';
import { ConfirmDialog, Field, Modal, StatCard } from '../components/common';
import { Icon } from '../components/Icon';
import { formatDate, money } from '../utils/format';
import { round2 } from '../utils/calc';
import { startOfMonth, startOfWeek, todayISO } from '../utils/dates';

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'QR', 'Tarjeta', 'Otro'];

export function Movements({ type }: { type: 'ingreso' | 'gasto' }) {
  const { data, call, notify } = useData();
  const [editing, setEditing] = useState<{ id: number | null; input: MovementInput } | null>(null);
  const [deleting, setDeleting] = useState<Movement | null>(null);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);

  const isIncome = type === 'ingreso';
  const items = isIncome ? data.incomes : data.expenses;
  const categories = data.categories.filter((c) => c.type === type);
  const catName = (id: number) => data.categories.find((c) => c.id === id)?.name ?? '—';

  const today = todayISO();
  const total = round2(items.reduce((a, m) => a + m.amount, 0));
  const totalMonth = round2(items.filter((m) => m.date >= startOfMonth(today) && m.date <= today).reduce((a, m) => a + m.amount, 0));
  const totalWeek = round2(
    items.filter((m) => m.date >= startOfWeek(today, data.settings.week_start) && m.date <= today).reduce((a, m) => a + m.amount, 0)
  );

  const open = (mv?: Movement) => {
    if (mv?.work_entry_id) {
      notify('Este ingreso se generó desde las horas trabajadas; edítalo desde esa sección.', true);
      return;
    }
    setEditing(
      mv
        ? {
            id: mv.id,
            input: {
              date: mv.date, category_id: mv.category_id, description: mv.description,
              amount: mv.amount, payment_method: mv.payment_method, note: mv.note
            }
          }
        : {
            id: null,
            input: { date: todayISO(), category_id: categories[0]?.id ?? 0, description: '', amount: 0, payment_method: 'Efectivo', note: '' }
          }
    );
  };

  const save = async () => {
    if (!editing) return;
    const ok = await call(
      editing.id === null ? api.createMovement(type, editing.input) : api.updateMovement(type, editing.id, editing.input),
      isIncome ? 'Ingreso guardado' : 'Gasto guardado'
    );
    if (ok) setEditing(null);
  };

  const upd = (patch: Partial<MovementInput>) => setEditing((e) => (e ? { ...e, input: { ...e.input, ...patch } } : e));

  const addCategory = async () => {
    if (newCategory === null) return;
    const name = newCategory.trim();
    if (!name) return;
    const result = await api.createCategory(type, name);
    if (result.ok) {
      await call(Promise.resolve(result), `Categoría "${name}" creada`);
      setEditing((e) => (e ? { ...e, input: { ...e.input, category_id: result.data.id } } : e));
      setNewCategory(null);
    } else {
      notify(result.error, true);
    }
  };

  return (
    <div>
      <h1 className="page-title">{isIncome ? 'Ingresos' : 'Gastos personales'}</h1>
      <p className="page-subtitle">
        {isIncome ? 'Todo el dinero que entra: trabajo, intereses, extras…' : 'Todo lo que gastas en tu día a día.'}
      </p>

      <div className="cards">
        <StatCard label={isIncome ? 'Total ingresos' : 'Total gastos'} value={fmt(total)} icon={isIncome ? 'incomes' : 'expenses'} tone={isIncome ? 'good' : 'bad'} />
        <StatCard label="Esta semana" value={fmt(totalWeek)} icon="calendar" />
        <StatCard label="Este mes" value={fmt(totalMonth)} icon="calendar" />
      </div>

      <div className="toolbar">
        <button className="btn primary" onClick={() => open()}>
          <Icon name="plus" size={16} /> {isIncome ? 'Registrar ingreso' : 'Registrar gasto'}
        </button>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th className="num">Monto</th>
                <th>Método</th>
                <th>Observación</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{formatDate(m.date, data.settings)}</td>
                  <td>{catName(m.category_id)}</td>
                  <td>
                    {m.description}
                    {m.work_entry_id && <span className="badge ok" style={{ marginLeft: 6 }}>horas</span>}
                  </td>
                  <td className="num">
                    <strong style={{ color: isIncome ? 'var(--good-text)' : 'var(--series-6)' }}>
                      {isIncome ? '+' : '−'} {fmt(m.amount)}
                    </strong>
                  </td>
                  <td>{m.payment_method}</td>
                  <td>{m.note}</td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button className="icon-btn" title="Editar" onClick={() => open(m)}>
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Eliminar"
                      onClick={() => {
                        if (m.work_entry_id) {
                          notify('Este ingreso está vinculado a horas trabajadas; desmárcalas como pagadas para eliminarlo.', true);
                        } else {
                          setDeleting(m);
                        }
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">
                    Todavía no hay registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id === null ? (isIncome ? 'Registrar ingreso' : 'Registrar gasto') : 'Editar movimiento'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Fecha">
              <input type="date" value={editing.input.date} onChange={(e) => upd({ date: e.target.value })} />
            </Field>
            <Field label="Categoría">
              <select value={editing.input.category_id} onChange={(e) => upd({ category_id: Number(e.target.value) })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Monto (${cur})`}>
              <input
                type="number"
                min="0"
                step="0.5"
                value={editing.input.amount || ''}
                placeholder="0.00"
                onChange={(e) => upd({ amount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Método de pago">
              <select value={editing.input.payment_method} onChange={(e) => upd({ payment_method: e.target.value })}>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Descripción">
              <input value={editing.input.description ?? ''} placeholder={isIncome ? 'Ej: Trabajo extra' : 'Ej: Almuerzo'} onChange={(e) => upd({ description: e.target.value })} />
            </Field>
            <Field label="Observación">
              <input value={editing.input.note ?? ''} placeholder="Opcional" onChange={(e) => upd({ note: e.target.value })} />
            </Field>
          </div>

          {newCategory === null ? (
            <button className="btn small mt" onClick={() => setNewCategory('')}>
              <Icon name="plus" size={13} /> Nueva categoría
            </button>
          ) : (
            <div className="toolbar mt">
              <input
                className="field"
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--baseline)', background: 'var(--surface)', color: 'var(--text)' }}
                value={newCategory}
                placeholder="Nombre de la categoría"
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button className="btn small primary" onClick={addCategory}>
                Crear
              </button>
              <button className="btn small" onClick={() => setNewCategory(null)}>
                Cancelar
              </button>
            </div>
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
          text={`¿Eliminar "${deleting.description || catName(deleting.category_id)}" de ${fmt(deleting.amount)}?`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await call(api.deleteMovement(type, deleting.id), 'Movimiento eliminado');
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
