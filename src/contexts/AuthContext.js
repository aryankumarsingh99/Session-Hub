// src/contexts/AuthContext.js
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

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

  useEffect(() => {
    console.log('🔄 AuthContext: Initializing...');
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('🔍 AuthContext: Checking stored auth...', { 
        hasToken: !!token, 
        hasUser: !!savedUser 
      });
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Basic token validation
        if (isValidToken(token)) {
          setUser(userData);
          console.log('✅ AuthContext: User restored from localStorage:', userData.firstName);
        } else {
          console.log('⚠️ AuthContext: Token expired, clearing storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Error parsing saved user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const isValidToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Login attempt for:', credentials.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log('✅ AuthContext: Login successful');
        return { success: true, message: data.message };
      } else {
        console.log('❌ AuthContext: Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (credentials) => {
    try {
      console.log('📝 AuthContext: Registration attempt for:', credentials.email);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log('✅ AuthContext: Registration successful');
        return { success: true, message: data.message };
      } else {
        console.log('❌ AuthContext: Registration failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Logging out...');
      
      await fetch('/api/auth/logout', { method: 'POST' });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      console.log('✅ AuthContext: Logout successful');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      // Still clear local state even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/auth/login';
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};