import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Admin } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: Admin | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Admin | null>(() => {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.login(email, password);
      console.log(response);
      if (response.success && response.user) {
        // Extract permissions from the user object (it should be an object with boolean values)
        const permissionsObj: Record<string, boolean> = response.user.permissions || {};
        const userData: Admin = {
          id: response.user.id,
          email: response.user.email,
          username: response.user.username,
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          permissions: permissionsObj, // Store permissions as an object with boolean values
        };
        setUser(userData);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
    apiService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
