import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Maquinaria from './components/Maquinaria';
import Obras from './components/Obras';
import Personal from './components/Personal';
import Madera from './components/Madera';
import ChangeHistory from './components/ChangeHistory';
import Settings from './components/Settings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/maquinaria"    element={<ProtectedRoute><Dashboard content={<Maquinaria />} /></ProtectedRoute>} />
      <Route path="/obras"         element={<ProtectedRoute><Dashboard content={<Obras />} /></ProtectedRoute>} />
      <Route path="/personal"      element={<ProtectedRoute><Dashboard content={<Personal />} /></ProtectedRoute>} />
      <Route path="/madera"        element={<ProtectedRoute><Dashboard content={<Madera />} /></ProtectedRoute>} />
      <Route path="/historial"     element={<ProtectedRoute><Dashboard content={<ChangeHistory />} /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Dashboard content={<Settings />} /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <ToastContainer />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
