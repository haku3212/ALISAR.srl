import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

const Login = () => {
  const [formData, setFormData] = useState({ usuario: '', password: '' });
  const [localError, setLocalError] = useState('');
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLocalError('');

    if (!formData.usuario || !formData.password) {
      setLocalError('Usuario y contraseña son requeridos');
      return;
    }

    const success = await login(formData.usuario, formData.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const displayError = localError || authError;

  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0c0a 0%, #111411 100%)'
    },
    card: {
      background: '#1a1d1a',
      padding: '40px',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '380px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      border: '1px solid #1f241f'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#FFD700',
      margin: 0,
      marginBottom: '8px'
    },
    subtitle: {
      color: '#666',
      fontSize: '13px',
      margin: 0
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #1f241f',
      background: '#111411',
      color: '#e0e0e0',
      outline: 'none',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '12px',
      background: '#FFD700',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontWeight: 'bold',
      marginTop: '8px',
      opacity: loading ? 0.6 : 1,
      transition: 'opacity 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>ALISAR S.R.L.</h1>
          <p style={styles.subtitle}>SISTEMA DE GESTIÓN INTEGRAL</p>
        </div>

        {displayError && (
          <ErrorMessage
            message={displayError}
            onDismiss={() => setLocalError('')}
          />
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Usuario"
            value={formData.usuario}
            onChange={e => setFormData({ ...formData, usuario: e.target.value })}
            disabled={loading}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'INGRESANDO...' : 'ENTRAR'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '24px' }}>
          Demo: usuario: <strong>admin</strong> | contraseña: <strong>riberalta</strong>
        </p>
      </div>
    </div>
  );
};

export default Login;