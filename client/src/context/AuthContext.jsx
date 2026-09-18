import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('diksha_user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('diksha_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync token state changes with localStorage
  const saveAuthData = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('diksha_token', newToken);
      localStorage.setItem('diksha_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('diksha_token');
      localStorage.removeItem('diksha_user');
    }
  };

  // Verify auth on mount if token exists
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          const data = await getMeApi();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('diksha_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(email, password);
      if (data.success && data.token) {
        saveAuthData(data.token, data.user);
        return data;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerApi(userData);
      if (data.success && data.token) {
        saveAuthData(data.token, data.user);
        return data;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    saveAuthData(null, null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
