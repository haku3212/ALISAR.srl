import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a los headers
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Servicios de Autenticación
export const authService = {
  login: (usuario, password) =>
    api.post('/auth/login', { usuario, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Servicios de Datos
export const dataService = {
  // Personal
  getPersonal: () => api.get('/personal'),
  createPersonal: (data) => api.post('/personal', data),
  updatePersonal: (id, data) => api.put(`/personal/${id}`, data),
  deletePersonal: (id) => api.delete(`/personal/${id}`),

  // Obras
  getObras: () => api.get('/obras'),
  createObra: (data) => api.post('/obras', data),
  updateObra: (id, data) => api.put(`/obras/${id}`, data),
  deleteObra: (id) => api.delete(`/obras/${id}`),

  // Maquinaria
  getMaquinaria: () => api.get('/maquinaria'),
  createMaquinaria: (data) => api.post('/maquinaria', data),
  updateMaquinaria: (id, data) => api.put(`/maquinaria/${id}`, data),
  deleteMaquinaria: (id) => api.delete(`/maquinaria/${id}`),

  // Madera
  getMadera: () => api.get('/madera'),
  createMadera: (data) => api.post('/madera', data),
  updateMadera: (id, data) => api.put(`/madera/${id}`, data),
  deleteMadera: (id) => api.delete(`/madera/${id}`),

  // Auditoría
  getAuditLogs: () => api.get('/audit'),

  // Configuración
  getConfig: () => api.get('/config'),
  updateConfig: (clave, valor) => api.put(`/config/${clave}`, { valor })
};

export default api;
