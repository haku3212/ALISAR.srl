import React, { useState, useEffect } from 'react';
import { History, Clock } from 'lucide-react';
import { dataService } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

const ChangeHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTabla, setFiltroTabla] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await dataService.getAuditLogs();
        if (isMounted) {
          setLogs(response.data || response || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Error al cargar el historial de cambios');
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLogs();
    return () => { isMounted = false; };
  }, []);

  const getActionColor = (accion) => {
    if (!accion) return '#f97316';
    switch (accion.toUpperCase()) {
      case 'CREATE': return '#FFD700';
      case 'UPDATE': return '#60a5fa';
      case 'DELETE': return '#f87171';
      default: return '#f97316';
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES');
  };

  const safeJson = (val) => {
    if (!val) return {};
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return {}; }
  };

  const getActionLabel = (accion) => {
    const labels = {
      CREATE: 'Creado',
      create: 'Creado',
      UPDATE: 'Actualizado',
      update: 'Actualizado',
      DELETE: 'Eliminado',
      delete: 'Eliminado'
    };
    return labels[accion] || accion;
  };

  const filtered = filtroTabla
    ? logs.filter(log => log.tabla?.toLowerCase().includes(filtroTabla.toLowerCase()))
    : logs;

  const tablas = [...new Set(logs.map(log => log.tabla).filter(Boolean))];

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '32px', color: '#e0e0e0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', margin: '0 0 8px 0' }}>Historial de Cambios</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Auditoría de todas las operaciones del sistema</p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Filtro por tabla */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFiltroTabla('')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: !filtroTabla ? '2px solid #FFD700' : '1px solid #374151',
            background: !filtroTabla ? '#1e293b' : '#1f2937',
            color: !filtroTabla ? '#FFD700' : '#999',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: !filtroTabla ? '600' : '400',
            transition: 'all 0.2s'
          }}
        >
          Todas
        </button>
        {tablas.map(tabla => (
          <button
            key={tabla}
            onClick={() => setFiltroTabla(tabla)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: filtroTabla === tabla ? '2px solid #60a5fa' : '1px solid #374151',
              background: filtroTabla === tabla ? '#1e293b' : '#1f2937',
              color: filtroTabla === tabla ? '#60a5fa' : '#999',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filtroTabla === tabla ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {tabla}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: '#1f2937',
            borderRadius: '12px',
            border: '1px solid #374151',
            color: '#6b7280'
          }}>
            <History size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No hay cambios registrados</p>
          </div>
        ) : (
          filtered.map((log, idx) => (
            <div key={log.id ?? idx} style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '20px',
              position: 'relative'
            }}>
              {/* Línea conectora */}
              {idx < filtered.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '40px',
                  width: '2px',
                  height: '20px',
                  background: '#374151'
                }} />
              )}

              {/* Círculo indicador */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: getActionColor(log.accion),
                border: '3px solid #111827',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '6px'
              }}>
                <Clock size={14} color="#111827" />
              </div>

              {/* Contenido */}
              <div style={{
                flex: 1,
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      background: getActionColor(log.accion),
                      color: '#000',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      marginBottom: '8px'
                    }}>
                      {getActionLabel(log.accion)}
                    </span>
                    <h4 style={{ margin: '0 0 4px 0', color: '#e0e0e0', fontSize: '14px' }}>
                      {log.tabla} #{log.registro_id}
                    </h4>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatDate(log.timestamp)}
                  </span>
                </div>

                <p style={{ color: '#999', margin: '0 0 12px 0', fontSize: '13px' }}>
                  Por: <strong>{log.usuario || 'sistema'}</strong>
                </p>

                {/* Cambios */}
                {log.valores_anteriores && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Valores anteriores:</p>
                    <pre style={{
                      background: '#111827',
                      padding: '8px',
                      borderRadius: '4px',
                      color: '#f87171',
                      fontSize: '11px',
                      overflow: 'auto',
                      margin: 0
                    }}>
                      {JSON.stringify(safeJson(log.valores_anteriores), null, 2)}
                    </pre>
                  </div>
                )}

                {log.valores_nuevos && (
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Valores nuevos:</p>
                    <pre style={{
                      background: '#111827',
                      padding: '8px',
                      borderRadius: '4px',
                      color: '#FFD700',
                      fontSize: '11px',
                      overflow: 'auto',
                      margin: 0
                    }}>
                      {JSON.stringify(safeJson(log.valores_nuevos), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChangeHistory;
