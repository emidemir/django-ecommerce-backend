import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../style/items/productCard.css';

// ✅ Import your custom fetch wrapper and auth context
import { apiFetch } from '../../api/apiFetch';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth(); // 👈 Grab the user from context

  const handleAddToCart = async () => {
    // ✅ Safety check: ensure the user is logged in and has a cart
    if (!user || !user.cartID) {
      alert("Please log in to add items to your cart!");
      // Optional: You could also use navigate('/auth/login') here 
      // if you import useNavigate from 'react-router-dom'
      return; 
    }

    setIsAdding(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/cartitems/`;

      const payload = {
        quantity: 1,
        product: product.id,
        cart: user.cartID // ✅ Use cartID securely from context
      }
      
      // ✅ Replaced fetch with apiFetch. Headers handled automatically!
      const response = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify(payload) 
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const data = await response.json();
      alert(`${product.product_name} added to cart!`);
      console.log("Cart response:", data);
      
    } catch (err) {
      console.error("Cart error:", err);
      alert("Error adding item to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/items/${product.id}`} className="product-link">
        <div className="product-image-container">
          {/* Using product.product_image?.url if nested, otherwise product.image */}
          <img 
            src={product.product_image?.url || product.image || 'https://via.placeholder.com/150'} 
            alt={product.product_name} 
            className="product-image" 
          />
        </div>
        <div className="product-info">
          <span className="product-category">{product.product_category}</span>
          <h3 className="product-title">{product.product_name}</h3>
        </div>
      </Link>
      
      <div className="product-footer">
        <span className="product-price">${product.product_price}</span>
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;