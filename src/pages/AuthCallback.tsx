import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { laravelApi } from '@/lib/laravel-api';
import SEO from '@/components/SEO';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const { data } = await api.getSession();
      const session = data?.session;
      if (!session?.user) {
        if (mounted) navigate('/login');
        return;
      }

      try {
        const profiles = await laravelApi.data.list<any>('profiles', { id: String(session.user.id) });
        const profile = profiles[0];

        if (!profile) {
          if (mounted) navigate('/profile-complete');
          return;
        }

        const needsCompletion = !profile.full_name || !profile.phone_number;

        if (mounted) {
          navigate(needsCompletion ? '/profile-complete' : '/');
        }
      } catch {
        if (mounted) navigate('/login');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return null;
};

export default AuthCallback;