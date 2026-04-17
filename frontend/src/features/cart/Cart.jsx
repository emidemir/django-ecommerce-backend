import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem';
import '../../style/cart/cart.css';

const Cart = () => {
  const navigate = useNavigate();
  // Mock state for the cart
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Minimalist Watch', price: 120, quantity: 1, image: 'https://via.placeholder.com/80' },
    { id: 2, name: 'Leather Backpack', price: 85, quantity: 2, image: 'https://via.placeholder.com/80' },
  ]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>
      <div className="cart-container">
        <div className="cart-items-list">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
        
        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>${subtotal}</span>
          </div>
          <button 
            className="checkout-btn" 
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;