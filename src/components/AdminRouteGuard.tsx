import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSealify } from '@/context/SealifyContext';

type AdminGateState = 'checking' | 'anonymous' | 'not-admin' | 'needs-mfa' | 'allowed';

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading, logout } = useSealify();
  const location = useLocation();
  const [state, setState] = useState<AdminGateState>('checking');

  useEffect(() => {
    let cancelled = false;

    const verifyAdminMfa = async () => {
      if (loading) return;
      if (!user) {
        setState('anonymous');
        return;
      }
      if (!isAdmin) {
        setState('not-admin');
        return;
      }

      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (cancelled) return;

      if (error || data.currentLevel !== 'aal2') {
        setState('needs-mfa');
        return;
      }

      setState('allowed');
    };

    void verifyAdminMfa();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, loading, user]);

  useEffect(() => {
    if (state !== 'allowed') return;

    let warningTimer: ReturnType<typeof window.setTimeout>;
    let logoutTimer: ReturnType<typeof window.setTimeout>;

    const resetTimers = () => {
      window.clearTimeout(warningTimer);
      window.clearTimeout(logoutTimer);
      warningTimer = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sealify:admin-session-warning'));
      }, 28 * 60 * 1000);
      logoutTimer = window.setTimeout(() => {
        logout();
        window.location.assign('/admin/login?reason=inactive');
      }, 30 * 60 * 1000);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetTimers, { passive: true }));
    resetTimers();

    return () => {
      window.clearTimeout(warningTimer);
      window.clearTimeout(logoutTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetTimers));
    };
  }, [logout, state]);

  if (state === 'anonymous') return <Navigate to="/admin/login" replace state={{ from: location }} />;
  if (state === 'not-admin') return <Navigate to="/admin/login" replace />;
  if (state === 'needs-mfa') return <Navigate to="/admin/setup-mfa" replace state={{ from: location }} />;
  if (state === 'allowed') return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-bold">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        <span>Verifying administrator session</span>
      </div>
    </div>
  );
};

export const AdminAccessDenied: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
    <div className="max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 text-center shadow-2xl">
      <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-rose-400" />
      <h1 className="text-xl font-black text-white">Admin access required</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in with an administrator account and complete MFA to continue.</p>
    </div>
  </div>
);

export default AdminRouteGuard;
