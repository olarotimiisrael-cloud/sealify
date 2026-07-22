import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Mail, Lock, UserCheck, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useSealify();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, role);
    onClose();
  };

  const handleGoToAdminLogin = () => {
    onClose();
    navigate('/admin/login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <img
            src="/logo.png"
            alt="Sealify Logo"
            className="w-14 h-14 object-contain mx-auto rounded-2xl shadow-lg"
          />
          <h2 className="text-2xl font-black text-white tracking-tight">
            {tab === 'login' ? 'Welcome Back to Sealify' : 'Create Sealify Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {tab === 'login'
              ? 'Enter your details to access your dashboard & messages'
              : 'Join thousands of buyers & verified sellers today'}
          </p>
        </div>

        {/* Toggle Login / Signup */}
        <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'signup' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    role === 'buyer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    role === 'seller'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  Seller / Vendor
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 mt-2 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{tab === 'login' ? 'Sign In to Account' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center space-y-2">
          <button
            type="button"
            onClick={handleGoToAdminLogin}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Administrator Portal Access</span>
          </button>

          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Protected by Supabase Authentication Security
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;