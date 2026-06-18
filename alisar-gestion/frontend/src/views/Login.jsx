import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token); // Guardamos el token
      navigate('/dashboard'); // ¡Saltamos al Dashboard!
    } catch (err) {
      setError('Credenciales inválidas. Intente de nuevo.');
    }
  };

  const styles = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', color: '#e0e0e0', fontFamily: 'sans-serif' },
    card: { background: '#1f2937', padding: '40px', borderRadius: '16px', border: '1px solid #374151', width: '350px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
    logo: { width: '50px', height: '50px', background: '#4ade80', borderRadius: '12px', margin: '0 auto 20px', display: 'grid', placeItems: 'center', color: '#111827', fontSize: '24px', fontWeight: 'bold' },
    title: { textAlign: 'center', fontSize: '24px', marginBottom: '8px' },
    sub: { textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff', outline: 'none', marginBottom: '15px' },
    btn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#4ade80', color: '#111827', fontWeight: 'bold', cursor: 'pointer' },
    error: { color: '#f87171', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>A</div>
        <h2 style={styles.title}>ALISAR S.R.L.</h2>
        <p style={styles.sub}>Gestión de Maquinaria</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={onSubmit}>
          <input style={styles.input} type="text" name="usuario" onChange={onChange} placeholder="Usuario" required />
          <input style={styles.input} type="password" name="password" onChange={onChange} placeholder="Contraseña" required />
          <button type="submit" style={styles.btn}>INGRESAR AL SISTEMA</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
