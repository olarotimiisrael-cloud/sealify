import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await api.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          const { data: { user: currentUser } } = await api.getUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = api.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        api.getUser().then(({ data: { user: currentUser } }) => setUser(currentUser));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await api.signIn(email, password);
    if (error) throw new Error(error.message);
    setSession(data.session);
    const { data: { user: currentUser } } = await api.getUser();
    setUser(currentUser);
  };

  const signUp = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    const { data, error } = await api.signUp(email, password, fullName, phoneNumber);
    if (error) throw new Error(error.message);
    if (data.session) {
      setSession(data.session);
      const { data: { user: currentUser } } = await api.getUser();
      setUser(currentUser);
    }
  };

  const signOut = async () => {
    await api.signOut();
    setSession(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await api.resetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
