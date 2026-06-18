import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, HardHat, Drill, Users, Trees, Tent, FileText, Settings, LogOut, Search, Bell, Download, Plus } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  const styles = {
    container: { display: 'flex', height: '100vh', background: '#111827', color: '#e0e0e0', fontFamily: 'Inter, sans-serif', overflow: 'hidden' },
    sidebar: { width: '260px', background: '#1f2937', borderRight: '1px solid #374151', display: 'flex', flexDirection: 'column', padding: '24px 16px' },
    navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: '#9ca3af', cursor: 'pointer', marginBottom: '4px', fontSize: '14px', transition: '0.2s' },
    navActive: { background: '#1e293b', color: '#4ade80', border: '1px solid #374151' },
    main: { flex: 1, padding: '32px', overflowY: 'auto', background: '#111827' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    card: { background: '#1f2937', border: '1px solid #374151', borderRadius: '16px', padding: '24px', position: 'relative' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' },
    btnPrimary: { background: '#4ade80', color: '#111827', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    progressBg: { background: '#374151', height: '10px', borderRadius: '5px', marginTop: '15px' },
    progressFill: { background: '#4ade80', height: '100%', borderRadius: '5px', boxShadow: '0 0 10px #4ade80', width: '36%' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ background: '#4ade80', padding: '8px', borderRadius: '8px' }}><HardHat size={20} color="#000" /></div>
          <div><h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>ALISAR</h2><p style={{ margin: 0, fontSize: '10px', color: '#4ade80' }}>SISTEMA INTEGRAL</p></div>
        </div>
        <div style={{ ...styles.navItem, ...styles.navActive }}><LayoutDashboard size={18} /> Dashboard</div>
        <div style={styles.navItem}><HardHat size={18} /> Obras</div>
        <div style={styles.navItem}><Drill size={18} /> Maquinaria</div>
        <div style={styles.navItem}><Users size={18} /> Personal / RRHH</div>
        <div style={{ ...styles.navItem, marginTop: 'auto', color: '#f87171' }} onClick={handleLogout}><LogOut size={18} /> Cerrar Sesión</div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#fff' }}>Buenos días, Carlos Antelo</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>Resumen operativo - Alisar S.R.L.</p>
          </div>
          <button style={styles.btnPrimary}><Plus size={18} /> Nueva Obra</button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.card}><p style={{ color: '#666', fontSize: '12px' }}>OBRAS ACTIVAS</p><h2 style={{ fontSize: '32px', margin: '10px 0' }}>4</h2><span style={{ color: '#4ade80' }}>↗ 5 total</span></div>
          <div style={styles.card}><p style={{ color: '#666', fontSize: '12px' }}>MAQ. OPERATIVAS</p><h2 style={{ fontSize: '32px', margin: '10px 0' }}>27/31</h2><span style={{ color: '#f87171' }}>- 1 mant.</span></div>
          <div style={styles.card}><p style={{ color: '#666', fontSize: '12px' }}>PERSONAL</p><h2 style={{ fontSize: '32px', margin: '10px 0' }}>50</h2><span style={{ color: '#4ade80' }}>↗ 43 fijos</span></div>
          <div style={styles.card}><p style={{ color: '#666', fontSize: '12px' }}>MADERA</p><h2 style={{ fontSize: '32px', margin: '10px 0' }}>177m³</h2><span style={{ color: '#4ade80' }}>↗ 18 mes</span></div>
        </div>

        <div style={styles.card}>
          <h3>Presupuesto vs Ejecución</h3>
          <div style={{ display: 'flex', gap: '40px', margin: '20px 0' }}>
            <div><p style={{ fontSize: '11px', color: '#666' }}>PRESUPUESTO</p><h3>Bs 16.850.000</h3></div>
            <div><p style={{ fontSize: '11px', color: '#666' }}>EJECUTADO</p><h3 style={{ color: '#FFD700' }}>Bs 6.000.000</h3></div>
          </div>
          <div style={styles.progressBg}><div style={styles.progressFill}></div></div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;