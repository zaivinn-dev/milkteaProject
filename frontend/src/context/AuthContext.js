import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, role) => {
    const userData = { username, role, loginTime: new Date() };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user && user.role === 'admin';
  const isCustomer = () => user && user.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}
