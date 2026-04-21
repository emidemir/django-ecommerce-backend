import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthFormWrapper from '../../components/auth/AuthFormWrapper';
import '../../style/auth/signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Oops! Those passwords don't match. Give it another go!");
      return;
    }
    try {
      await signup(formData); // 👈 replace fetch block
      navigate('/');
    } catch (err) {
      alert("Oh no! We couldn't create your account right now. Double check your info and try again!");
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
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