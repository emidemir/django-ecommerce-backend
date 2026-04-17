import React, { useState } from 'react';
import CheckoutStepper from '../../components/checkout/CheckoutStepper';
import '../../style/checkout/checkout.css';

const Checkout = () => {
  const [step, setStep] = useState(0);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  return (
    <div className="checkout-page">
      <CheckoutStepper currentStep={step} />
      
      <div className="checkout-form-container">
        {step === 0 && (
          <div className="checkout-step">
            <h2>Shipping Information</h2>
            <form className="checkout-form">
              <input type="text" placeholder="Full Name" required />
              <input type="text" placeholder="Street Address" required />
              <div className="form-row">
                <input type="text" placeholder="City" />
                <input type="text" placeholder="Zip Code" />
              </div>
              <button type="button" onClick={handleNext} className="next-btn">Next: Payment</button>
            </form>
          </div>
        )}

        {step === 1 && (
          <div className="checkout-step">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <button className="pay-card-btn">Credit/Debit Card</button>
              <button className="pay-paypal-btn">PayPal</button>
            </div>
            <form className="checkout-form">
              <input type="text" placeholder="Card Number" />
              <div className="form-row">
                <input type="text" placeholder="MM/YY" />
                <input type="text" placeholder="CVC" />
              </div>
              <div className="action-btns">
                <button type="button" onClick={handleBack} className="back-link">Back</button>
                <button type="button" onClick={handleNext} className="next-btn">Confirm Order</button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="checkout-success">
            <div className="success-icon">✅</div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase. Your order #12345 is being processed.</p>
            <button onClick={() => window.location.href = '/'} className="next-btn">Return Home</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;