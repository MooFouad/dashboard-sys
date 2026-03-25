import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// ── Demo-mode helpers (frontend-only fallback when backend is unreachable) ──

const isDemoMode = () =>
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  window.location.hostname.includes('demo') ||
  window.location.hostname.includes('localhost');

// Known demo accounts (mirrors backend/data/mock/users.json)
const DEMO_USERS = {
  'demo@gts-demo.com':   { id: 'demo-admin-001', name: 'Demo Admin',  email: 'demo@gts-demo.com',  role: 'admin' },
  'user@gts-demo.com':   { id: 'demo-user-001',  name: 'Demo User',   email: 'user@gts-demo.com',  role: 'user'  },
  'viewer@gts-demo.com': { id: 'demo-viewer-001',name: 'Demo Viewer', email: 'viewer@gts-demo.com',role: 'viewer'},
};
const DEMO_PASSWORD = 'Demo@2024';
const LOCAL_DEMO_TOKEN_PREFIX = 'local-demo-';

const createLocalSession = (user) => {
  const demoUser = { ...user, isLocalDemo: true };
  localStorage.setItem('token', `${LOCAL_DEMO_TOKEN_PREFIX}${user.id}`);
  localStorage.setItem('local_demo_user', JSON.stringify(demoUser));
  return demoUser;
};

const getLocalDemoUser = () => {
  const token = localStorage.getItem('token');
  if (token && token.startsWith(LOCAL_DEMO_TOKEN_PREFIX)) {
    try {
      const u = JSON.parse(localStorage.getItem('local_demo_user'));
      if (u && u.id) return u;
    } catch {
      // fall through
    }
  }
  return null;
};

// ── Context ──────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('local_demo_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const checkAuth = async () => {
    // Restore a local demo session without hitting the network
    const localUser = getLocalDemoUser();
    if (localUser) {
      setUser(localUser);
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

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
      // Backend unreachable — fall back to local demo credentials
      if (isDemoMode() && DEMO_USERS[email] && password === DEMO_PASSWORD) {
        const demoUser = createLocalSession(DEMO_USERS[email]);
        setUser(demoUser);
        setIsAuthenticated(true);
        return { success: true };
      }
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
      // Backend unreachable — create a local guest session
      if (isDemoMode()) {
        const guestUser = createLocalSession({
          id: `guest_${Date.now()}`,
          name: 'Guest User',
          email: 'guest@gts-demo.com',
          role: 'user',
          isGuest: true,
        });
        setUser(guestUser);
        setIsAuthenticated(true);
        return { success: true };
      }
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
    localStorage.removeItem('local_demo_user');
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