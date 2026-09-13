import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { useSealify } from '@/context/SealifyContext';
import { supabase } from '@/integrations/supabase/client';

const AdminSetupMfa: React.FC = () => {
  const { user, isAdmin, loading } = useSealify();
  const navigate = useNavigate();
  const [factorId, setFactorId] = useState('');
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const prepareMfa = async () => {
      if (loading || !user || !isAdmin) return;

      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (cancelled) return;
      if (aal.data.currentLevel === 'aal2') {
        navigate('/admin', { replace: true });
        return;
      }

      const factors = await supabase.auth.mfa.listFactors();
      if (cancelled) return;

      const verifiedTotp = factors.data?.totp?.find((factor) => factor.status === 'verified');
      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setQr('');
        setChecking(false);
        return;
      }

      const enrollment = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (cancelled) return;
      if (enrollment.error) {
        toast.error('Unable to start MFA setup. Please try again.');
        setChecking(false);
        return;
      }

      setFactorId(enrollment.data.id);
      setQr(enrollment.data.totp.qr_code);
      setChecking(false);
    };

    void prepareMfa();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, loading, navigate, user]);

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId || !code.trim()) return;

    setSubmitting(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verified = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (verified.error) throw verified.error;

      toast.success('MFA verified. Welcome back.');
      navigate('/admin', { replace: true });
    } catch {
      toast.error('Invalid authenticator code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && (!user || !isAdmin)) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      <SEO title="Admin MFA Setup — Sealify" />
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-black text-white">Verify admin MFA</h1>
            <p className="mt-2 text-xs font-medium text-slate-400">Admin sessions require a verified authenticator code before the dashboard can load.</p>
          </div>

          {checking ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Preparing secure challenge</span>
            </div>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              {qr && (
                <div className="rounded-2xl border border-slate-800 bg-white p-4">
                  <img src={qr} alt="Authenticator app QR code" className="mx-auto h-48 w-48" />
                </div>
              )}
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Authenticator code
              </label>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none focus:border-emerald-500"
                placeholder="123456"
                required
              />
              <button
                type="submit"
                disabled={submitting || code.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black uppercase tracking-widest text-slate-950 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify and continue
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSetupMfa;
