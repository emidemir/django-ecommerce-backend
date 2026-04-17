import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../style/common/navbar.css';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  // Simulating authentication state
  const { user, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">E-Shop</Link>
      </div>

      <div className="nav-center">
        <div className="search-container">
          <input type="text" placeholder="Search products..." className="search-input" />
          <button className="search-icon-btn">🔍</button>
        </div>
      </div>

      <div className="nav-right">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/items">Products</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          
          {/* Conditional Rendering Logic */}
          {isLoggedIn ? (
            <li className="user-menu-item">
              <Link to="/dashboard/orders" className="profile-link">
                <div className="nav-avatar">JD</div>
                <span>Account</span>
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/auth/login" className="login-btn">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;