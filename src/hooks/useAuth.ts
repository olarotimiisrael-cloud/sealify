import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { laravelAuth } from '@/lib/laravel-api';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const readSession = async () => {
      try {
        const { data } = await api.getSession();
        if (!active) return;
        setUser(data.session?.user ?? null);
      } catch {
        if (!active) return;
        laravelAuth.clearSession();
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void readSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: signedIn } = await api.signIn(email, password);
    setUser(signedIn ?? null);
    return signedIn;
  };

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    const { user: created } = await api.signUp(email, password, fullName, phoneNumber);
    setUser(created ?? null);
    return created;
  };

  const signInWithOAuth = async (): Promise<boolean> => {
    throw new Error('OAuth is not configured for the Laravel backend.');
  };

  const signOut = async () => {
    await api.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signUp, signInWithOAuth, signOut };
};
