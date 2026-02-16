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
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.request('/auth/me', { method: 'GET' });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Invalid email or password' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const guestLogin = async () => {
    try {
      const response = await api.request('/auth/guest', {
        method: 'POST',
      });

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Guest login failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Guest login failed' };
    }
  };

  const logout = async () => {
    try {
      await api.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Logout even if the API call fails
    }
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