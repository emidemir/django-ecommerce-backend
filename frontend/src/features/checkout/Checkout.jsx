import React, { useState, useEffect } from 'react';
import CheckoutStepper from '../../components/checkout/CheckoutStepper';
import { apiFetch } from '../../api/apiFetch'; 
import { useAuth } from '../../context/AuthContext';
import '../../style/checkout/checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [formData, setFormData] = useState({
    label: '',
    country: '',
    city: '',
    district: '',
    street_address: '',
    building_number: '',
    apartment_number: '',
    postal_code: '',
  });

  // 1. Fetch saved addresses on mount
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/addresses/`;
        const response = await apiFetch(url); 
        
        if (response.ok) {
          const data = await response.json();
          setSavedAddresses(data);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchSavedAddresses();
  }, []);

  // 2. Save the currently written address
  const handleSaveCurrentAddress = async () => {
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/addresses/`;
      
      const response = await apiFetch(url, {
        method: "POST", 
        body: JSON.stringify({ ...formData, user: user?.id }) 
      });
      
      if (response.ok) {
        const newAddress = await response.json();
        setSavedAddresses(prev => [...prev, newAddress]); 
        alert("Address saved successfully!");
      } else {
        throw new Error("Failed to save address.");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Could not save address. Please check your inputs.");
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    const selected = savedAddresses.find(addr => addr.id.toString() === addressId);
    if (selected) {
      setFormData({
        label: selected.label || '',
        country: selected.country || '',
        city: selected.city || '',
        district: selected.district || '',
        street_address: selected.street_address || '',
        building_number: selected.building_number || '',
        apartment_number: selected.apartment_number || '',
        postal_code: selected.postal_code || '',
      });
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  return (
    <div className="checkout-page">
      <CheckoutStepper currentStep={step} />
      
      <div className="checkout-form-container">
        {step === 0 && (
          <div className="checkout-step">
            <h2>Shipping Information</h2>
            
            <div className="saved-address-selector">
              <label>Select a Saved Address</label>
              <select onChange={handleAddressSelect} defaultValue="">
                <option value="" disabled>Choose an address...</option>
                {savedAddresses.map(addr => (
                  <option key={addr.id} value={addr.id}>{addr.label}</option>
                ))}
              </select>
            </div>

            <form className="checkout-form">
              <input name="label" type="text" placeholder="Address Label (e.g., Home, Work)" value={formData.label} onChange={handleFieldChange} required />
              <div className="form-row">
                <input name="country" type="text" placeholder="Country" value={formData.country} onChange={handleFieldChange} required />
                <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleFieldChange} required />
              </div>
              <div className="form-row">
                <input name="district" type="text" placeholder="District" value={formData.district} onChange={handleFieldChange} required />
                <input name="postal_code" type="text" placeholder="Postal Code" value={formData.postal_code} onChange={handleFieldChange} />
              </div>
              <input name="street_address" type="text" placeholder="Street Address" value={formData.street_address} onChange={handleFieldChange} required />
              <div className="form-row">
                <input name="building_number" type="number" placeholder="Building No" value={formData.building_number} onChange={handleFieldChange} />
                <input name="apartment_number" type="number" placeholder="Apartment No" value={formData.apartment_number} onChange={handleFieldChange} />
              </div>
              
              <div className="address-actions">
                <button type="button" className="save-address-btn" onClick={handleSaveCurrentAddress}>Save Address to Profile</button>
                <button type="button" onClick={handleNext} className="next-btn">Next: Payment</button>
              </div>
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