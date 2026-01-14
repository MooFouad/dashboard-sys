import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();

    // Listen for unauthorized events from API
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const checkAuth = async () => {
    // Demo Mode: Instant login with no API calls
    console.log('🎭 Demo Mode: Instant authentication');
    setUser({
      name: 'Demo User',
      email: 'demo@gts-dashboard.com',
      role: 'guest'
    });
    setIsAuthenticated(true);
    setLoading(false);
  };

  const login = async (email, password) => {
    // Demo Mode: Instant login
    const demoUser = {
      name: email.split('@')[0] || 'User',
      email: email,
      role: 'user'
    };

    localStorage.setItem('token', 'demo-token-' + Date.now());
    setUser(demoUser);
    setIsAuthenticated(true);

    return { success: true };
  };

  const register = async (name, email, password) => {
    // Demo Mode: Instant registration
    const demoUser = {
      name: name,
      email: email,
      role: 'user'
    };

    localStorage.setItem('token', 'demo-token-' + Date.now());
    setUser(demoUser);
    setIsAuthenticated(true);

    return { success: true };
  };

  const guestLogin = async () => {
    // Demo Mode: Instant guest login
    const guestUser = {
      name: 'Guest User',
      email: 'guest@gts-dashboard.com',
      role: 'guest'
    };

    localStorage.setItem('token', 'demo-guest-token');
    setUser(guestUser);
    setIsAuthenticated(true);

    return { success: true };
  };

  const logout = async () => {
    // Demo Mode: Instant logout
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    guestLogin,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};