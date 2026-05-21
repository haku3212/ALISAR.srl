import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { dataService } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import FormInput from './common/FormInput';

const Settings = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    empresa_nombre: '',
    empresa_ubicacion: '',
    empresa_moneda: '',
    empresa_idioma: '',
    tema_modo: ''
  });
  const [formErrors, setFormErrors] = useState({});

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

      // Actualizar cada configuración
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
        await Promise.all([
          dataService.updateConfig('empresa_nombre', 'ALISAR SRL'),
          dataService.updateConfig('empresa_ubicacion', 'Riberalta, Beni, Bolivia'),
          dataService.updateConfig('empresa_moneda', 'Bs'),
          dataService.updateConfig('empresa_idioma', 'es'),
          dataService.updateConfig('tema_modo', 'oscuro')
        ]);
        setConfig({
          empresa_nombre: 'ALISAR SRL',
          empresa_ubicacion: 'Riberalta, Beni, Bolivia',
          empresa_moneda: 'Bs',
          empresa_idioma: 'es',
          tema_modo: 'oscuro'
        });
        showSuccess('Configuración restaurada');
      } catch (err) {
        showError('Error al restaurar configuración');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#fff', margin: '0 0 8px 0' }}>Configuración del Sistema</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Gestiona los parámetros generales de ALISAR</p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sección: Datos de Empresa */}
          <div style={{
            background: '#111411',
            border: '1px solid #1f241f',
            borderRadius: '12px',
            padding: '24px'
          }}>
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
          <div style={{
            background: '#111411',
            border: '1px solid #1f241f',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Preferencias
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e0e0e0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Idioma
              </label>
              <select
                value={config.empresa_idioma}
                onChange={(e) => setConfig({ ...config, empresa_idioma: e.target.value })}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #1f241f',
                  background: '#0d0f0d',
                  color: '#e0e0e0',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#e0e0e0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Tema
              </label>
              <select
                value={config.tema_modo}
                onChange={(e) => setConfig({ ...config, tema_modo: e.target.value })}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #1f241f',
                  background: '#0d0f0d',
                  color: '#e0e0e0',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="oscuro">Oscuro</option>
                <option value="claro">Claro (Próximamente)</option>
              </select>
            </div>
          </div>

          {/* Sección: Información del Sistema */}
          <div style={{
            background: '#111411',
            border: '1px solid #1f241f',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f97316' }}>ℹ️ Información del Sistema</h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
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

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: '#FFD700',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              style={{
                background: 'transparent',
                color: '#f87171',
                border: '1px solid #f87171',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <RefreshCw size={16} /> Restaurar Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
