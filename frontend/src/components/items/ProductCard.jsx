import React from 'react';
import { Link } from 'react-router-dom';
import '../../style/items/productCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/items/${product.id}`} className="product-link">
        {/* The container ensures a perfect square even if the image breaks */}
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
        <div className="product-info">
          <span className="product-category">{product.product_category}</span>
          <h3 className="product-title">{product.product_name}</h3>
        </div>
      </Link>
      
      <div className="product-footer">
        <span className="product-price">${product.product_price}</span>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;