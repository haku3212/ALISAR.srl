import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Building2, Phone, Mail, FileText, Info, Database } from 'lucide-react';
import { dataService } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './common/LoadingSpinner';

const C = {
  bg:      '#080a08',
  surface: '#0f110f',
  card:    '#131513',
  border:  '#1c221c',
  border2: '#232a23',
  yellow:  '#FFD700',
  blue:    '#60a5fa',
  purple:  '#a78bfa',
  green:   '#34d399',
  orange:  '#f97316',
  red:     '#f87171',
  text:    '#e2e8e2',
  muted:   '#6b7a6b',
  subtle:  '#3a4a3a',
};

const DEFAULTS = {
  empresa_nombre:    'ALISAR S.R.L.',
  empresa_nit:       '',
  empresa_telefono:  '',
  empresa_email:     '',
  empresa_ubicacion: 'Riberalta, Beni, Bolivia',
  empresa_moneda:    'Bs',
  empresa_idioma:    'es',
  tema_modo:         'oscuro',
};

const Section = ({ icon: Icon, title, color, children }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderTop: `3px solid ${color}`, borderRadius: '12px', padding: '24px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
      <h3 style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: '700' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, required, error, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', color: C.text, fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
      {label}{required && <span style={{ color: C.red, marginLeft: '3px' }}>*</span>}
    </label>
    {children}
    {error && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0 0' }}>{error}</p>}
  </div>
);

const inputStyle = (disabled) => ({
  width: '100%',
  padding: '9px 12px',
  background: C.surface,
  border: `1px solid ${C.border2}`,
  borderRadius: '8px',
  color: disabled ? C.muted : C.text,
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  opacity: disabled ? 0.6 : 1,
});

const Settings = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [config,  setConfig]    = useState(DEFAULTS);
  const [errors,  setErrors]    = useState({});

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await dataService.getConfig();
      const data = res.data || res || {};
      setConfig({ ...DEFAULTS, ...data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setConfig(c => ({ ...c, [key]: val }));

  const validate = () => {
    const e = {};
    if (!config.empresa_nombre?.trim()) e.empresa_nombre = 'Nombre requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await Promise.all(
        Object.keys(config).map(k => dataService.updateConfig(k, config[k] || ''))
      );
      showSuccess('Configuración guardada correctamente');
    } catch (err) {
      showError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Restaurar valores por defecto?')) return;
    try {
      setSaving(true);
      await Promise.all(Object.keys(DEFAULTS).map(k => dataService.updateConfig(k, DEFAULTS[k])));
      setConfig({ ...DEFAULTS });
      showSuccess('Configuración restaurada');
    } catch {
      showError('Error al restaurar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const btnBase = {
    border: 'none', borderRadius: '8px', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '7px',
    cursor: saving ? 'not-allowed' : 'pointer',
    fontSize: '13px', padding: '10px 20px',
    opacity: saving ? 0.6 : 1, transition: 'all 0.15s',
  };

  return (
    <div style={{ padding: '28px 32px', color: C.text, minHeight: '100%', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700' }}>Configuración del Sistema</h1>
        <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Parámetros generales de ALISAR — estos datos aparecen en los reportes PDF</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Datos de la Empresa */}
        <Section icon={Building2} title="Datos de la Empresa" color={C.yellow}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="Razón Social" required error={errors.empresa_nombre}>
              <input
                value={config.empresa_nombre}
                onChange={e => set('empresa_nombre', e.target.value)}
                disabled={saving}
                placeholder="ALISAR S.R.L."
                style={inputStyle(saving)}
              />
            </Field>
            <Field label="NIT / RUC">
              <input
                value={config.empresa_nit}
                onChange={e => set('empresa_nit', e.target.value)}
                disabled={saving}
                placeholder="Ej: 123456789"
                style={inputStyle(saving)}
              />
            </Field>
            <Field label="Teléfono">
              <input
                value={config.empresa_telefono}
                onChange={e => set('empresa_telefono', e.target.value)}
                disabled={saving}
                placeholder="+591 3 123 4567"
                style={inputStyle(saving)}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={config.empresa_email}
                onChange={e => set('empresa_email', e.target.value)}
                disabled={saving}
                placeholder="contacto@alisar.bo"
                style={inputStyle(saving)}
              />
            </Field>
          </div>
          <Field label="Ubicación / Dirección">
            <input
              value={config.empresa_ubicacion}
              onChange={e => set('empresa_ubicacion', e.target.value)}
              disabled={saving}
              placeholder="Riberalta, Beni, Bolivia"
              style={inputStyle(saving)}
            />
          </Field>
        </Section>

        {/* Preferencias */}
        <Section icon={SettingsIcon} title="Preferencias del Sistema" color={C.blue}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
            <Field label="Moneda">
              <input
                value={config.empresa_moneda}
                onChange={e => set('empresa_moneda', e.target.value)}
                disabled={saving}
                placeholder="Bs"
                style={inputStyle(saving)}
              />
            </Field>
            <Field label="Idioma">
              <select value={config.empresa_idioma} onChange={e => set('empresa_idioma', e.target.value)} disabled={saving} style={inputStyle(saving)}>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </Field>
            <Field label="Tema Visual">
              <select value={config.tema_modo} onChange={e => set('tema_modo', e.target.value)} disabled={saving} style={inputStyle(saving)}>
                <option value="oscuro">Oscuro</option>
                <option value="claro">Claro (próximamente)</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Vista previa del encabezado PDF */}
        <Section icon={FileText} title="Vista Previa — Encabezado en PDFs" color={C.green}>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px',
            padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', background: C.yellow,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontWeight: '900', fontSize: '20px', color: '#000' }}>A</span>
            </div>
            <div>
              <p style={{ margin: '0 0 2px 0', color: '#fff', fontSize: '16px', fontWeight: '800' }}>
                {config.empresa_nombre || 'ALISAR S.R.L.'}
              </p>
              {config.empresa_nit && (
                <p style={{ margin: '0 0 2px 0', color: C.muted, fontSize: '12px' }}>NIT: {config.empresa_nit}</p>
              )}
              {config.empresa_telefono && (
                <p style={{ margin: '0 0 2px 0', color: C.muted, fontSize: '12px' }}>Tel: {config.empresa_telefono}</p>
              )}
              {config.empresa_email && (
                <p style={{ margin: '0 0 2px 0', color: C.muted, fontSize: '12px' }}>{config.empresa_email}</p>
              )}
              <p style={{ margin: 0, color: C.muted, fontSize: '12px' }}>{config.empresa_ubicacion}</p>
            </div>
          </div>
          <p style={{ color: C.subtle, fontSize: '12px', margin: '10px 0 0 0' }}>
            Así aparecerá la empresa en todos los reportes PDF generados desde el sistema.
          </p>
        </Section>

        {/* Info del sistema */}
        <Section icon={Info} title="Información del Sistema" color={C.purple}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              ['Versión', '2.0.0'],
              ['Entorno', 'Local / PC única'],
              ['Base de Datos', 'SQLite 3'],
              ['Última Actualización', new Date().toLocaleDateString('es-ES')],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '12px', background: C.surface, borderRadius: '8px', border: `1px solid ${C.border}` }}>
                <p style={{ color: C.muted, fontSize: '11px', fontWeight: '600', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{k}</p>
                <p style={{ color: C.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button type="submit" disabled={saving} style={{ ...btnBase, background: C.yellow, color: '#000', padding: '11px 28px', fontSize: '14px' }}>
            <Save size={15} /> {saving ? 'Guardando…' : 'Guardar Cambios'}
          </button>
          <button type="button" onClick={handleReset} disabled={saving} style={{ ...btnBase, background: 'transparent', color: C.red, border: `1px solid ${C.red}44`, padding: '11px 20px' }}>
            <RefreshCw size={14} /> Restaurar Defaults
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
