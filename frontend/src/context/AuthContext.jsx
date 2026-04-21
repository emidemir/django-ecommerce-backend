import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenManager } from '../lib/tokenManager';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const _handleAuthResponse = (data) => {
    // 1. Decode the payload of the access token
    const tokenPayload = JSON.parse(atob(data.access.split('.')[1]));
    
    // 2. Calculate how many seconds until it expires
    // (tokenPayload.exp is in seconds, Date.now() is in milliseconds)
    const expiresInSeconds = tokenPayload.exp - Math.floor(Date.now() / 1000);
  
    // 3. Map it perfectly to TokenManager
    tokenManager.setTokens({
      accessToken: data.access,
      refreshToken: data.refresh,
      expiresIn: expiresInSeconds, 
    });

    const user = {
      id: data.userID,
      cartID: data.cartID,
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    _handleAuthResponse(await res.json());
  }, []);

  const signup = useCallback(async ({ firstName, lastName, email, password }) => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
    });
    if (!res.ok) throw new Error('Signup failed');
    _handleAuthResponse(await res.json());
  }, []);

  const logout = useCallback(() => {
    tokenManager.clear();
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);