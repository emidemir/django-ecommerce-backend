import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// ✅ Removed apiFetch because searching products is a public action!
import '../../style/common/navbar.css';

const Navbar = () => {
  const { user } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Trigger search when searchTerm changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        try {
          // ✅ Use standard fetch here! Guests need to search without auth errors.
          // ✅ Updated the endpoint to match your new routing structure
          const url = `${process.env.REACT_APP_BACKEND_URL}/search-product/${searchTerm}/`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            // Cap at 5 items as requested
            setSearchResults(data.slice(0, 5)); 
            setShowResults(true);
          }
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // Debounce to prevent excessive API calls

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">E-Shop</Link>
      </div>

      <div className="nav-center">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow clicking result
            onFocus={() => searchTerm.length > 1 && setShowResults(true)}
          />
          <button className="search-icon-btn">🔍</button>

          {/* Search Results Dropdown Box */}
          {showResults && (
            <div className="search-results-box">
              {searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <Link 
                    to={`/items/${product.id}`} 
                    key={product.id} 
                    className="search-result-item"
                    onClick={() => setShowResults(false)}
                  >
                    <img src={product.product_image?.url || ''} alt="" className="search-thumb" />
                    <div className="search-info">
                      <span className="search-name">{product.product_name}</span>
                      <span className="search-price">${product.product_price}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-results">No items found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/items">Products</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          
          {/* Conditional Rendering using real Auth state */}
          {user ? (
            <li className="user-menu-item">
              <Link to="/dashboard/orders" className="profile-link">
                <div className="nav-avatar">
                  {user.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
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