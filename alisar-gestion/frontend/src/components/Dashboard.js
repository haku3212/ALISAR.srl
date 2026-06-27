import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, HardHat, Drill, Users, Trees, LogOut,
  Menu, X, AlertCircle, Clock, History, Settings as SettingsIcon,
  TrendingUp, ChevronRight, Fuel, Wrench
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { dataService } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';

// ─── Paleta y constantes ──────────────────────────────────────────────────────
const C = {
  bg:       '#080a08',
  surface:  '#0f110f',
  card:     '#131513',
  border:   '#1c221c',
  border2:  '#232a23',
  yellow:   '#FFD700',
  yellowDim:'rgba(255,215,0,0.08)',
  blue:     '#60a5fa',
  purple:   '#a78bfa',
  green:    '#34d399',
  orange:   '#f97316',
  red:      '#f87171',
  text:     '#e2e8e2',
  muted:    '#6b7a6b',
  subtle:   '#3a4a3a',
};

// ─── Componente NavItem ───────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, path, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 14px',
      borderRadius: '8px',
      marginBottom: '2px',
      cursor: 'pointer',
      fontSize: '13.5px',
      fontWeight: active ? '600' : '400',
      color: active ? C.yellow : C.muted,
      background: active ? C.yellowDim : 'transparent',
      borderLeft: active ? `3px solid ${C.yellow}` : '3px solid transparent',
      transition: 'all 0.15s',
      userSelect: 'none'
    }}
  >
    <Icon size={16} style={{ flexShrink: 0 }} />
    {label}
  </div>
);

// ─── Componente StatCard ──────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <div style={{
    background: C.card,
    border: `1px solid ${C.border}`,
    borderTop: `3px solid ${color}`,
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: `${color}18`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ color: C.muted, fontSize: '11px', fontWeight: '600', letterSpacing: '1px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ color: color, fontSize: '28px', fontWeight: '700', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ color: C.subtle, fontSize: '11px', margin: '4px 0 0 0' }}>{subtitle}</p>
      )}
    </div>
  </div>
);

