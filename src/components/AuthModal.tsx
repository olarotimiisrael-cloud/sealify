"use client";

import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { X, ShieldCheck, Mail, Lock, UserCheck, KeyRound, LogIn, UserPlus, Shield, CheckCircle2, Sparkles, MapPin, Smartphone, User, Building2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, updateUser, user } = useSealify();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'onboarding'>(initialTab);
  
  // User login/signup fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Onboarding fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'both'>('both');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }
    // Fixed: 'both' is not a valid login role in the context type, using 'buyer' as default
    login(email, 'buyer', false);
    onClose();
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }
    // Fixed: Mapping 'both' to 'seller' for the context login function
    const contextRole = role === 'both' ? 'seller' : role;
    login(email, contextRole, true);
    setActiveTab('onboarding');
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fixed: Removed invalid .getState() call and used 'user' from useSealify() hook directly
    if (user) {
      updateUser(user.id, { fullName, phoneNumber: phone });
    }
    toast.success('🎉 Welcome to Sealify! Profile setup complete.');
    onClose();
    navigate('/my-ads');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {activeTab === 'onboarding' ? (
          <form onSubmit={handleOnboardingSubmit} className="py-2 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">Complete Your Brand Profile</h3>
              <p className="text-xs text-slate-400">Set up your identity to start trading in Ogbomoso</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name / Display Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe or Blessing Stores"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp / Phone Number</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Intent</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['buyer', 'seller', 'both'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        role === r
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
              >
                Launch My Marketplace Dashboard
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="text-center space-y-2 mb-6">
              <Logo size="lg" className="justify-center" />
              <h2 className="text-2xl font-black text-white tracking-tight">Account Access</h2>
              <p className="text-xs text-slate-400">Join the Ogbomoso node of the Sealify federation</p>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> 1. Log In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'signup' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> 2. Sign Up
              </button>
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email ID</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button type="submit" className="w-full py-3.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2">Log In to Profile</button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button type="submit" className="w-full py-3.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2">Create Global Account</button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 uppercase font-black tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Forensic-Grade Node Security
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;