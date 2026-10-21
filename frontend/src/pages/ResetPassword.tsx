import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword, resetPassword } = useSealify();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setStep('reset');
      toast.success('Reset link sent to your email');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email, password, password_confirmation: confirmPassword });
      setStep('success');
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Reset Password — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-md mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
          {step === 'request' && (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Forgot Password</h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-xs font-black transition-all ${
                    loading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-95'
                  }`}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  Remember your password?
                  <Link to="/auth/login" className="text-emerald-600 font-black hover:underline ml-1">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === 'reset' && (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Reset Password</h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Enter your new password below. Make sure it's strong and secure.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-xs font-black transition-all ${
                    loading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-95'
                  }`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Password Reset!</h2>
              <p className="text-slate-600 text-xs mb-6">
                Your password has been successfully reset. You'll be redirected to sign in.
              </p>
              <div className="flex items-center justify-center text-[10px] text-slate-500">
                Redirecting in <span className="font-bold text-emerald-600">3</span>s...
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

