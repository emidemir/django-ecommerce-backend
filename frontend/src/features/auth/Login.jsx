import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 👈 add
import AuthFormWrapper from '../../components/auth/AuthFormWrapper';
import '../../style/auth/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 add

  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials.email, credentials.password); // 👈 replace fetch block
      navigate('/');
    } catch (err) {
      alert("Oops! It looks like those credentials didn't work. Let's try that again.");
      setCredentials({ email: '', password: '' });
    }
  };

  return (
    <div className="login-page">
      <AuthFormWrapper
        title="Welcome Back"
        footerLink={<Link to="/auth/signup">Don't have an account? Sign up</Link>}
      >
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={credentials.email}
              onChange={handleChange} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={credentials.password}
              onChange={handleChange} placeholder="Enter password" required />
          </div>
          <button type="submit" className="auth-btn">Login</button>
        </form>
      </AuthFormWrapper>
    </div>
  );
};

export default Login;