// ─── Tooltip personalizado ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1d1a',
      border: `1px solid ${C.border2}`,
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '13px'
    }}>
      <p style={{ color: C.muted, margin: '0 0 6px 0', fontWeight: '600' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontWeight: '500' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString('es-BO') : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const Dashboard = ({ content }) => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats,      setStats]      = useState({ obras: 0, maquinaria: 0, personal: 0, maderaContratos: 0, maderaVolumen: 0 });
  const [lastObras,  setLastObras]  = useState([]);
  const [alertas,    setAlertas]    = useState([]);
  const [maqPie,    setMaqPie]    = useState([]);
  const [obrasBars, setObrasBars]  = useState([]);
  const [personalByRole, setPersonalByRole] = useState([]);
  const [maderaByEstado, setMaderaByEstado] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [oR, mR, pR, maR] = await Promise.all([
          dataService.getObras(),
          dataService.getMaquinaria(),
          dataService.getPersonal(),
          dataService.getMadera()
        ]);
        const obras      = oR.data  || [];
        const maquinaria = mR.data  || [];
        const personal   = pR.data  || [];
        const madera     = maR.data || [];

        const maderaVolumen = madera.reduce((s, m) => s + (parseFloat(m.volumen) || 0), 0);
        setStats({
          obras:           obras.length,
          maquinaria:      maquinaria.length,
          personal:        personal.length,
          maderaContratos: madera.length,
          maderaVolumen:   maderaVolumen
        });

        setLastObras(obras.slice(-5).reverse());

        // Alertas de mantenimiento — equipos con servicio próximo (≤14 días) o vencido
        const hoy = new Date();
        const maqAlerta = maquinaria
          .map(m => {
            let diasRestantes = null;
            if (m.mantenimiento_proximo) {
              diasRestantes = Math.ceil((new Date(m.mantenimiento_proximo) - hoy) / 86400000);
            } else if (m.ultima_revision || m.ultimaRevision) {
              const base = new Date(m.ultima_revision || m.ultimaRevision);
              diasRestantes = Math.ceil((new Date(base.getTime() + 90 * 86400000) - hoy) / 86400000);
            }
            return { ...m, diasRestantes };
          })
          .filter(m => m.diasRestantes !== null && m.diasRestantes <= 14)
          .sort((a, b) => a.diasRestantes - b.diasRestantes);
        setAlertas(maqAlerta.slice(0, 5));

        // Madera por estado de contrato
        const estadoMadMap = {};
        madera.forEach(m => {
          const k = m.estado_contrato || 'Sin estado';
          estadoMadMap[k] = (estadoMadMap[k] || 0) + 1;
        });
        const MAD_COLORS = [C.green, C.yellow, C.blue, C.orange, C.muted];
        setMaderaByEstado(
          Object.entries(estadoMadMap).map(([name, value], i) => ({
            name, value, fill: MAD_COLORS[i % MAD_COLORS.length]
          }))
        );

        // Pie de maquinaria por estado real
        const estadoMap = {};
        maquinaria.forEach(m => {
          const est = m.estado || 'Sin estado';
          estadoMap[est] = (estadoMap[est] || 0) + 1;
        });
        const PIE_COLORS = [C.yellow, C.orange, C.red, C.blue, C.purple];
        setMaqPie(
          Object.entries(estadoMap).map(([name, value], i) => ({
            name, value, fill: PIE_COLORS[i % PIE_COLORS.length]
          }))
        );

        // Barras de obras — presupuesto vs ejecutado (últimas 6)
        setObrasBars(
          obras.slice(-6).map(o => ({
            name: o.nombre.length > 18 ? o.nombre.slice(0, 16) + '…' : o.nombre,
            presupuesto: parseFloat(String(o.presupuesto).replace(/[^0-9.]/g, '')) || 0,
            ejecutado:   parseFloat(String(o.monto_ejecutado).replace(/[^0-9.]/g, '')) || 0
          }))
        );

        // Personal por cargo
        const roleMap = {};
        personal.forEach(p => { roleMap[p.cargo] = (roleMap[p.cargo] || 0) + 1; });
        setPersonalByRole(Object.entries(roleMap).map(([name, cnt]) => ({ name, cantidad: cnt })));

      } catch (err) {
        console.error('Error dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const generatePDF = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth();
    pdf.setFillColor(255, 215, 0);
    pdf.rect(0, 0, W, 28, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('REPORTE GENERAL — ALISAR S.R.L.', W / 2, 16, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}`, W / 2, 24, { align: 'center' });
    let y = 42;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text('RESUMEN ESTADÍSTICO', 20, y); y += 12;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    [
      `Obras Activas: ${stats.obras}`,
      `Equipos de Maquinaria: ${stats.maquinaria}`,
      `Personal Total: ${stats.personal}`,
      `Trabajos Forestales: ${stats.maderaContratos} (${stats.maderaVolumen.toFixed(1)} m³ totales)`
    ].forEach(t => { pdf.text(`• ${t}`, 26, y); y += 7; });
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text('© 2026 ALISAR S.R.L.', W / 2, 285, { align: 'center' });
    pdf.save(`Reporte_ALISAR_${Date.now()}.pdf`);
  };

  const isActive = path => location.pathname === path;
  const now = new Date();
  const fechaHoy = now.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const initials = user?.nombre ? user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';

  // Nombre del módulo activo
  const moduleNames = {
    '/dashboard': 'Panel de Control',
    '/obras': 'Gestión de Obras',
    '/maquinaria': 'Maquinaria',
    '/personal': 'Recursos Humanos',
    '/madera': 'Control de Madera',
    '/historial': 'Historial de Cambios',
    '/configuracion': 'Configuración'
  };
  const currentModule = moduleNames[location.pathname] || 'Panel de Control';

  if (loading) return <LoadingSpinner />;

  const home = (
    <div style={{ padding: '28px 32px' }}>
      {/* Encabezado de sección */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>
            Bienvenido, {user?.nombre?.split(' ')[0] || 'Usuario'}
          </h1>
          <p style={{ color: C.muted, margin: 0, fontSize: '13px', textTransform: 'capitalize' }}>{fechaHoy}</p>
        </div>
        <button onClick={generatePDF} style={{
          background: C.card,
          color: C.text,
          border: `1px solid ${C.border2}`,
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '13px'
        }}>
          <FileText size={15} /> Exportar Reporte
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon={HardHat} label="Obras Activas"      value={stats.obras}                          color={C.yellow} subtitle="Proyectos en curso" />
        <StatCard icon={Drill}   label="Maquinaria"         value={stats.maquinaria}                     color={C.blue}   subtitle="Equipos registrados" />
        <StatCard icon={Users}   label="Personal"           value={stats.personal}                       color={C.purple} subtitle="Empleados activos" />
        <StatCard icon={Trees}   label="Contratos Madera"   value={stats.maderaContratos}                color={C.green}  subtitle="Trabajos forestales" />
        <StatCard icon={Trees}   label="Volumen Forestal"   value={`${stats.maderaVolumen.toFixed(1)} m³`} color={C.orange} subtitle="Total acumulado" />
      </div>

      {/* Alertas de mantenimiento */}
      {alertas.length > 0 && (
        <div style={{
          background: `rgba(249,115,22,0.08)`,
          border: `1px solid rgba(249,115,22,0.3)`,
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={20} color={C.orange} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: C.orange, fontWeight: '600', margin: '0 0 10px 0', fontSize: '14px' }}>
              {alertas.length} equipo(s) requieren atención de mantenimiento
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {alertas.map(m => {
                const vencido = m.diasRestantes <= 0;
                const color = vencido ? C.red : C.orange;
                return (
                  <span key={m.id} style={{
                    background: vencido ? 'rgba(248,113,113,0.15)' : 'rgba(249,115,22,0.15)',
                    color,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: `1px solid ${color}44`
                  }}>
                    {m.nombre} {vencido ? '• VENCIDO' : `• ${m.diasRestantes}d`}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gráficos — fila 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Obras — Presupuesto vs Ejecutado */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={16} color={C.blue} />
            <h3 style={{ margin: 0, color: C.text, fontSize: '14px', fontWeight: '600' }}>
              Presupuesto vs Ejecutado (Bs)
            </h3>
          </div>
          {obrasBars.length === 0 ? (
            <p style={{ color: C.muted, textAlign: 'center', padding: '60px 0', margin: 0 }}>Sin datos de obras</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={obrasBars} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" stroke={C.muted} tick={{ fontSize: 11 }} />
                <YAxis stroke={C.muted} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="presupuesto" name="Presupuesto" fill={C.blue}   radius={[4, 4, 0, 0]} />
                <Bar dataKey="ejecutado"   name="Ejecutado"   fill={C.yellow} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Estado de Maquinaria */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Wrench size={16} color={C.orange} />
            <h3 style={{ margin: 0, color: C.text, fontSize: '14px', fontWeight: '600' }}>
              Estado de Maquinaria
            </h3>
          </div>
          {maqPie.length === 0 ? (
            <p style={{ color: C.muted, textAlign: 'center', padding: '60px 0', margin: 0 }}>Sin maquinaria registrada</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={maqPie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {maqPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {maqPie.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: e.fill, flexShrink: 0 }} />
                    <span style={{ color: C.muted, fontSize: '13px', flex: 1 }}>{e.name}</span>
                    <span style={{ color: e.fill, fontWeight: '700', fontSize: '16px' }}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fila 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Últimas Obras */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardHat size={16} color={C.yellow} />
              <h3 style={{ margin: 0, color: C.text, fontSize: '14px', fontWeight: '600' }}>Últimas Obras</h3>
            </div>
            <button
              onClick={() => navigate('/obras')}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
            >
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
          {lastObras.length === 0 ? (
            <p style={{ color: C.muted, textAlign: 'center', padding: '32px 0', margin: 0 }}>Sin obras registradas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lastObras.slice(0, 4).map(obra => {
                const av = Number(obra.avance) || 0;
                const barColor = av >= 75 ? C.green : av >= 40 ? C.yellow : C.orange;
                return (
                  <div key={obra.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: C.text, fontSize: '13px', fontWeight: '500' }}>{obra.nombre}</span>
                      <span style={{ color: barColor, fontSize: '12px', fontWeight: '700' }}>{av}%</span>
                    </div>
                    <div style={{ background: C.border, borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                      <div style={{ background: barColor, width: `${av}%`, height: '100%', borderRadius: '4px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Personal por Cargo */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={16} color={C.purple} />
            <h3 style={{ margin: 0, color: C.text, fontSize: '14px', fontWeight: '600' }}>Personal por Cargo</h3>
          </div>
          {personalByRole.length === 0 ? (
            <p style={{ color: C.muted, textAlign: 'center', padding: '32px 0', margin: 0 }}>Sin personal registrado</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={personalByRole} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" stroke={C.muted} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke={C.muted} tick={{ fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cantidad" name="Personas" fill={C.purple} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Contratos Forestales por Estado */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trees size={16} color={C.green} />
            <h3 style={{ margin: 0, color: C.text, fontSize: '14px', fontWeight: '600' }}>Contratos Forestales</h3>
          </div>
          {maderaByEstado.length === 0 ? (
            <p style={{ color: C.muted, textAlign: 'center', padding: '32px 0', margin: 0 }}>Sin trabajos registrados</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={maderaByEstado} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {maderaByEstado.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {maderaByEstado.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.fill, flexShrink: 0 }} />
                    <span style={{ color: C.muted, fontSize: '12px', flex: 1 }}>{e.name}</span>
                    <span style={{ color: e.fill, fontWeight: '700', fontSize: '15px' }}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden'
    }}>
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? '240px' : '0',
        minWidth: sidebarOpen ? '240px' : '0',
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s, min-width 0.25s',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px',
              background: C.yellow,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontWeight: '900', fontSize: '16px', color: '#000' }}>A</span>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#fff', lineHeight: 1 }}>ALISAR</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: C.muted, letterSpacing: '1px' }}>S.R.L.</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
          {/* Principal */}
          <p style={{ color: C.subtle, fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', padding: '0 6px', margin: '0 0 6px 0' }}>
            PRINCIPAL
          </p>
          <NavItem icon={LayoutDashboard} label="Dashboard"    path="/dashboard"    active={isActive('/dashboard')}    onClick={() => navigate('/dashboard')} />

          <p style={{ color: C.subtle, fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', padding: '0 6px', margin: '16px 0 6px 0' }}>
            GESTIÓN
          </p>
          <NavItem icon={HardHat} label="Obras"       path="/obras"        active={isActive('/obras')}        onClick={() => navigate('/obras')} />
          <NavItem icon={Drill}   label="Maquinaria"  path="/maquinaria"   active={isActive('/maquinaria')}   onClick={() => navigate('/maquinaria')} />
          <NavItem icon={Users}   label="Personal"    path="/personal"     active={isActive('/personal')}     onClick={() => navigate('/personal')} />
          <NavItem icon={Trees}   label="Madera"      path="/madera"       active={isActive('/madera')}       onClick={() => navigate('/madera')} />

          <p style={{ color: C.subtle, fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', padding: '0 6px', margin: '16px 0 6px 0' }}>
            SISTEMA
          </p>
          <NavItem icon={History}       label="Historial"      path="/historial"     active={isActive('/historial')}     onClick={() => navigate('/historial')} />
          <NavItem icon={SettingsIcon}  label="Configuración"  path="/configuracion" active={isActive('/configuracion')} onClick={() => navigate('/configuracion')} />
        </nav>

        {/* Usuario + Salir */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: C.card, borderRadius: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: `${C.yellow}22`, border: `1px solid ${C.yellow}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: C.yellow }}>{initials}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nombre || 'Usuario'}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: C.muted }}>{user?.rol || 'admin'}</p>
            </div>
          </div>
          <div
            onClick={() => { logout(); navigate('/'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
              color: C.red, fontSize: '13px', fontWeight: '500',
              transition: 'background 0.15s'
            }}
          >
            <LogOut size={15} /> Cerrar Sesión
          </div>
        </div>
      </div>

      {/* ── Área principal ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '56px',
          minHeight: '56px',
          borderBottom: `1px solid ${C.border}`,
          background: C.surface
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ color: C.muted }}>ALISAR</span>
              <ChevronRight size={14} color={C.subtle} />
              <span style={{ color: C.text, fontWeight: '600' }}>{currentModule}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color={C.muted} />
              <span style={{ color: C.muted, fontSize: '12px' }}>{new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: `${C.yellow}22`, border: `1px solid ${C.yellow}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: C.yellow }}>{initials}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
          {content || home}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
