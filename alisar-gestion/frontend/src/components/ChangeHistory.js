import React, { useState, useEffect } from 'react';
import { History, Clock, Download, Search, RefreshCw, Filter } from 'lucide-react';
import { dataService } from '../services/api';
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

const actionConfig = {
  CREATE: { label: 'Creado',      color: C.green  },
  UPDATE: { label: 'Actualizado', color: C.blue   },
  DELETE: { label: 'Eliminado',   color: C.red    },
};

const getAC = (accion) => actionConfig[(accion || '').toUpperCase()] || { label: accion, color: C.orange };

const tablaBadgeColor = {
  obras:      C.yellow,
  personal:   C.purple,
  maquinaria: C.blue,
  madera:     C.green,
};

const PAGE_SIZE = 25;

const ChangeHistory = () => {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filtroTabla, setFiltroTabla] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [page,       setPage]       = useState(1);
  const [expanded,   setExpanded]   = useState({});
  const [backingUp,  setBackingUp]  = useState(false);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await dataService.getAuditLogs();
      setLogs(res.data || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/backup`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Error en backup');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_alisar_${new Date().toISOString().slice(0, 10)}.db`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup fallido:', err);
    } finally {
      setBackingUp(false);
    }
  };

  const tablas  = [...new Set(logs.map(l => l.tabla))];
  const acciones = [...new Set(logs.map(l => l.accion))];

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      (log.tabla || '').includes(search) ||
      String(log.registro_id).includes(search) ||
      (log.usuario || '').toLowerCase().includes(search.toLowerCase());
    const matchTabla  = !filtroTabla   || log.tabla   === filtroTabla;
    const matchAccion = !filtroAccion  || log.accion  === filtroAccion;
    return matchSearch && matchTabla && matchAccion;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const tryParse = (str) => {
    try { return JSON.parse(str || '{}'); } catch { return {}; }
  };

  const btnStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: '6px',
    border: active ? `2px solid ${C.yellow}` : `1px solid ${C.border2}`,
    background: active ? `${C.yellow}15` : C.card,
    color: active ? C.yellow : C.muted,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.15s'
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '28px 32px', color: C.text, minHeight: '100%', background: C.bg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700' }}>Historial de Cambios</h1>
          <p style={{ color: C.muted, margin: 0, fontSize: '13px' }}>
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''} · Auditoría completa del sistema
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchLogs} style={{ ...btnStyle(false), display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} /> Actualizar
          </button>
          <button onClick={handleBackup} disabled={backingUp} style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: `1px solid ${C.green}44`,
            background: `${C.green}12`,
            color: C.green,
            cursor: backingUp ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: backingUp ? 0.6 : 1,
            transition: 'all 0.15s'
          }}>
            <Download size={13} /> {backingUp ? 'Descargando…' : 'Backup BD'}
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input
            type="text"
            placeholder="Buscar por tabla, ID, usuario…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
              background: C.surface,
              border: `1px solid ${C.border2}`,
              borderRadius: '7px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filtro tabla */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={13} color={C.muted} />
          <button onClick={() => { setFiltroTabla(''); setPage(1); }} style={btnStyle(!filtroTabla)}>Todos</button>
          {tablas.map(t => (
            <button key={t} onClick={() => { setFiltroTabla(t); setPage(1); }}
              style={{ ...btnStyle(filtroTabla === t), color: filtroTabla === t ? (tablaBadgeColor[t] || C.blue) : C.muted,
                borderColor: filtroTabla === t ? (tablaBadgeColor[t] || C.blue) : C.border2,
                background: filtroTabla === t ? `${tablaBadgeColor[t] || C.blue}15` : C.card }}>
              {t}
            </button>
          ))}
        </div>

        {/* Filtro acción */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {acciones.map(a => {
            const ac = getAC(a);
            return (
              <button key={a} onClick={() => { setFiltroAccion(filtroAccion === a ? '' : a); setPage(1); }}
                style={{ ...btnStyle(filtroAccion === a), color: filtroAccion === a ? ac.color : C.muted,
                  borderColor: filtroAccion === a ? ac.color : C.border2,
                  background: filtroAccion === a ? `${ac.color}15` : C.card }}>
                {ac.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      {paginated.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 32px',
          background: C.card, borderRadius: '12px',
          border: `1px solid ${C.border}`, color: C.muted
        }}>
          <History size={36} style={{ marginBottom: '14px', opacity: 0.4 }} />
          <p style={{ margin: 0 }}>No hay registros con estos filtros</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {paginated.map((log, idx) => {
            const ac = getAC(log.accion);
            const tabColor = tablaBadgeColor[log.tabla] || C.muted;
            const isExp = expanded[log.id];
            const prev = tryParse(log.valores_anteriores);
            const next = tryParse(log.valores_nuevos);

            return (
              <div key={log.id} style={{ display: 'flex', gap: '16px', marginBottom: '12px', position: 'relative' }}>
                {/* Línea */}
                {idx < paginated.length - 1 && (
                  <div style={{ position: 'absolute', left: '13px', top: '34px', width: '2px', height: 'calc(100% - 10px)', background: C.border }} />
                )}

                {/* Dot */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: ac.color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '8px', border: `3px solid ${C.bg}`, zIndex: 1
                }}>
                  <Clock size={12} color="#000" />
                </div>

                {/* Card */}
                <div style={{
                  flex: 1,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${ac.color}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.15s'
                }}>
                  {/* Header row */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <span style={{ background: `${ac.color}22`, color: ac.color, padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {ac.label}
                    </span>
                    <span style={{ background: `${tabColor}18`, color: tabColor, padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                      {log.tabla}
                    </span>
                    <span style={{ color: C.muted, fontSize: '12px' }}>#{log.registro_id}</span>
                    <span style={{ color: C.text, fontSize: '13px', fontWeight: '500' }}>
                      por <strong>{log.usuario || 'sistema'}</strong>
                    </span>
                    <span style={{ marginLeft: 'auto', color: C.muted, fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleDateString('es-ES')} {new Date(log.timestamp).toLocaleTimeString('es-ES')}
                    </span>
                    <span style={{ color: C.subtle, fontSize: '12px' }}>{isExp ? '▲' : '▼'}</span>
                  </div>

                  {/* Detail (expandable) */}
                  {isExp && (
                    <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${C.border}` }}>
                      {Object.keys(prev).length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ color: C.red, fontSize: '11px', fontWeight: '600', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Valores anteriores
                          </p>
                          <pre style={{
                            background: '#0d0f0d', padding: '10px', borderRadius: '6px',
                            color: C.red, fontSize: '11px', overflow: 'auto', margin: 0,
                            border: `1px solid ${C.border}`, maxHeight: '180px'
                          }}>
                            {JSON.stringify(prev, null, 2)}
                          </pre>
                        </div>
                      )}
                      {Object.keys(next).length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={{ color: C.yellow, fontSize: '11px', fontWeight: '600', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Valores nuevos
                          </p>
                          <pre style={{
                            background: '#0d0f0d', padding: '10px', borderRadius: '6px',
                            color: C.yellow, fontSize: '11px', overflow: 'auto', margin: 0,
                            border: `1px solid ${C.border}`, maxHeight: '180px'
                          }}>
                            {JSON.stringify(next, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ ...btnStyle(false), opacity: page === 1 ? 0.4 : 1 }}>
            ← Anterior
          </button>
          <span style={{ color: C.muted, fontSize: '13px' }}>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ ...btnStyle(false), opacity: page === totalPages ? 0.4 : 1 }}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default ChangeHistory;
