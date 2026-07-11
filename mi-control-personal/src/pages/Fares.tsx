import { useState } from 'react';
import type { Fare, FareInput } from '../../shared/types';
import { api } from '../api';
import { useData } from '../context/DataContext';
import { ConfirmDialog, Field, Modal, StatCard } from '../components/common';
import { Icon } from '../components/Icon';
import { formatDate, money, weekdayName } from '../utils/format';
import { round2 } from '../utils/calc';
import { todayISO } from '../utils/dates';

export function Fares() {
  const { data, call } = useData();
  const [editing, setEditing] = useState<{ id: number | null; input: FareInput } | null>(null);
  const [deleting, setDeleting] = useState<Fare | null>(null);
  const cur = data.settings.currency;
  const fmt = (n: number) => money(n, cur);

  const pending = data.fares.filter((f) => f.status === 'pendiente');
  const refunded = data.fares.filter((f) => f.status === 'devuelto');
  const totalPending = round2(pending.reduce((a, f) => a + f.total, 0));
  const totalRefunded = round2(refunded.reduce((a, f) => a + f.total, 0));

  const open = (fare?: Fare) => {
    setEditing(
      fare
        ? { id: fare.id, input: { date: fare.date, outbound: fare.outbound, inbound: fare.inbound, description: fare.description } }
        : { id: null, input: { date: todayISO(), outbound: 6, inbound: 6, description: '' } }
    );
  };

  const save = async () => {
    if (!editing) return;
    const ok = await call(
      editing.id === null ? api.createFare(editing.input) : api.updateFare(editing.id, editing.input),
      editing.id === null ? 'Pasaje registrado' : 'Pasaje actualizado'
    );
    if (ok) setEditing(null);
  };

  const upd = (patch: Partial<FareInput>) => setEditing((e) => (e ? { ...e, input: { ...e.input, ...patch } } : e));

  return (
    <div>
      <h1 className="page-title">Pasajes reembolsables</h1>
      <p className="page-subtitle">Pasajes que pagas tú y luego te devuelven. No cuentan como gasto mientras estén pendientes.</p>

      <div className="cards">
        <StatCard label="Pendiente de devolución" value={fmt(totalPending)} icon="bus" tone="accent" sub={`${pending.length} pasaje(s)`} />
        <StatCard label="Total recuperado" value={fmt(totalRefunded)} icon="check" tone="good" />
        <StatCard label="Total adelantado" value={fmt(round2(totalPending + totalRefunded))} icon="wallet" />
      </div>

      <div className="toolbar">
        <button className="btn primary" onClick={() => open()}>
          <Icon name="plus" size={16} /> Registrar pasaje
        </button>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Día</th>
                <th className="num">Ida</th>
                <th className="num">Vuelta</th>
                <th className="num">Total</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.fares.map((f) => (
                <tr key={f.id}>
                  <td>{formatDate(f.date, data.settings)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{weekdayName(f.date)}</td>
                  <td className="num">{fmt(f.outbound)}</td>
                  <td className="num">{fmt(f.inbound)}</td>
                  <td className="num">
                    <strong>{fmt(f.total)}</strong>
                  </td>
                  <td>{f.description}</td>
                  <td>
                    {f.status === 'pendiente' ? (
                      <span className="badge pendiente">Pendiente</span>
                    ) : (
                      <span className="badge ok">Devuelto {f.refunded_date ? formatDate(f.refunded_date, data.settings) : ''}</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {f.status === 'pendiente' ? (
                      <button className="btn small" onClick={() => call(api.setFareStatus(f.id, true), 'Pasaje marcado como devuelto')}>
                        <Icon name="check" size={14} /> Devuelto
                      </button>
                    ) : (
                      <button className="btn small" onClick={() => call(api.setFareStatus(f.id, false), 'Pasaje marcado como pendiente')}>
                        Volver a pendiente
                      </button>
                    )}{' '}
                    <button className="icon-btn" title="Editar" onClick={() => open(f)}>
                      <Icon name="edit" size={16} />
                    </button>
                    <button className="icon-btn danger" title="Eliminar" onClick={() => setDeleting(f)}>
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data.fares.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    No hay pasajes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id === null ? 'Registrar pasaje' : 'Editar pasaje'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Fecha">
              <input type="date" value={editing.input.date} onChange={(e) => upd({ date: e.target.value })} />
            </Field>
            <Field label={`Pasaje de ida (${cur})`}>
              <input type="number" min="0" step="0.5" value={editing.input.outbound} onChange={(e) => upd({ outbound: Number(e.target.value) })} />
            </Field>
            <Field label={`Pasaje de vuelta (${cur})`}>
              <input type="number" min="0" step="0.5" value={editing.input.inbound} onChange={(e) => upd({ inbound: Number(e.target.value) })} />
            </Field>
            <Field label="Descripción">
              <input value={editing.input.description ?? ''} placeholder="Ej: Pasaje al trabajo" onChange={(e) => upd({ description: e.target.value })} />
            </Field>
          </div>
          <p className="muted" style={{ fontSize: 14 }}>
            Total: <strong>{fmt(round2((editing.input.outbound || 0) + (editing.input.inbound || 0)))}</strong>
          </p>
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
          text={`¿Eliminar el pasaje del ${formatDate(deleting.date, data.settings)} por ${fmt(deleting.total)}?`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await call(api.deleteFare(deleting.id), 'Pasaje eliminado');
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
