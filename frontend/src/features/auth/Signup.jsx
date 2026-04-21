import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFormWrapper from '../../components/auth/AuthFormWrapper';
import '../../style/auth/signup.css';

const Signup = () => {
  const navigate = useNavigate();

  // Updated state to handle first and last name separately
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Oops! Those passwords don't match. Give it another go!");
      return;
    }

    const url = `${process.env.REACT_APP_BACKEND_URL}/register/`;

    try {
      // Updated payload to send firstName and lastName
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.refresh && data.access) {
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("access", data.access);
          localStorage.setItem("userID", data.userID);
          localStorage.setItem("cartID", data.cartID);
        }
        
        navigate('/');
      } else {
        alert("Oh no! We couldn't create your account right now. Double check your info and try again!");
        
        // Reset the state with the new fields
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
      
    } catch (error) {
      console.error("Network error during signup:", error);
      alert("Uh oh, we're having trouble connecting. Please try again later!");
    }
  };

  return (
    <div className="signup-page">
      <AuthFormWrapper 
        title="Create an Account" 
        footerLink={<Link to="/auth/login">Already have an account? Login</Link>}
      >
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Replaced Full Name with First Name and Last Name */}
          <div className="form-group">
            <label>First Name</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password" 
              required 
            />
          </div>
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
      </AuthFormWrapper>
    </div>
  );
};

export default Signup;