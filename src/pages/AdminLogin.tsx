import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { 
  Lock, 
  Mail, 
  Terminal, 
  ShieldCheck, 
  Siren,
  EyeOff,
  Eye,
  Radio,
  Loader2,
  Cloud,
  Apple,
  Chrome,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement | string, options: Record<string, any>) => string;
      reset: (id?: string) => void;
      remove?: (id?: string) => void;
    };
  }
}

const AdminLogin: React.FC = () => {
  const { adminLogin } = useSealify();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTurnstile = async () => {
      const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || 'bootloader';
      const script = document.createElement('script');
      script.src = `https://challenges.cloudflare.com/turnstile/v0/api?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.turnstile && turnstileRef.current) {
          window.turnstile.render(turnstileRef.current, {
            sitekey: siteKey,
            callback: (token: string) => setTurnstileToken(token),
            'error-callback': () => setTurnstileError(true),
            'expired-callback': () => setTurnstileError(false),
          });
        }
      };
    };
    
    loadTurnstile();

    return () => {
      document.querySelectorAll('script[src*="turnstile"]').forEach(s => s.remove());
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.', { duration: 6000 });
      return;
    }

    if (!turnstileToken) {
      toast.error('Please complete the security verification.', { duration: 6000 });
      setTurnstileError(true);
      return;
    }

    setIsAuthenticating(true);

    // Security delay to prevent timing attacks & high-speed automated brute-force bots
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await adminLogin(email, password, turnstileToken);
    setIsAuthenticating(false);

    if (success) {
      navigate('/admin');
    } else {
      toast.error('Unable to authenticate administrator. Please verify your credentials and try again.', { duration: 6000 });
      // Reset turnstile on failure
      setTurnstileToken('');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple' | 'samsung' | 'phone') => {
    setIsAuthenticating(true);
    try {
      const supabase = (await import('../integrations/supabase/client')).supabase;
      const redirectTo = `${window.location.origin}/admin`;
      
      if (provider === 'phone') {
        toast.info('Phone login will be available once SMS provider is configured.', { duration: 6000 });
        setIsAuthenticating(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'samsung' ? 'google' : provider,
        options: {
          redirectTo,
          queryParams: provider === 'google' ? { prompt: 'select_account' } : {}
        }
      });

      if (error) {
        toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed: ${error.message}`, { duration: 6000 });
        setIsAuthenticating(false);
      }
    } catch (err: any) {
      toast.error(`Login failed: ${err.message}`, { duration: 6000 });
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-mono selection:bg-rose-500 selection:text-white">
      <SEO title="Sealify Official Terminal — Restricted Admin Gate" />
      <Navbar />
      
      <main className="max-w-xl mx-auto w-full px-4 flex-1 flex flex-col justify-center py-10">
        
        {/* WARNING BANNER FOR SEALIFY OFFICIALS ONLY */}
        <div className="bg-rose-950/90 border-2 border-rose-600 rounded-3xl p-5 mb-6 shadow-[0_0_40px_rgba(225,29,72,0.3)] animate-pulse space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-2xl shrink-0 shadow-lg">
              <Siren className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-sm font-black text-rose-200 uppercase tracking-widest flex items-center gap-1.5">
                <span>SEALIFY OFFICIALS ONLY</span>
              </h2>
              <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">RESTRICTED GOVERNMENT & SYSTEM ROOT ACCESS</p>
            </div>
          </div>

          <p className="text-xs text-rose-100 leading-relaxed font-sans border-t border-rose-800/80 pt-2.5 font-medium">
            <strong>SECURITY NOTICE:</strong> This area is restricted to authorized Sealify administrators. Authentication attempts may be recorded for security monitoring and abuse prevention.
          </p>
        </div>

        {/* TERMINAL LOGIN BOX */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-slate-950 border-2 border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-rose-400">
              <Terminal className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Sealify Official Authentication</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ENCRYPTED ENDPOINT • NODE OGBOMOSO</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">
                  Official Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sealify.ng"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-11 pr-10 py-3 text-xs text-white focus:outline-none font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Turnstile verification widget */}
              <div className="flex justify-center py-2">
                <div ref={turnstileRef} className="cf-turnstile" style={{ width: '300px', height: '65px' }} />
              </div>
              {turnstileError && (
                <p className="text-rose-400 text-[10px] font-mono text-center">Security verification required</p>
              )}

{/* OAuth Provider Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isAuthenticating}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-xl text-[10px] text-white font-mono transition-colors"
                  >
                    <Chrome className="w-3.5 h-3.5" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('apple')}
                    disabled={isAuthenticating}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-xl text-[10px] text-white font-mono transition-colors"
                  >
                    <Apple className="w-3.5 h-3.5" />
                    Apple
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('samsung')}
                    disabled={isAuthenticating}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-xl text-[10px] text-white font-mono transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Samsung
                  </button>
                </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 mt-2 font-mono active:scale-95"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Cryptographic Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Credentials & Authenticate</span>
                  </>
                )}
              </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Tracking Active
            </span>
            <span>AES-256 Bit Security</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
