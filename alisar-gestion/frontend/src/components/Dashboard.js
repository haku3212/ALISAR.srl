import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, HardHat, Drill, Users, Trees, LogOut, Menu, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ content }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Datos para gráficos del dashboard
  const chartData = [
    { name: 'Ene', works: 40, machinery: 24 },
    { name: 'Feb', works: 30, machinery: 13 },
    { name: 'Mar', works: 20, machinery: 98 },
    { name: 'Abr', works: 27, machinery: 39 },
    { name: 'May', works: 45, machinery: 48 }
  ];

  const pieData = [
    { name: 'Operativo', value: 65, fill: '#4ade80' },
    { name: 'Mantenimiento', value: 25, fill: '#f97316' },
    { name: 'Inactivo', value: 10, fill: '#f87171' }
  ];

  const isActive = (path) => location.pathname === path;

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      background: '#0a0c0a',
      color: '#e0e0e0',
      fontFamily: 'Inter, sans-serif'
    },
    sidebar: {
      width: sidebarOpen ? '260px' : '0',
      background: '#111411',
      borderRight: '1px solid #1f241f',
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
      color: isActive(path) ? '#4ade80' : '#8a8a8a',
      cursor: 'pointer',
      marginBottom: '4px',
      fontSize: '14px',
      background: isActive(path) ? '#1a221a' : 'transparent',
      transition: 'all 0.2s',
      fontWeight: isActive(path) ? '600' : '400'
    }),
    main: {
      flex: 1,
      overflowY: 'auto',
      background: '#0d0f0d',
      padding: sidebarOpen ? '0' : '16px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 24px',
      borderBottom: '1px solid #1f241f',
      background: '#111411'
    },
    menuBtn: {
      background: 'transparent',
      border: 'none',
      color: '#4ade80',
      cursor: 'pointer',
      fontSize: '20px'
    }
  };

  const home = (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: '#fff', marginBottom: '8px' }}>Panel de Control ALISAR</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Resumen operativo - Riberalta 2026</p>

      {/* Tarjetas de estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Obras Activas', value: '5', icon: '🔨' },
          { label: 'Maquinaria', value: '12', icon: '⚙️' },
          { label: 'Personal', value: '24', icon: '👥' },
          { label: 'Volumen Procesado', value: '177 m³', icon: '📦' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#111411',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #1f241f',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '32px' }}>{stat.icon}</div>
            <div>
              <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>{stat.label}</p>
              <h3 style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Gráfico de líneas */}
        <div style={{ background: '#111411', padding: '24px', borderRadius: '12px', border: '1px solid #1f241f' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Evolución Mensual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f241f" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  background: '#1a1d1a',
                  border: '1px solid #1f241f',
                  borderRadius: '8px',
                  color: '#e0e0e0'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="works" stroke="#4ade80" strokeWidth={2} />
              <Line type="monotone" dataKey="machinery" stroke="#60a5fa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pastel */}
        <div style={{ background: '#111411', padding: '24px', borderRadius: '12px', border: '1px solid #1f241f' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Estado de Maquinaria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
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
                  background: '#1a1d1a',
                  border: '1px solid #1f241f',
                  borderRadius: '8px',
                  color: '#e0e0e0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '18px', marginBottom: '32px' }}>ALISAR</div>
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