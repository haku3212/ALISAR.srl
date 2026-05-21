/**
 * App.js - Componente Raíz de la Aplicación
 *
 * Este archivo define la estructura principal de la aplicación ALISAR:
 * - Configuración de rutas protegidas
 * - Proveedores de contexto global (Autenticación, Notificaciones)
 * - Importación y renderizado de todos los módulos principales
 *
 * La aplicación implementa un sistema de autenticación JWT con rutas protegidas,
 * notificaciones globales (toasts), y una arquitectura modular basada en componentes.
 */

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
import Rodeos from './components/Rodeos';
import ChangeHistory from './components/ChangeHistory';
import Settings from './components/Settings';

/**
 * Componente ProtectedRoute
 * Envoltura que protege rutas requiriendo autenticación válida
 * Si el usuario no está autenticado, redirige a la página de login
 * @param {React.ReactNode} children - Componente a renderizar si está autenticado
 * @returns {React.ReactNode} El componente o redirección a login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

/**
 * Componente AppRoutes
 * Define todas las rutas de la aplicación
 * La página de login (/) es pública
 * Todos los demás módulos están protegidos con ProtectedRoute
 *
 * Rutas disponibles:
 * - /: Login (público)
 * - /dashboard: Dashboard principal
 * - /personal: Módulo de recursos humanos
 * - /maquinaria: Módulo de gestión de equipos
 * - /obras: Módulo de gestión de proyectos
 * - /madera: Módulo de inventario de madera
 * - /historial: Módulo de auditoría y cambios
 * - /configuracion: Módulo de configuración del sistema
 *
 * @returns {React.ReactElement} Elemento de rutas configurado
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública: Login */}
      <Route path="/" element={<Login />} />

      {/* Rutas protegidas: Dashboard y módulos */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/maquinaria" element={<ProtectedRoute><Dashboard content={<Maquinaria />} /></ProtectedRoute>} />
      <Route path="/obras" element={<ProtectedRoute><Dashboard content={<Obras />} /></ProtectedRoute>} />
      <Route path="/personal" element={<ProtectedRoute><Dashboard content={<Personal />} /></ProtectedRoute>} />
      <Route path="/madera" element={<ProtectedRoute><Dashboard content={<Madera />} /></ProtectedRoute>} />
      <Route path="/rodeos" element={<ProtectedRoute><Dashboard content={<Rodeos />} /></ProtectedRoute>} />
      <Route path="/historial" element={<ProtectedRoute><Dashboard content={<ChangeHistory />} /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Dashboard content={<Settings />} /></ProtectedRoute>} />

      {/* Ruta comodín: Redirige a login si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

/**
 * Componente App Principal
 *
 * Estructura de proveedores (de fuera a dentro):
 * 1. ToastProvider: Sistema global de notificaciones
 * 2. AuthProvider: Contexto de autenticación (login, token, usuario)
 * 3. Router: Enrutador de React Router para navegación
 * 4. ToastContainer: Renderiza los toasts en pantalla
 *
 * Esto asegura que:
 * - Todos los componentes tengan acceso a autenticación y notificaciones
 * - Los toasts se muestren en una posición consistente
 * - Las rutas se manejen correctamente
 *
 * @returns {React.ReactElement} La aplicación envuelta en proveedores
 */
function App() {
  return (
    // ToastProvider: Proporciona el contexto para notificaciones (toasts)
    <ToastProvider>
      {/* AuthProvider: Proporciona autenticación y estado de usuario */}
      <AuthProvider>
        {/* Router: Habilita el enrutamiento en la aplicación */}
        <Router>
          {/* AppRoutes: Define todas las rutas disponibles */}
          <AppRoutes />

          {/* ToastContainer: Renderiza todas las notificaciones activas */}
          <ToastContainer />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;