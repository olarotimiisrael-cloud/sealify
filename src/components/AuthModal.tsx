"use client";

import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import OtpVerificationModal from './OtpVerificationModal';
import { X, ShieldCheck, Mail, Lock, UserCheck, KeyRound, LogIn, UserPlus, Smartphone, User, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';
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
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  
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
    const success = await login(email, password);
    if (success) {
      onClose();
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      toast.error('All fields are compulsory for account security');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    // Stage 1: Trigger Phone Verification
    setIsOtpOpen(true);
  };

  const handleOtpVerified = async () => {
    await signup({
      email,
      password,
      fullName,
      phoneNumber: phone,
      role
    });
    setIsOtpOpen(false);
    onClose();
    navigate('/my-ads');
  };

  return (
    <>
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
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Marketplace Access</h2>
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
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
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
              <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95">Log In to Profile</button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Phone (WhatsApp)</label>
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
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email ID</label>
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
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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

              <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95">Create Global Account</button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center">
            <p className="text-[9px] text-slate-600 flex items-center justify-center gap-1.5 uppercase font-black tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
              Forensic-Grade Node Security
            </p>
          </div>

          {/* The Hidden Secret Door */}
          <Link 
            to="/admin/login" 
            onClick={onClose}
            className="absolute bottom-2 right-2 p-1 opacity-20 hover:opacity-100 hover:text-emerald-500 transition-all cursor-pointer"
            title="Secure Root Access"
          >
            <Terminal className="w-3 h-3 text-slate-700" />
          </Link>
        </div>
      </div>

      <OtpVerificationModal 
        isOpen={isOtpOpen} 
        onClose={() => setIsOtpOpen(false)} 
        phoneNumber={phone} 
        onVerified={handleOtpVerified}
      />
    </>
  );
};

export default AuthModal;