"use client";

import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import { X, ShieldCheck, Mail, Lock, LogIn, UserPlus, Smartphone, User, Sparkles, Terminal, Chrome, Apple, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, signup, resetPassword: requestPasswordReset, signInWithOAuth, sendPhoneOtp, verifyPhoneOtp } = useSealify();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'phone'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpId, setOtpId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuthLogin = async (provider: string) => {
    setIsSubmitting(true);
    try {
      const result = await signInWithOAuth(provider);
      if (result) {
        onClose();
      }
    } catch (e: any) {
      toast.error(e.message || `Failed to sign in with ${provider}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      toast.success('Password reset instructions sent to your email.');
      setShowForgotPassword(false);
      setEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset instructions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await sendPhoneOtp(phone.trim());
      if (result) {
        setOtpSent(true);
        setOtpId(result);
        toast.success('OTP sent to your phone number');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !otpId) {
      toast.error('Please enter the OTP code');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await verifyPhoneOtp(phone.trim(), otp.trim(), otpId);
      if (result) {
        toast.success('Phone verified successfully!');
        onClose();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to verify OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      toast.error('All fields are required to create your account');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
      });
      setIsSubmitting(false);
      onClose();
      toast.success(`🎉 Welcome to Sealify, ${fullName}! Your account is 100% active and unrestricted.`);
      navigate('/my-ads');
    } catch (e: any) {
      setIsSubmitting(false);
      toast.error(e.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 font-sans overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <Logo size="lg" className="justify-center" />
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Sealify Marketplace</h2>
          <p className="text-xs text-slate-400">Nigeria's Trusted Local Classifieds Network • Ogbomoso Hub</p>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'phone' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Phone
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'signup' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Sign Up
          </button>
        </div>

        {activeTab === 'login' && !showForgotPassword && (
          <>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-left text-xs text-emerald-400 hover:underline font-medium mt-1"
              >
                Forgot Password?
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Logging in...' : 'Log In to Account'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Or continue with</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-xl text-[9px] text-white transition-colors"
              >
                <Chrome className="w-4 h-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('apple')}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-xl text-[9px] text-white transition-colors"
              >
                <Apple className="w-4 h-4" />
                Apple
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('samsung')}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-xl text-[9px] text-white transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Samsung
              </button>
            </div>
          </>
        )}

        {showForgotPassword && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setShowForgotPassword(false); setEmail(''); }}
              className="w-full text-left text-xs text-slate-400 hover:underline font-medium"
            >
              Back to Login
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        {activeTab === 'phone' && !otpSent && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
                Enter your Nigerian phone number to receive a one-time password (OTP).
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number *</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {activeTab === 'phone' && otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
                Enter the 6-digit code sent to {phone}.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">OTP Code *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 tracking-widest"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); setOtpId(null); }}
              className="w-full text-left text-xs text-slate-400 hover:underline font-medium"
            >
              Use different number
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Log In'}
            </button>
          </form>
        )}

        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
                <strong>Instant Unrestricted Access:</strong> Buy and sell immediately after account creation.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Adebayo Ogunlesi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number *</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center">
          <p className="text-[9px] text-slate-600 flex items-center justify-center gap-1.5 uppercase font-black tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
            Verified Sealify Security Protocol
          </p>
        </div>

        <Link
          to="/admin/login"
          onClick={onClose}
          className="absolute bottom-4 right-4 p-2 opacity-50 hover:opacity-100 hover:text-emerald-400 transition-all cursor-pointer bg-slate-950/50 rounded-lg border border-slate-800/50"
          title="Secure Root Access"
        >
          <Terminal className="w-4 h-4 text-slate-600" />
        </Link>
      </div>
    </div>
  );
};

export default AuthModal;
