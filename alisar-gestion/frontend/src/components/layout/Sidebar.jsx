import React from 'react';

const Sidebar = () => {
  const menuItems = ['Dashboard', 'Maquinaria', 'Obras', 'Personal', 'Configuración'];
  return (
    <div style={{ width: '250px', background: '#0a110d', borderRight: '1px solid #28342a', padding: '20px' }}>
      <h3 style={{ color: '#FFD700', fontFamily: 'sans-serif' }}>ALISAR S.R.L.</h3>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
        {menuItems.map(item => (
          <li key={item} style={{ padding: '12px', color: '#9aa39a', cursor: 'pointer', borderBottom: '1px solid #1f2922' }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Sidebar;
