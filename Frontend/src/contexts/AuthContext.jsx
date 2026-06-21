import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthUser = (userData) => {
    if (userData && userData.profileImage) {
      if (!userData.profileImage.includes('v=')) {
        const separator = userData.profileImage.includes('?') ? '&' : '?';
        userData.profileImage = `${userData.profileImage}${separator}v=${Date.now()}`;
      }
    }
    setUser(userData);
  };

  // Auto-restoration on startup
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.success) {
          setAuthUser(response.data.user);
        } else {
          // If response not successful, clear token
          logout();
        }
      } catch (error) {
        console.error('Error restoring user session:', error);
        // Unauthorized or network error, clear tokens
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreUser();

    // Listen for unauthorized events from the api service
    const handleUnauthorized = () => {
      setAuthUser(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  // Login handler
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.success) {
        const { token, user: userData } = response.data;
        
        // Store token depending on rememberMe checkbox
        if (rememberMe) {
          localStorage.setItem('token', token);
          sessionStorage.removeItem('token'); // Keep storage clean
        } else {
          sessionStorage.setItem('token', token);
          localStorage.removeItem('token'); // Keep storage clean
        }
        
        setAuthUser(userData);
        setLoading(false);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || error.message || 'Error occurred during login';
      throw new Error(errorMsg);
    }
  };

  // Register handler
  const register = async (name, email, password, college) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        college,
        role: 'student', // Default role for frontend signup
      });
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || error.message || 'Error occurred during registration';
      throw new Error(errorMsg);
    }
  };

  // Login with token (for OAuth success callback redirect)
  const loginWithToken = async (token) => {
    setLoading(true);
    localStorage.setItem('token', token);
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.success) {
        setAuthUser(response.data.user);
        setLoading(false);
        return response.data.user;
      } else {
        logout();
        throw new Error('Verification failed');
      }
    } catch (error) {
      logout();
      setLoading(false);
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setAuthUser(null);
  };

  const updateUser = (userData) => {
    setAuthUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithToken,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
