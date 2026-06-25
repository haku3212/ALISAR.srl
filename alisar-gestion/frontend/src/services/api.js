import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

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
let logoutInProgress = false;

api.interceptors.response.use(
  response => response,
  error => {
    // Excluir el endpoint de login: un 401 ahí significa credenciales incorrectas,
    // no sesión expirada — no debe disparar el logout global
    const isLoginRequest = error.config?.url?.endsWith('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      if (!logoutInProgress) {
        logoutInProgress = true;
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth:logout'));
          setTimeout(() => { logoutInProgress = false; }, 2000);
        } catch (_) {
          logoutInProgress = false;
        }
      }
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

  // Rodeos
  getRodeos: () => api.get('/rodeos'),
  createRodeo: (data) => api.post('/rodeos', data),
  updateRodeo: (id, data) => api.put(`/rodeos/${id}`, data),
  deleteRodeo: (id) => api.delete(`/rodeos/${id}`),

  // Documentos
  getDocumentos: () => api.get('/documentos'),
  createDocumento: (data) => api.post('/documentos', data),
  updateDocumento: (id, data) => api.put(`/documentos/${id}`, data),
  deleteDocumento: (id) => api.delete(`/documentos/${id}`),

  // Auditoría
  getAuditLogs: () => api.get('/audit'),

  // Configuración
  getConfig: () => api.get('/config'),
  updateConfig: (clave, valor) => api.put(`/config/${clave}`, { valor }),

  // Backup y Restauración
  exportBackup: () => api.get('/backup'),
  restoreBackup: (datos) => api.post('/backup/restore', { datos }),

  // Cambiar contraseña
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword })
};

export default api;
