import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      const session = data?.session;
      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Check if profile has required fields for completion
      supabase
        .from('profiles')
        .select('full_name, phone_number, verified')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (!mounted) return;

          if (!profile) {
            // No profile exists – redirect to profile completion
            navigate('/profile-complete');
            return;
          }

          const needsCompletion =
            !profile.full_name || !profile.phone_number;

          if (needsCompletion) {
            navigate('/profile-complete');
          } else {
            // Profile is complete, go home
            navigate('/');
          }
        })
        .catch(() => {
          if (!mounted) return;
          navigate('/login');
        });
    });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return null;
};

export default AuthCallback;