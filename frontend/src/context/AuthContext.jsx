import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { tokenManager } from "../lib/tokenManager";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    tokenManager.clear();
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      // data = { accessToken, refreshToken, expiresIn, user }
      tokenManager.setTokens(data);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for forced logouts triggered by apiFetch
  useEffect(() => {
    window.addEventListener("auth:logout", logout);
    return () => window.removeEventListener("auth:logout", logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);