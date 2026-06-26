import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  updateProfile: (displayName: string, photoURL?: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('sunshine_user');
    if (savedUserStr) {
      try {
        const localUser = JSON.parse(savedUserStr);
        setUser(localUser);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        localStorage.removeItem('sunshine_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (!password) {
        throw new Error('Password is required');
      }
      const response = await api.post('/auth/login', { email, password });
      const { user: profile, token } = response.data;
      
      const loggedInUser: User = {
        ...profile,
        token,
      };
      
      setUser(loggedInUser);
      localStorage.setItem('sunshine_user', JSON.stringify(loggedInUser));
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.response?.data?.error || error?.message || 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    setLoading(true);
    try {
      if (!password) {
        throw new Error('Password is required');
      }
      const response = await api.post('/auth/register', { name, email, password });
      const { user: profile, token } = response.data;
      
      const registeredUser: User = {
        ...profile,
        token,
      };
      
      setUser(registeredUser);
      localStorage.setItem('sunshine_user', JSON.stringify(registeredUser));
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error?.response?.data?.error || error?.message || 'Registration failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('sunshine_user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (displayName: string, photoURL?: string) => {
    try {
      const response = await api.put('/auth/profile', { displayName, photoURL });
      const { user: updatedProfile } = response.data;
      
      const updatedUser = {
        ...user,
        ...updatedProfile,
        token: user?.token, // preserve token
      } as User;
      
      setUser(updatedUser);
      localStorage.setItem('sunshine_user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Update profile error:', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to update profile';
      throw new Error(message);
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      await api.put('/auth/password', { newPassword });
    } catch (error: any) {
      console.error('Change password error:', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to change password';
      throw new Error(message);
    }
  };

  const sendPasswordReset = async (email: string) => {
    // Mock successful reset email sent in custom auth mode
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 800);
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    sendPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

