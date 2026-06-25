/**
 * Dashboard.js - VERSIÓN CON COLORES CORPORATIVOS
 * Panel de control principal de ALISAR
 * ✨ Actualizado con colores corporativos: Amarillo (#FFD700) y Negro (#000000)
 * Incluye estadísticas, gráficos, alertas y navegación
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, HardHat, Drill, Users, Trees, LogOut, Menu, X, AlertCircle, CheckCircle, Clock, History, Settings as SettingsIcon, ClipboardList, FileText } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { dataService } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import jsPDF from 'jspdf';


const Dashboard = ({ content }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ obras: 0, maquinaria: 0, personal: 0, madera: 0 });
  const [lastObras, setLastObras] = useState([]);
  const [maintenanceNeeded, setMaintenanceNeeded] = useState([]);
  const [personalByRole, setPersonalByRole] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [docsPorVencer, setDocsPorVencer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Flag isMounted para evitar setState sobre componente desmontado si el usuario navega antes de que resuelvan las promesas
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Todas las peticiones en paralelo para reducir tiempo de carga
        const [obraRes, maquinariaRes, personalRes, maderaRes, docsRes] = await Promise.allSettled([
          dataService.getObras(),
          dataService.getMaquinaria(),
          dataService.getPersonal(),
          dataService.getMadera(),
          dataService.getDocumentos()
        ]);

        // Si el componente se desmontó mientras esperábamos, no actualizamos estado
        if (!isMounted) return;

        const obras = obraRes.status === 'fulfilled' ? (obraRes.value.data || []) : [];
        const maquinaria = maquinariaRes.status === 'fulfilled' ? (maquinariaRes.value.data || []) : [];
        const personal = personalRes.status === 'fulfilled' ? (personalRes.value.data || []) : [];
        const madera = maderaRes.status === 'fulfilled' ? (maderaRes.value.data || []) : [];
        const docs = docsRes.status === 'fulfilled' ? (docsRes.value.data || []) : [];

        // Actualizar estadísticas
        setStats({
          obras: obras.length,
          maquinaria: maquinaria.length,
          personal: personal.length,
          madera: madera.reduce((sum, m) => sum + (m.piezas || 0), 0)
        });

        // Últimas 5 obras
        setLastObras(obras.slice(-5).reverse());

        // Máquinas que necesitan mantenimiento (avance próximo)
        const maintenance = maquinaria
          .filter(m => {
            if (!m.ultimaRevision) return true;
            const lastReview = new Date(m.ultimaRevision);
            const now = new Date();
            const daysAgo = (now - lastReview) / (1000 * 60 * 60 * 24);
            return daysAgo > 90;
          })
          .slice(0, 3);
        setMaintenanceNeeded(maintenance);

        // Calcular pieData real desde maquinaria
        const estadoMap = {};
        maquinaria.forEach(m => {
          const estado = m.estado || 'Desconocido';
          estadoMap[estado] = (estadoMap[estado] || 0) + 1;
        });
        const colorMap = { 'Operativo': '#FFD700', 'Mantenimiento': '#f97316', 'Inactivo': '#f87171', 'En Reparación': '#60a5fa' };
        const pieDataReal = Object.entries(estadoMap).map(([name, value]) => ({
          name, value, fill: colorMap[name] || '#888'
        }));
        setPieData(pieDataReal);

        // Documentos próximos a vencer (próximos 30 días)
        // Comparamos strings YYYY-MM-DD para evitar el desfase de UTC vs hora local
        // que hace que new Date('2026-06-24') sea medianoche UTC (= 20:00 en Bolivia UTC-4)
        const hoyStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en hora local
        const en30Str = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
        const docsPorVencerFiltrados = docs.filter(d => {
          if (!d.fecha_vencimiento) return false;
          const v = d.fecha_vencimiento.split('T')[0];
          return v >= hoyStr && v <= en30Str;
        }).slice(0, 3);
        setDocsPorVencer(docsPorVencerFiltrados);

        // Avisar si algún endpoint falló individualmente
        [obraRes, maquinariaRes, personalRes, maderaRes, docsRes].forEach((r, i) => {
          if (r.status === 'rejected') {
            const names = ['obras', 'maquinaria', 'personal', 'madera', 'documentos'];
            console.warn(`Dashboard: fallo al cargar ${names[i]}:`, r.reason);
          }
        });
        const anyFailed = [obraRes, maquinariaRes, personalRes, maderaRes, docsRes].some(r => r.status === 'rejected');
        if (anyFailed && isMounted) setFetchError('Algunos datos no pudieron cargarse. La información puede estar incompleta.');

        // Personal por cargo (para BarChart)
        const roleMap = {};
        personal.forEach(p => {
          const cargo = p.cargo || 'Sin cargo';
          roleMap[cargo] = (roleMap[cargo] || 0) + 1;
        });
        const roleData = Object.entries(roleMap).map(([cargo, count]) => ({
          name: cargo,
          personal: count
        }));
        setPersonalByRole(roleData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (isMounted) setFetchError('Error al cargar los datos. Verifica la conexión e intenta de nuevo.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    // Cleanup: marca el componente como desmontado al salir
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const generateDashboardReport = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 20;

    // Header - Amarillo corporativo
    pdf.setFillColor(255, 215, 0);
    pdf.rect(0, 0, pageWidth, 30, 'F');

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(28);
    pdf.text('REPORTE GENERAL - ALISAR', pageWidth / 2, 15, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 25, { align: 'center' });

    // Contenido
    pdf.setTextColor(0, 0, 0);
    yPos = 45;

    // Estadísticas
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('RESUMEN ESTADÍSTICO', 20, yPos);
    yPos += 15;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`• Obras Activas: ${stats.obras}`, 25, yPos);
    yPos += 7;
    pdf.text(`• Equipos de Maquinaria: ${stats.maquinaria}`, 25, yPos);
    yPos += 7;
    pdf.text(`• Personal Total: ${stats.personal}`, 25, yPos);
    yPos += 7;
    pdf.text(`• Piezas de Madera: ${stats.madera}`, 25, yPos);
    yPos += 15;

    // Últimas obras
    if (lastObras.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('ÚLTIMAS OBRAS', 20, yPos);
      yPos += 10;

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      lastObras.slice(0, 5).forEach((obra) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(`${obra.nombre} - Avance: ${obra.avance ?? 0}% - Presupuesto: ${obra.presupuesto || 'N/D'}`, 25, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Equipos en mantenimiento
    if (maintenanceNeeded.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('EQUIPOS CON MANTENIMIENTO PRÓXIMO', 20, yPos);
      yPos += 10;

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      maintenanceNeeded.forEach((maq) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(`• ${maq.nombre} (${maq.tipo || 'Sin tipo'})`, 25, yPos);
        yPos += 6;
      });
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`© 2026 ALISAR - Sistema de Gestión`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.save(`Reporte_Dashboard_${new Date().getTime()}.pdf`);
  };

  // Datos para gráficos del dashboard — calculados desde obras reales
  const chartData = lastObras.map(obra => ({
    name: obra.nombre?.substring(0, 12) || 'Sin nombre',
    avance: obra.avance ?? 0,
    presupuesto: parseFloat(obra.presupuesto) || 0
  }));

  const isActive = (path) => location.pathname === path;

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      background: '#111827',
      color: '#e0e0e0',
      fontFamily: 'Inter, sans-serif'
    },
    sidebar: {
      width: sidebarOpen ? '260px' : '0',
      background: '#1f2937',
      borderRight: '1px solid #374151',
      display: 'flex',
      flexDirection: 'column',
      padding: sidebarOpen ? '24px 16px' : '0',
      transition: 'width 0.3s, padding 0.3s',
      overflow: 'hidden'
    },
    navItem: (path) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      color: isActive(path) ? '#FFD700' : '#9ca3af',
      cursor: 'pointer',
      marginBottom: '4px',
      fontSize: '14px',
      background: isActive(path) ? '#1e293b' : 'transparent',
      transition: 'all 0.2s',
      fontWeight: isActive(path) ? '600' : '400'
    }),
    main: {
      flex: 1,
      overflowY: 'auto',
      background: '#111827',
      padding: sidebarOpen ? '0' : '16px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 24px',
      borderBottom: '1px solid #374151',
      background: '#1f2937'
    },
    menuBtn: {
      background: 'transparent',
      border: 'none',
      color: '#FFD700',
      cursor: 'pointer',
      fontSize: '20px'
    }
  };

  if (loading) return <LoadingSpinner />;

  const home = (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#fff', marginBottom: '8px' }}>Panel de Control ALISAR</h1>
          <p style={{ color: '#6b7280', marginBottom: '0' }}>Resumen operativo - Riberalta 2026</p>
        </div>
        <button onClick={generateDashboardReport} style={{
          background: '#f97316',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          <FileText size={18} /> Generar Reporte
        </button>
      </div>

      {/* Error de carga — visible si algún endpoint falló */}
      {fetchError && (
        <div style={{ background: '#2d1515', border: '1px solid #f87171', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />
          <span style={{ color: '#f87171', fontSize: '14px' }}>{fetchError}</span>
          <button onClick={() => window.location.reload()} style={{ marginLeft: 'auto', background: '#f87171', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Reintentar</button>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Obras Activas', value: stats.obras, icon: '🔨', color: '#FFD700' },
          { label: 'Maquinaria', value: stats.maquinaria, icon: '⚙️', color: '#60a5fa' },
          { label: 'Personal', value: stats.personal, icon: '👥', color: '#a78bfa' },
          { label: 'Piezas Madera', value: stats.madera, icon: '📦', color: '#f97316' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#1f2937',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #374151',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '32px' }}>{stat.icon}</div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{stat.label}</p>
              <h3 style={{ color: stat.color, fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas y Warnings */}
      {maintenanceNeeded.length > 0 && (
        <div style={{ background: '#1f2937', border: '1px solid #f97316', borderRadius: '12px', padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'start' }}>
          <AlertCircle size={24} color="#f97316" style={{ flexShrink: 0, marginTop: '4px' }} />
          <div>
            <h3 style={{ color: '#f97316', margin: '0 0 8px 0', fontSize: '16px' }}>Equipos con Mantenimiento Próximo</h3>
            <p style={{ color: '#999', margin: '0 0 12px 0', fontSize: '14px' }}>Los siguientes equipos necesitan revisión en breve:</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {maintenanceNeeded.map(m => (
                <span key={m.id} style={{
                  background: '#374151',
                  color: '#f97316',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: '1px solid #f97316'
                }}>
                  {m.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gráficos principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Avance vs Presupuesto por Obra */}
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Avance vs Presupuesto por Obra (Bs)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e0e0e0'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="presupuesto" stroke="#60a5fa" fill="#1e293b" fillOpacity={0.3} />
              <Area type="monotone" dataKey="avance" stroke="#FFD700" fill="#1e293b" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de Maquinaria */}
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Estado de Maquinaria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, payload }) => {
                  const total = pieData.reduce((s, e) => s + e.value, 0);
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${name} ${pct}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e0e0e0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personal por Cargo */}
      {personalByRole.length > 0 && (
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151', marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Distribución de Personal por Cargo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={personalByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e0e0e0'
                }}
              />
              <Bar dataKey="personal" fill="#a78bfa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Últimas Obras */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardHat size={20} color="#FFD700" /> Últimas 5 Obras
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lastObras.length === 0 ? (
              <p style={{ color: '#6b7280', margin: 0 }}>No hay obras registradas</p>
            ) : (
              lastObras.map(obra => (
                <div key={obra.id} style={{
                  background: '#1f2937',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #374151'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#e0e0e0', fontSize: '14px' }}>{obra.nombre}</h4>
                    <span style={{
                      background: obra.avance >= 75 ? '#1e293b' : obra.avance >= 50 ? '#1e3a5f' : '#2d1515',
                      color: obra.avance >= 75 ? '#FFD700' : obra.avance >= 50 ? '#60a5fa' : '#f87171',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {obra.avance}%
                    </span>
                  </div>
                  <div style={{ background: '#111827', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      background: obra.avance >= 75 ? '#FFD700' : obra.avance >= 50 ? '#60a5fa' : '#f97316',
                      width: `${obra.avance}%`,
                      height: '100%',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '12px', margin: '8px 0 0 0' }}>{obra.presupuesto}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Próximos Eventos */}
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#f97316" /> Próximos Eventos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {docsPorVencer.length === 0 && maintenanceNeeded.length === 0 ? (
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>No hay eventos próximos</p>
            ) : (
              <>
                {docsPorVencer.map(doc => (
                  <div key={doc.id} style={{
                    background: '#1f2937',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    borderLeft: '4px solid #60a5fa'
                  }}>
                    <p style={{ color: '#e0e0e0', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                      Documento por vencer: {doc.numero_documento || doc.tipo_documento || 'Sin nombre'}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>
                      Vence: {new Date(doc.fecha_vencimiento.split('T')[0] + 'T00:00:00').toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))}
                {maintenanceNeeded.map(maq => (
                  <div key={maq.id} style={{
                    background: '#1f2937',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    borderLeft: '4px solid #f97316'
                  }}>
                    <p style={{ color: '#e0e0e0', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                      Revisión de maquinaria: {maq.nombre}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>Requiere mantenimiento</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '18px', marginBottom: '32px' }}>ALISAR</div>
        <nav style={{ flex: 1 }}>
          <div style={styles.navItem('/dashboard')} onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <div style={styles.navItem('/obras')} onClick={() => navigate('/obras')}>
            <HardHat size={18} /> Obras
          </div>
          <div style={styles.navItem('/maquinaria')} onClick={() => navigate('/maquinaria')}>
            <Drill size={18} /> Maquinaria
          </div>
          <div style={styles.navItem('/personal')} onClick={() => navigate('/personal')}>
            <Users size={18} /> Personal
          </div>
          <div style={styles.navItem('/madera')} onClick={() => navigate('/madera')}>
            <Trees size={18} /> Madera
          </div>
          <div style={styles.navItem('/rodeos')} onClick={() => navigate('/rodeos')}>
            <Trees size={18} /> Rodeos
          </div>
          <div style={styles.navItem('/documentos')} onClick={() => navigate('/documentos')}>
            <FileText size={18} /> Documentos
          </div>

          <div style={styles.navItem('/checklist')} onClick={() => navigate('/checklist')}>
            <ClipboardList size={18} /> Checklist SW
          </div>

          {/* Historial y Configuración — solo admin */}
          {user?.rol === 'admin' && (
            <>
              <div style={{ height: '1px', background: '#374151', margin: '16px 0' }} />
              <div style={styles.navItem('/historial')} onClick={() => navigate('/historial')}>
                <History size={18} /> Historial
              </div>
              <div style={styles.navItem('/configuracion')} onClick={() => navigate('/configuracion')}>
                <SettingsIcon size={18} /> Configuración
              </div>
            </>
          )}
        </nav>
        <div style={{ ...styles.navItem('/logout'), color: '#f87171', marginTop: 'auto' }} onClick={handleLogout}>
          <LogOut size={18} /> Salir
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={styles.header}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {user && <span style={{ fontSize: '14px', color: '#999' }}>Bienvenido, {user.nombre}</span>}
        </div>
        <div style={styles.main}>
          {content || home}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
