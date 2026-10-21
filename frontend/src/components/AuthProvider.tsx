import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { laravelAuth } from '@/lib/laravel-api';
import { mapProfileToUser } from '@/services/supabaseService';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'samsung') => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = laravelAuth.getToken();
    if (!storedToken) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data } = await api.getSession();
        setSession(data.session);
        setUser(data.session?.user ? mapProfileToUser(data.session.user) : null);
      } catch (error) {
        console.error('Auth init error:', error);
        laravelAuth.clearSession();
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'sealify_access_token') return;
      if (laravelAuth.getToken()) return;

      setSession(null);
      setUser(null);
    };

    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await api.signIn(email, password);
    setSession(data.session);
    setUser(data.user ? mapProfileToUser(data.user) : null);
  };

  const signUp = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    const data = await api.signUp(email, password, fullName, phoneNumber);
    setSession(data.session);
    setUser(data.user ? mapProfileToUser(data.user) : null);
  };

  const signOut = async () => {
    await api.signOut();
    setSession(null);
    setUser(null);
  };

  const signInWithOAuth = async (): Promise<boolean> => {
    throw new Error('OAuth is not configured for the Laravel backend.');
  };

  const resetPassword = async (email: string) => {
    await api.resetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithOAuth, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
