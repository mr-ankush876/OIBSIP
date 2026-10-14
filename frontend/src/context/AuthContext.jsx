import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('pizza_auth_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('pizza_auth_token')) {
        setLoading(false);
        return;
      }
      const data = await apiClient.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.log('[Auth] Session check failed or expired');
      localStorage.removeItem('pizza_auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const data = await apiClient.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('pizza_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const adminLogin = async (email, password) => {
    const data = await apiClient.post('/auth/admin-login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('pizza_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    return apiClient.post('/auth/register', userData);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Ignore
    } finally {
      localStorage.removeItem('pizza_auth_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'ADMIN',
        login,
        adminLogin,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
