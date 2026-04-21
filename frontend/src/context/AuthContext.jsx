import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (data) => {
    try {
      setError(null);
      const response = await authService.signup(data);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const login = async (data) => {
    try {
      setError(null);
      const response = await authService.login(data);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await authService.updateProfile(data);
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    signup,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
