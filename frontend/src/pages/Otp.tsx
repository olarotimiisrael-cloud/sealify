import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Phone, CheckCircle2, AlertCircle, Clock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Otp() {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { requestOtp, verifyOtp, resendOtp } = useSealify();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp({ phone });
      setStep('verify');
      setResendTimer(60);
      toast.success('OTP sent to your phone');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp({ phone, code });
      setStep('success');
      toast.success('Phone verified successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendOtp({ phone });
      setResendTimer(60);
      toast.success('OTP resent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Phone Verification — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-md mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
          {step === 'request' && (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Verify Phone</h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  We'll send a one-time code to your phone number to verify your identity.
                </p>
              </div>

              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-xs">+234</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="8012345678"
                      required
                    />
                  </div>
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
                  {loading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </form>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Enter OTP Code</h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Enter the 6-digit code sent to <span className="font-bold text-emerald-600">{phone}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
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
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-500">
                  Didn't receive the code?
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
                </p>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Phone Verified!</h2>
              <p className="text-slate-600 text-xs mb-6">
                Your phone number has been successfully verified.
              </p>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

