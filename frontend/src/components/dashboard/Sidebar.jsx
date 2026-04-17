import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../style/dashboard/dashboard.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Profile', path: '/dashboard/profile' },
    { name: 'My Orders', path: '/dashboard/orders' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="user-brief">
        <div className="avatar">JD</div>
        <p>John Doe</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;