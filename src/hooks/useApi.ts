<dyad-write path="src/components/AuthProvider.tsx" description="Create AuthProvider to initialize API client and manage auth state")
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useRouter } from "react-router-dom";

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
        const { data: { session } } = await api.getSession();
        setSession(session);
        if (session?.user) {
          const { data: { user } } = await api.getUser();
          setUser(user);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = api.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        api.getUser().then(({ data: { user } }) => setUser(user));
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
    const { data: { user } } = await api.getUser();
    setUser(user);
  };

  const signUp = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    const { data, error } = await api.signUp(email, password, fullName, phoneNumber);
    if (error) throw new Error(error.message);
    if (data.session) {
      setSession(data.session);
      const { data: { user } } = await api.getUser();
      setUser(user);
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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};