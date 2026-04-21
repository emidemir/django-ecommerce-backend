import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem';
import '../../style/cart/cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      const cartID = localStorage.getItem("cartID");
      
      if (!cartID) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_BACKEND_URL}/carts/${cartID}/`;
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart data');
        }

        const data = await response.json();
        // Assuming your backend returns an object with an 'items' array
        // Adjust 'data.items' if your serializer returns the list directly
        setCartItems(data.items || []); 
      } catch (err) {
        console.error("Cart Fetch Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  // 1. Handler to update item quantity (PATCH)
  const handleUpdateQuantity = async (id, newQty) => {
    // Prevent zero or negative quantities
    const quantity = parseInt(newQty);
    if (quantity < 1) return;

    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/cartitems/${id}/`;
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        },
        body: JSON.stringify({ quantity: quantity })
      });

      if (!response.ok) throw new Error("Failed to update quantity");

      const updatedItem = await response.json();

      // Update local state: find the item and replace it with the response from server
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, quantity: updatedItem.quantity }
            : item
        )
      );
    } catch (err) {
      console.error("Update Error:", err);
      alert("Could not update quantity. Please try again.");
    }
  };

  // 2. Handler to remove an item (DELETE)
  const handleRemove = async (id) => {
    // Optional: Add a confirmation dialog
    if (!window.confirm("Remove this item from your cart?")) return;

    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/cartitems/${id}/`;
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        }
      });

      if (!response.ok) throw new Error("Failed to remove item");

      // Update local state: filter out the removed item
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      console.error("Remove Error:", err);
      alert("Could not remove item. Please try again.");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.product.product_price);
    return acc + (price * item.quantity);
  }, 0);

  if (isLoading) return <div className="loading-msg">Loading your cart...</div>;
  if (error) return <div className="error-msg">Error: {error}</div>;

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>
      <div className="cart-container">
        <div className="cart-items-list">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <CartItem 
                key={item.id} 
                item={item} 
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
        
        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button 
            className="checkout-btn" 
            onClick={() => navigate('/checkout')}
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;