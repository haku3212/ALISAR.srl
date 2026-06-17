import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Download, Upload, Key, Eye, EyeOff } from 'lucide-react';
import { dataService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validatePassword } from '../utils/validators';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import FormInput from './common/FormInput';

const sectionStyle = {
  background: '#111411',
  border: '1px solid #1f241f',
  borderRadius: '12px',
  padding: '24px',
};

const Settings = () => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [config, setConfig] = useState({
    empresa_nombre: '',
    empresa_ubicacion: '',
    empresa_moneda: '',
    empresa_idioma: '',
    tema_modo: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await dataService.getConfig();
      setConfig(response.data || response || {});
      setError(null);
    } catch (err) {
      setError('Error al cargar la configuración');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!config.empresa_nombre || !config.empresa_nombre.trim()) {
      errors.empresa_nombre = 'Nombre de empresa requerido';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await Promise.all([
        dataService.updateConfig('empresa_nombre', config.empresa_nombre),
        dataService.updateConfig('empresa_ubicacion', config.empresa_ubicacion),
        dataService.updateConfig('empresa_moneda', config.empresa_moneda),
        dataService.updateConfig('empresa_idioma', config.empresa_idioma),
        dataService.updateConfig('tema_modo', config.tema_modo)
      ]);
      showSuccess('Configuración guardada correctamente');
    } catch (err) {
      showError('Error al guardar la configuración');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('¿Restaurar configuración por defecto?')) {
      try {
        setSaving(true);
        const defaults = {
          empresa_nombre: 'ALISAR SRL',
          empresa_ubicacion: 'Riberalta, Beni, Bolivia',
          empresa_moneda: 'Bs',
          empresa_idioma: 'es',
          tema_modo: 'oscuro'
        };
        await Promise.all(
          Object.entries(defaults).map(([k, v]) => dataService.updateConfig(k, v))
        );
        setConfig(defaults);
        showSuccess('Configuración restaurada');
      } catch (err) {
        showError('Error al restaurar configuración');
      } finally {
        setSaving(false);
      }
    }
  };

  // ── BACKUP ────────────────────────────────────────────────────────────────────

  const handleExportBackup = async () => {
    try {
      setBackingUp(true);
      const response = await dataService.exportBackup();
      const data = response.data || response;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fecha = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `alisar_backup_${fecha}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Respaldo exportado correctamente');
    } catch (err) {
      showError('Error al generar el respaldo');
      console.error(err);
    } finally {
      setBackingUp(false);
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      showError('Selecciona un archivo .json de respaldo válido');
      return;
    }
    if (!window.confirm('⚠️ Esto reemplazará TODOS los datos actuales con el respaldo. ¿Continuar?')) {
      fileInputRef.current.value = '';
      return;
    }
    try {
      setRestoring(true);
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.datos) {
        showError('El archivo no es un respaldo válido de ALISAR');
        return;
      }
      await dataService.restoreBackup(backup.datos);
      showSuccess('Datos restaurados correctamente. Recarga la aplicación.');
    } catch (err) {
      showError('Error al restaurar el respaldo');
      console.error(err);
    } finally {
      setRestoring(false);
      fileInputRef.current.value = '';
    }
  };

  // ── CAMBIAR CONTRASEÑA ────────────────────────────────────────────────────────

  const validatePassword_ = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Contraseña actual requerida';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Nueva contraseña requerida';
    } else if (!validatePassword(passwordForm.newPassword)) {
      errors.newPassword = 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword_()) return;
    try {
      setChangingPassword(true);
      await dataService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showSuccess('Contraseña actualizada correctamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.error || 'Error al cambiar contraseña';
      showError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #1f241f',
    background: '#0d0f0d',
    color: '#e0e0e0',
    outline: 'none',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#e0e0e0',
    fontSize: '14px',
    fontWeight: '500'
  };

  const PasswordField = ({ label, field, value, error }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          value={value}
          onChange={(e) => setPasswordForm(prev => ({ ...prev, [field]: e.target.value }))}
          disabled={changingPassword}
          style={{ ...inputStyle, paddingRight: '40px' }}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })}
          style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0
          }}
        >
          {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '12px', margin: '4px 0 0 0' }}>{error}</p>}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#fff', margin: '0 0 8px 0' }}>Configuración del Sistema</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Gestiona los parámetros generales de ALISAR</p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Sección: Datos de Empresa */}
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 16px 0', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingsIcon size={20} /> Información de la Empresa
            </h3>
            <FormInput
              label="Nombre de la Empresa"
              value={config.empresa_nombre}
              onChange={(e) => setConfig({ ...config, empresa_nombre: e.target.value })}
              error={formErrors.empresa_nombre}
              disabled={saving}
              required
              placeholder="Ej: ALISAR SRL"
            />
            <FormInput
              label="Ubicación"
              value={config.empresa_ubicacion}
              onChange={(e) => setConfig({ ...config, empresa_ubicacion: e.target.value })}
              disabled={saving}
              placeholder="Ej: Riberalta, Beni, Bolivia"
            />
            <FormInput
              label="Moneda"
              value={config.empresa_moneda}
              onChange={(e) => setConfig({ ...config, empresa_moneda: e.target.value })}
              disabled={saving}
              placeholder="Ej: Bs, USD, etc"
            />
          </div>

          {/* Sección: Preferencias */}
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 16px 0', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Preferencias
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Idioma</label>
              <select
                value={config.empresa_idioma}
                onChange={(e) => setConfig({ ...config, empresa_idioma: e.target.value })}
                disabled={saving}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tema</label>
              <select
                value={config.tema_modo}
                onChange={(e) => setConfig({ ...config, tema_modo: e.target.value })}
                disabled={saving}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="oscuro">Oscuro</option>
                <option value="claro">Claro (Próximamente)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: '#FFD700', color: '#000', border: 'none', padding: '12px 24px',
                borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
              }}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              style={{
                background: 'transparent', color: '#f87171', border: '1px solid #f87171',
                padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
              }}
            >
              <RefreshCw size={16} /> Restaurar Defaults
            </button>
          </div>
        </form>

        {/* Sección: Respaldo de Datos */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 8px 0', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={20} /> Respaldo de Datos
          </h3>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 20px 0' }}>
            Exporta todos los datos del sistema a un archivo JSON. Guarda el respaldo en un lugar seguro (USB, nube, etc.)
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportBackup}
              disabled={backingUp || restoring}
              style={{
                background: '#FFD700', color: '#000', border: 'none', padding: '12px 20px',
                borderRadius: '8px', fontWeight: 'bold', cursor: backingUp ? 'not-allowed' : 'pointer',
                opacity: backingUp ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
              }}
            >
              <Download size={16} /> {backingUp ? 'Exportando...' : 'Exportar Respaldo'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={backingUp || restoring}
              style={{
                background: 'transparent', color: '#60a5fa', border: '1px solid #60a5fa',
                padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold',
                cursor: restoring ? 'not-allowed' : 'pointer', opacity: restoring ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
              }}
            >
              <Upload size={16} /> {restoring ? 'Restaurando...' : 'Importar Respaldo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              style={{ display: 'none' }}
            />
          </div>
          <p style={{ color: '#555', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
            ⚠️ La importación reemplaza todos los datos actuales. Se recomienda exportar antes de importar.
          </p>
        </div>

        {/* Sección: Cambiar Contraseña */}
        <form onSubmit={handleChangePassword}>
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 8px 0', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={20} /> Cambiar Contraseña
            </h3>
            <p style={{ color: '#666', fontSize: '13px', margin: '0 0 20px 0' }}>
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
            </p>
            <PasswordField
              label="Contraseña Actual"
              field="current"
              value={passwordForm.currentPassword}
              error={passwordErrors.currentPassword}
            />
            <PasswordField
              label="Nueva Contraseña"
              field="new"
              value={passwordForm.newPassword}
              error={passwordErrors.newPassword}
            />
            <PasswordField
              label="Confirmar Nueva Contraseña"
              field="confirm"
              value={passwordForm.confirmPassword}
              error={passwordErrors.confirmPassword}
            />
            <button
              type="submit"
              disabled={changingPassword}
              style={{
                background: '#FFD700', color: '#000', border: 'none', padding: '12px 24px',
                borderRadius: '8px', fontWeight: 'bold', cursor: changingPassword ? 'not-allowed' : 'pointer',
                opacity: changingPassword ? 0.6 : 1, display: 'flex', alignItems: 'center',
                gap: '8px', fontSize: '14px', marginTop: '8px'
              }}
            >
              <Key size={16} /> {changingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>

        {/* Sección: Información del Sistema */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#f97316' }}>ℹ️ Información del Sistema</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <p style={{ color: '#666', fontSize: '12px', margin: '0 0 4px 0' }}>Versión</p>
              <p style={{ color: '#e0e0e0', margin: 0, fontSize: '14px' }}>1.0.0</p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px', margin: '0 0 4px 0' }}>Fecha de Instalación</p>
              <p style={{ color: '#e0e0e0', margin: 0, fontSize: '14px' }}>2026-05-20</p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px', margin: '0 0 4px 0' }}>Última Actualización</p>
              <p style={{ color: '#e0e0e0', margin: 0, fontSize: '14px' }}>{new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
