import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/checkout/checkoutResult.css';

const CheckoutFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="result-page failed">
      <div className="result-card">
        <div className="icon-circle error">❌</div>
        <h1>Order Cancelled</h1>
        <p>It looks like the payment process was interrupted or declined. No charges were made.</p>
        
        <div className="result-actions">
          <button onClick={() => navigate('/cart')} className="primary-btn">
            Return to Cart
          </button>
          <button onClick={() => navigate('/')} className="secondary-btn">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailed;