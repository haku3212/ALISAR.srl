import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Maquinaria from './components/Maquinaria';
import Obras from './components/Obras';
import Personal from './components/Personal';
import Madera from './components/Madera';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/maquinaria" element={<Dashboard content={<Maquinaria />} />} />
        <Route path="/obras" element={<Dashboard content={<Obras />} />} />
        <Route path="/personal" element={<Dashboard content={<Personal />} />} />
        <Route path="/madera" element={<Dashboard content={<Madera />} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
export default App;