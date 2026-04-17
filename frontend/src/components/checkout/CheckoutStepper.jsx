import React from 'react';
import '../../style/checkout/checkout.css';

const CheckoutStepper = ({ currentStep }) => {
  const steps = ["Shipping", "Payment", "Confirmation"];
  
  return (
    <div className="stepper-container">
      {steps.map((step, index) => (
        <div key={step} className={`step ${index <= currentStep ? 'active' : ''}`}>
          <div className="step-number">{index + 1}</div>
          <span className="step-label">{step}</span>
        </div>
      ))}
    </div>
  );
};

export default CheckoutStepper;