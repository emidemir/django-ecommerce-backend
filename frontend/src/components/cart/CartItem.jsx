import React from 'react';
import '../../style/cart/cart.css'; 

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="cart-item">
      {/* Container prevents layout shift on broken images */}
      <div className="cart-item-img-container">
        <img src={item.image} alt={item.name} className="cart-item-img" />
      </div>
      
      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p className="cart-item-price">${item.price}</p>
      </div>
      
      <div className="cart-item-actions">
        <input 
          type="number" 
          value={item.quantity} 
          onChange={(e) => onUpdateQuantity(item.id, e.target.value)}
          min="1"
        />
        <button onClick={() => onRemove(item.id)} className="remove-btn">
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;