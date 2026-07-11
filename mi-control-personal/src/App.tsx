import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Icon } from './components/Icon';
import { Dashboard } from './pages/Dashboard';
import { WorkHours } from './pages/WorkHours';
import { Fares } from './pages/Fares';
import { Movements } from './pages/Movements';
import { GoalPage } from './pages/Goal';
import { BudgetPage } from './pages/Budget';
import { CalendarPage } from './pages/Calendar';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';

const PAGES = [
  { id: 'dashboard', label: 'Inicio', icon: 'home' },
  { id: 'horas', label: 'Horas trabajadas', icon: 'clock' },
  { id: 'pasajes', label: 'Pasajes', icon: 'bus' },
  { id: 'ingresos', label: 'Ingresos', icon: 'incomes' },
  { id: 'gastos', label: 'Gastos', icon: 'expenses' },
  { id: 'meta', label: 'Meta de ahorro', icon: 'target' },
  { id: 'presupuesto', label: 'Presupuesto', icon: 'budget' },
  { id: 'calendario', label: 'Calendario', icon: 'calendar' },
  { id: 'historial', label: 'Historial', icon: 'history' },
  { id: 'reportes', label: 'Reportes', icon: 'chart' },
  { id: 'configuracion', label: 'Configuración', icon: 'settings' }
] as const;

type PageId = (typeof PAGES)[number]['id'];

function Shell() {
  const { data, toasts } = useData();
  const [page, setPage] = useState<PageId>('dashboard');

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p className="muted">Cargando tus datos…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="brand">
          <Icon name="wallet" size={22} />
          <span>Mi Control Personal</span>
        </div>
        {PAGES.map((p) => (
          <button key={p.id} className={`nav-item ${page === p.id ? 'active' : ''}`} onClick={() => setPage(p.id)}>
            <Icon name={p.icon} size={18} />
            <span>{p.label}</span>
          </button>
        ))}
      </nav>
      <main className="main">
        {page === 'dashboard' && <Dashboard />}
        {page === 'horas' && <WorkHours />}
        {page === 'pasajes' && <Fares />}
        {page === 'ingresos' && <Movements type="ingreso" />}
        {page === 'gastos' && <Movements type="gasto" />}
        {page === 'meta' && <GoalPage />}
        {page === 'presupuesto' && <BudgetPage />}
        {page === 'calendario' && <CalendarPage />}
        {page === 'historial' && <History />}
        {page === 'reportes' && <Reports />}
        {page === 'configuracion' && <SettingsPage />}
      </main>
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.error ? 'error' : ''}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}
