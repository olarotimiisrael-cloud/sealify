"use client";

import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import { X, ShieldCheck, Mail, Lock, UserCheck, KeyRound, LogIn, UserPlus, Smartphone, User, CheckCircle2, ChevronRight, Terminal, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, signup } = useSealify();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  if (!isOpen) return null;

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
        role
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
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Sealify Marketplace Access</h2>
          <p className="text-xs text-slate-400">Nigeria's Trusted Local Classifieds Network • Ogbomoso Hub</p>
        </div>

        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> 1. Log In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'signup' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> 2. Sign Up
          </button>
        </div>

        {activeTab === 'login' ? (
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
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Logging in...' : 'Log In to Profile'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
                <strong>Instant Unrestricted Access:</strong> You can browse, chat, and post ads immediately upon account creation.
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Active Phone / WhatsApp Number *</label>
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

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${role === 'buyer' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                I'm a Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${role === 'seller' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                I'm a Seller
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center">
          <p className="text-[9px] text-slate-600 flex items-center justify-center gap-1.5 uppercase font-black tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
            Verified Sealify Security Protocol
          </p>
        </div>

        {/* Root Access Door */}
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