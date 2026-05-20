import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, HardHat, Drill, Users, Trees, LogOut } from 'lucide-react';

const Dashboard = ({ content }) => {
  const navigate = useNavigate();
  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  const styles = {
    container: { display: 'flex', height: '100vh', background: '#0a0c0a', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '260px', background: '#111411', borderRight: '1px solid #1f241f', display: 'flex', flexDirection: 'column', padding: '24px 16px' },
    navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: '#8a8a8a', cursor: 'pointer', marginBottom: '4px', fontSize: '14px' },
    main: { flex: 1, overflowY: 'auto', background: '#0d0f0d' }
  };

  const home = (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: '#fff' }}>Panel de Control ALISAR</h1>
      <p style={{ color: '#666' }}>Resumen operativo - Riberalta 2026</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px' }}>
        <div style={{ background: '#111411', padding: '20px', borderRadius: '16px', border: '1px solid #1f241f' }}>
          <p style={{ color: '#666', fontSize: '12px' }}>PROCESADO</p>
          <h2 style={{ fontSize: '32px' }}>177m³</h2>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '20px', marginBottom: '40px' }}>ALISAR S.R.L.</div>
        <div style={styles.navItem} onClick={() => navigate('/dashboard')}><LayoutDashboard size={18} /> Dashboard</div>
        <div style={styles.navItem} onClick={() => navigate('/obras')}><HardHat size={18} /> Obras</div>
        <div style={styles.navItem} onClick={() => navigate('/maquinaria')}><Drill size={18} /> Maquinaria</div>
        <div style={styles.navItem} onClick={() => navigate('/personal')}><Users size={18} /> Personal</div>
        <div style={styles.navItem} onClick={() => navigate('/madera')}><Trees size={18} /> Madera</div>
        <div style={{ ...styles.navItem, marginTop: 'auto', color: '#f87171' }} onClick={handleLogout}><LogOut size={18} /> Salir</div>
      </div>
      <div style={styles.main}>{content || home}</div>
    </div>
  );
};
export default Dashboard;