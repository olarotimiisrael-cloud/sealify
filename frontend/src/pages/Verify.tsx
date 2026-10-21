import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Mail, CheckCircle2, ArrowRight, AlertCircle, Clock, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Verify() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const { verifyEmail, resendVerification } = useSealify();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyEmail(code);
      toast.success('Email verified successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerification();
      setResendTimer(60);
      toast.success('Verification email resent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Verify Email — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-md mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Verify Your Email</h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              We've sent a verification code to your email. Please enter the code below to activate your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-3 text-xl text-slate-900 font-black bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:border-emerald-500 letter-spacing-widest"
                placeholder="000000"
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
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-500">
              Didn't receive the code?
              <span className="ml-1">
                {resendTimer > 0 ? (
                  <span className="text-slate-500">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-emerald-600 font-black hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </span>
            </p>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

