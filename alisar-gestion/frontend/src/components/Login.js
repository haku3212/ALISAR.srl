import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';

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
    if (success) navigate('/dashboard');
  };

  const displayError = localError || authError;

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: '#080a08',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Panel izquierdo — branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(160deg, #111811 0%, #0a0c0a 100%)',
        borderRight: '1px solid #1a201a',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decoración de fondo */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
          top: '10%',
          left: '-100px'
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)',
          bottom: '10%',
          right: '-80px'
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            background: '#FFD700',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 8px 32px rgba(255,215,0,0.3)'
          }}>
            <span style={{ fontSize: '32px', fontWeight: '900', color: '#000', letterSpacing: '-2px' }}>A</span>
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#fff',
            margin: '0 0 8px 0',
            letterSpacing: '-1px'
          }}>
            ALISAR <span style={{ color: '#FFD700' }}>S.R.L.</span>
          </h1>
          <p style={{ color: '#4a5a4a', fontSize: '13px', fontWeight: '500', letterSpacing: '3px', margin: '0 0 48px 0' }}>
            SISTEMA DE GESTIÓN INTEGRAL
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {[
              { icon: '🏗️', text: 'Control de Obras y Proyectos' },
              { icon: '⚙️', text: 'Gestión de Maquinaria Pesada' },
              { icon: '👥', text: 'Administración de Personal' },
              { icon: '🌳', text: 'Control de Rodeos y Madera' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ color: '#5a6a5a', fontSize: '14px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px 48px',
        background: '#0d0f0d'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
            Iniciar Sesión
          </h2>
          <p style={{ color: '#4a5a4a', fontSize: '14px', margin: 0 }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {displayError && (
          <div style={{
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={16} color="#f87171" />
            <span style={{ color: '#f87171', fontSize: '14px' }}>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#8a9a8a', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '8px' }}>
              USUARIO
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#4a5a4a" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={formData.usuario}
                onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '13px 16px 13px 42px',
                  borderRadius: '10px',
                  border: '1px solid #1f281f',
                  background: '#111811',
                  color: '#e0e0e0',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#FFD700'}
                onBlur={e => e.target.style.borderColor = '#1f281f'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#8a9a8a', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '8px' }}>
              CONTRASEÑA
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#4a5a4a" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '13px 16px 13px 42px',
                  borderRadius: '10px',
                  border: '1px solid #1f281f',
                  background: '#111811',
                  color: '#e0e0e0',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#FFD700'}
                onBlur={e => e.target.style.borderColor = '#1f281f'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#8a7200' : '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              marginTop: '8px',
              letterSpacing: '0.5px'
            }}
          >
            {loading ? 'INGRESANDO...' : (
              <>
                <LogIn size={18} /> INGRESAR AL SISTEMA
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#2a3a2a', fontSize: '12px', marginTop: '48px' }}>
          © 2026 ALISAR S.R.L. — Riberalta, Beni
        </p>
      </div>
    </div>
  );
};

export default Login;
