import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) { setError('Acceso denegado. Verifique sus credenciales.'); }
  };

  const styles = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a2a3a' },
    card: { background: '#ffffff', padding: '40px', borderRadius: '12px', width: '350px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' },
    input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' },
    btn: { width: '100%', padding: '12px', background: '#1a2a3a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{textAlign: 'center', color: '#1a2a3a'}}>ALISAR S.R.L.</h2>
        <p style={{textAlign: 'center', color: '#7f8c8d', fontSize: '12px'}}>SISTEMA DE GESTIÓN INTEGRAL</p>
        {error && <p style={{color: 'red', textAlign: 'center', fontSize: '12px'}}>{error}</p>}
        <form onSubmit={onSubmit}>
          <input style={styles.input} type="text" placeholder="Usuario" onChange={e => setFormData({...formData, usuario: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Contraseña" onChange={e => setFormData({...formData, password: e.target.value})} required />
          <button type="submit" style={styles.btn}>ENTRAR</button>
        </form>
      </div>
    </div>
  );
};
export default Login;