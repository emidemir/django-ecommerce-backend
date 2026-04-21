import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../style/items/productCard.css';

const ProductCard = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/cartitems/`;

      const payload = {
        quantity: 1,
        product: product.id,
        cart: localStorage.getItem('cartID')
      }
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        },
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