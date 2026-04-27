import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../style/checkout/checkoutResult.css';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="result-page success">
      <div className="result-card">
        <div className="icon-circle">✅</div>
        <h1>Order Accepted!</h1>
        <p>Thank you for your purchase. Your payment was processed successfully.</p>
        {sessionId && <small className="session-id">Reference: {sessionId}</small>}
        
        <div className="result-actions">
          <button onClick={() => navigate('/dashboard/orders')} className="primary-btn">
            View My Orders
          </button>
          <button onClick={() => navigate('/')} className="secondary-btn">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;