import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Mail, Lock, UserCheck, KeyRound, LogIn, UserPlus, Shield, CheckCircle2, Sparkles, MapPin, Key, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup' | 'admin';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, adminLogin } = useSealify();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'admin'>(initialTab);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  
  // User login/signup fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupCompleteEmail, setSignupCompleteEmail] = useState<string | null>(null);

  // Admin login fields (Completely blank by default for maximum security)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');

  // Rate-limiting / Brute-force protection state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }
    login(email, role, false);
    onClose();
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }
    login(email, role, true);
    setSignupCompleteEmail(email);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      toast.error('Admin portal locked due to multiple failed login attempts. Please try again later.');
      return;
    }

    if (!adminEmail || !adminPassword || !adminPin) {
      toast.error('All fields including Security PIN are required.');
      return;
    }

    const success = adminLogin(adminEmail, adminPassword, adminPin);
    if (success) {
      setFailedAttempts(0);
      onClose();
      navigate('/admin');
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      if (newCount >= 3) {
        setIsLockedOut(true);
        toast.error('🚨 Security Lockout Triggered: 3 failed attempts detected. Access blocked.');
      } else {
        toast.error(`Invalid admin credentials. ${3 - newCount} attempts remaining before security lockout.`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={() => {
            setSignupCompleteEmail(null);
            onClose();
          }}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {signupCompleteEmail ? (
          <div className="py-4 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <MapPin className="w-3 h-3" /> Verification Email Dispatched
              </span>
              <h3 className="text-xl font-black text-white">Check Your Email Inbox!</h3>
              <p className="text-xs text-slate-300 font-semibold">{signupCompleteEmail}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left space-y-2 text-xs text-slate-300">
              <p className="font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Greetings from Sealify!
              </p>
              <p className="leading-relaxed">
                Welcome to <strong>Sealify — Trusted and largest marketplace in Ogbomosoland</strong>. We serve Ogbomosoland, Oyo State and beyond.
              </p>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                🔔 You will also receive occasional email updates on newly posted ad listings and price drops for your bookmarked items!
              </p>
            </div>

            <button
              onClick={() => {
                setSignupCompleteEmail(null);
                onClose();
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
            >
              Continue to Marketplace
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-3 mb-5">
              <div className="inline-block bg-white p-2 rounded-2xl shadow-sm border border-slate-700/50">
                <img
                  src="/logo.png"
                  alt="Sealify Logo"
                  className="h-12 w-auto object-contain mx-auto"
                />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Sealify Account Access
              </h2>
              <p className="text-xs text-slate-400">
                Choose how you would like to authenticate with the platform
              </p>
            </div>

            {/* 3 Main Authentication Options */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>1. Log In</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'signup'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>2. Sign Up</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'admin'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>3. Admin Panel</span>
              </button>
            </div>

            {/* Option 1: Log In */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Log In to Account</span>
                </button>
              </form>
            )}

            {/* Option 2: Sign Up */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Account Role</label>
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
                      placeholder="Create a password"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account & Verify</span>
                </button>
              </form>
            )}

            {/* Option 3: Secure Admin Panel Login */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
                  <p className="font-bold flex items-center gap-1">
                    <Shield className="w-4 h-4 text-rose-400" /> High-Security Administrator Portal
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Authorized access required. Attempts are monitored & rate-limited.
                  </p>
                </div>

                {isLockedOut && (
                  <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>Portal Locked due to consecutive security failures.</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Admin Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      disabled={isLockedOut}
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@sealify.ng"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Admin Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      disabled={isLockedOut}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Master Security Access PIN</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      maxLength={6}
                      disabled={isLockedOut}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="Enter 6-digit PIN"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono tracking-widest disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLockedOut}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 mt-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Authenticate & Access Admin Dashboard</span>
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Protected by Encrypted Multi-Factor Authentication
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;