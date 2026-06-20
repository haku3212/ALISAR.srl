import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (usuario, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(usuario, password);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(token);
      setUser(userData);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error al iniciar sesión';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setError(null);
  };

  // Escucha el evento que dispara el interceptor 401 de api.js para limpiar el estado React
  // (localStorage ya fue limpiado en el interceptor; aquí reseteamos el estado en memoria)
  useEffect(() => {
    const handleForceLogout = () => { setUser(null); setToken(null); };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // Timer que limpia el token exactamente al expirar — evita que isAuthenticated quede stale
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      if (msUntilExpiry <= 0) { setToken(null); setUser(null); return; }
      const timer = setTimeout(() => { setToken(null); setUser(null); }, msUntilExpiry);
      return () => clearTimeout(timer);
    } catch { /* token malformado — el interceptor 401 lo manejará en la próxima petición */ }
  }, [token]);

  // Calculado en cada render (sin useMemo) para que Date.now() sea siempre fresco
  const isAuthenticated = (() => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  })();

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
