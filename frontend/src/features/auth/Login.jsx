import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import AuthFormWrapper from '../../components/auth/AuthFormWrapper';
import '../../style/auth/login.css'; // Nested CSS as requested

const Login = () => {
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_BACKEND_URL}/login/`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("refresh", data['refresh'])
        localStorage.setItem("access", data['access'])
        localStorage.setItem("userID", data['userID'])
        localStorage.setItem("cartID", data['cartID'])
        navigate('/')
      } else {
        // Cute little alert for the user
        alert("Oops! It looks like those credentials didn't work. Let's try that again.");
        
        // "Delete" (reset) the state to clear the form fields
        setCredentials({
          email: '',
          password: ''
        });
      }
      
    } catch (error) {
      console.error("Network error during login:", error);
      alert("Uh oh, we're having trouble connecting. Please try again later!");
    }
    }

    return (
      <div className="login-page">
        <AuthFormWrapper 
          title="Welcome Back" 
          footerLink={<Link to="/auth/signup">Don't have an account? Sign up</Link>}
        >
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={credentials.email} 
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
                value={credentials.password} 
                onChange={handleChange}      
                placeholder="Enter password" 
                required 
              />
            </div>
            <button type="submit" className="auth-btn">Login</button>
          </form>
        </AuthFormWrapper>
      </div>
    );
  };

export default Login;