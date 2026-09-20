import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Lock, EyeOff, Eye, KeyRound, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRecovery = async () => {
      const token = searchParams.get('token') || searchParams.get('code');
      const type = searchParams.get('type') || searchParams.get('token_type');

      if (token && (type === 'recovery' || type === 'email')) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === 'recovery' ? 'recovery' : 'email',
          });
          if (error) {
            console.error('Token verification error:', error);
            setValidToken(false);
            toast.error('Invalid or expired recovery link. Please request a new password reset.');
          } else {
            setValidToken(true);
          }
        } catch (e) {
          setValidToken(false);
          toast.error('Unable to verify recovery token.');
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setValidToken(!!session);
        if (!session) {
          toast.error('No active session found. Please use the password reset link from your email.');
        }
      }
    };

    void checkRecovery();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }

    setIsResetting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success('Your password has been reset successfully. You can now sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error(err.message || 'Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setIsResetting(false);
    }
  };

  if (validToken === false) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <SEO title="Password Reset — Sealify" />
        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border-2 border-rose-500/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Invalid Recovery Link</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The password reset link has expired or is invalid.
            Please request a new password reset to continue.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-transform active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            Request New Reset
          </button>
        </section>
      </main>
    );
  }

  if (validToken === null) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <SEO title="Password Reset — Sealify" />
        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-slate-500/10 text-slate-400 rounded-full flex items-center justify-center mx-auto border-2 border-slate-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Verifying Recovery Link</h1>
          <p className="text-sm text-slate-400">Please wait while we verify your password reset request...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <SEO title="Reset Password — Sealify" />
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter a strong new password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isResetting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {isResetting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Setting New Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Set New Password</span>
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
};

export default ResetPassword;
