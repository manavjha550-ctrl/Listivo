import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthState } from '../types';
import { apiFetch } from '../lib/apiClient';

interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, fullName: string, password?: string, companyName?: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (data: {
    fullName: string;
    companyName: string;
    phone: string;
    gstin?: string;
    pickupPincode: string;
    pickupAddress: string;
  }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem('listivo_token');
    const savedUserStr = localStorage.getItem('listivo_user');

    if (savedToken && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        return {
          user: savedUser,
          token: savedToken,
          isAuthenticated: true,
          isLoading: false,
        };
      } catch {
        // Fallback if parsing fails
      }
    }

    // Default to unauthenticated state
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  const refreshUser = async () => {
    const currentToken = authState.token || localStorage.getItem('listivo_token');
    if (!currentToken) {
      setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('listivo_user', JSON.stringify(data.user));
          setAuthState({
            user: data.user,
            token: currentToken,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else if (res.status === 401) {
        logout();
      }
    } catch (e) {
      console.warn('Failed to fetch current user from backend:', e);
    }
  };

  useEffect(() => {
    if (authState.token) {
      refreshUser();
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('listivo_token', data.token);
        localStorage.setItem('listivo_user', JSON.stringify(data.user));
        localStorage.removeItem('listivo_logged_out');

        setAuthState({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: data.error || 'Invalid email or password.' };
    } catch (err) {
      console.error('Login error:', err);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signup = async (
    email: string,
    fullName: string,
    password?: string,
    companyName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, fullName, password, companyName }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('listivo_token', data.token);
        localStorage.setItem('listivo_user', JSON.stringify(data.user));
        localStorage.removeItem('listivo_logged_out');

        setAuthState({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: data.error || 'Signup failed.' };
    } catch (err) {
      console.error('Signup error:', err);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const completeOnboarding = async (data: {
    fullName: string;
    companyName: string;
    phone: string;
    gstin?: string;
    pickupPincode: string;
    pickupAddress: string;
  }): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await apiFetch('/api/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        localStorage.setItem('listivo_user', JSON.stringify(resData.user));
        setAuthState((prev) => ({
          ...prev,
          user: resData.user,
          isLoading: false,
        }));
        return true;
      }
    } catch (err) {
      console.error('Onboarding error:', err);
    }
    setAuthState((prev) => ({ ...prev, isLoading: false }));
    return false;
  };

  const logout = () => {
    localStorage.removeItem('listivo_token');
    localStorage.removeItem('listivo_user');
    localStorage.setItem('listivo_logged_out', 'true');

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        completeOnboarding,
        logout,
        refreshUser,
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
