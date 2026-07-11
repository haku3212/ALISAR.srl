import { useEffect, useState } from 'react';
import type { BackupInfo, Settings } from '../../shared/types';
import { api } from '../api';
import { useData } from '../context/DataContext';
import { Field } from '../components/common';
import { Icon } from '../components/Icon';
import { money } from '../utils/format';

export function SettingsPage() {
  const { data, call, notify, refresh } = useData();
  const [form, setForm] = useState<Settings>(data.settings);
  const [goalTarget, setGoalTarget] = useState(data.goal.target_amount);
  const [backups, setBackups] = useState<BackupInfo[]>([]);

  useEffect(() => {
    setForm(data.settings);
    setGoalTarget(data.goal.target_amount);
  }, [data.settings, data.goal.target_amount]);

  const loadBackups = async () => {
    const result = await api.listBackups();
    if (result.ok) setBackups(result.data);
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const save = async () => {
    const okSettings = await call(api.updateSettings(form), undefined);
    const okGoal = goalTarget !== data.goal.target_amount ? await call(api.updateGoal({ target_amount: goalTarget })) : true;
    if (okSettings && okGoal) notify('Configuración guardada');
  };

  const upd = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div>
      <h1 className="page-title">Configuración</h1>
      <p className="page-subtitle">Ajusta la aplicación a tu gusto.</p>

      <div className="panel">
        <h3>Preferencias</h3>
        <div className="form-grid">
          <Field label="Tu nombre">
            <input value={form.user_name} onChange={(e) => upd({ user_name: e.target.value })} />
          </Field>
          <Field label="Moneda">
            <input value={form.currency} onChange={(e) => upd({ currency: e.target.value })} />
          </Field>
          <Field label={`Valor por hora (${form.currency})`}>
            <input type="number" min="0.5" step="0.5" value={form.hourly_rate} onChange={(e) => upd({ hourly_rate: Number(e.target.value) })} />
          </Field>
          <Field label={`Meta de ahorro (${form.currency})`}>
            <input type="number" min="1" step="50" value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} />
          </Field>
          <Field label="La semana empieza en">
            <select value={form.week_start} onChange={(e) => upd({ week_start: e.target.value as Settings['week_start'] })}>
              <option value="lunes">Lunes</option>
              <option value="domingo">Domingo</option>
            </select>
          </Field>
          <Field label="Tema">
            <select value={form.theme} onChange={(e) => upd({ theme: e.target.value as Settings['theme'] })}>
              <option value="claro">Claro</option>
              <option value="oscuro">Oscuro</option>
            </select>
          </Field>
          <Field label="Formato de fecha">
            <select value={form.date_format} onChange={(e) => upd({ date_format: e.target.value as Settings['date_format'] })}>
              <option value="DD/MM/YYYY">DD/MM/AAAA</option>
              <option value="YYYY-MM-DD">AAAA-MM-DD</option>
            </select>
          </Field>
          <Field label="Copia de seguridad automática al cerrar">
            <select value={form.auto_backup ? 'si' : 'no'} onChange={(e) => upd({ auto_backup: e.target.value === 'si' })}>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </Field>
        </div>
        <p className="muted" style={{ fontSize: 13.5 }}>
          El valor por hora actual es {money(data.settings.hourly_rate, data.settings.currency)}. Al cambiarlo, los registros nuevos usan la
          tarifa nueva; los ya guardados conservan la tarifa con la que se registraron.
        </p>
        <button className="btn primary" onClick={save}>
          <Icon name="save" size={15} /> Guardar configuración
        </button>
      </div>

      <div className="panel">
        <h3>Respaldo de datos</h3>
        <p className="muted" style={{ fontSize: 14 }}>
          Toda tu información se guarda localmente en una base de datos SQLite. Desde aquí puedes crear copias, restaurarlas o exportar el
          archivo completo.
        </p>
        <div className="toolbar">
          <button
            className="btn primary"
            onClick={async () => {
              const result = await api.createBackup();
              if (result.ok) {
                notify('Copia de seguridad creada');
                loadBackups();
              } else notify(result.error, true);
            }}
          >
            <Icon name="save" size={15} /> Crear copia ahora
          </button>
          <button
            className="btn"
            onClick={async () => {
              const result = await api.restoreBackup();
              if (!result.ok) notify(result.error, true);
              else if (result.data) {
                await refresh();
                notify('Respaldo restaurado correctamente');
              }
            }}
          >
            Restaurar respaldo…
          </button>
          <button
            className="btn"
            onClick={async () => {
              const result = await api.exportDb();
              if (result.ok && result.data) notify(`Base de datos exportada a ${result.data}`);
              else if (!result.ok) notify(result.error, true);
            }}
          >
            <Icon name="download" size={15} /> Exportar base de datos
          </button>
          <button className="btn" onClick={() => api.openBackupFolder()}>
            Abrir carpeta de respaldos
          </button>
        </div>

        {backups.length > 0 && (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Fecha</th>
                  <th className="num">Tamaño</th>
                </tr>
              </thead>
              <tbody>
                {backups.slice(0, 10).map((b) => (
                  <tr key={b.path}>
                    <td>{b.file}</td>
                    <td>{new Date(b.date).toLocaleString('es-BO')}</td>
                    <td className="num">{(b.size / 1024).toFixed(1)} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
