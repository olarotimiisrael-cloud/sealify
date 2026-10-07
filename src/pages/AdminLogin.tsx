import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { 
  Lock, 
  Mail, 
  Terminal, 
  ShieldCheck,
  EyeOff,
  Eye,
  Radio,
  Loader2,
  Siren
} from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin: React.FC = () => {
  const { adminLogin, clearError } = useSealify();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.', { duration: 6000 });
      return;
    }

    setIsAuthenticating(true);

    // Clear previous error
    clearError();

    await new Promise((resolve) => setTimeout(resolve, 800));

    const outcome = await adminLogin(email, password);
    setIsAuthenticating(false);

    if (outcome.success) {
      navigate('/admin');
    } else {
      // Use the message returned by adminLogin() directly. Reading `error`
      // here would return a stale value from a previous render, because
      // setError() has not re-rendered this closure yet.
      toast.error(outcome.message || 'Unable to authenticate administrator. Please try again.', { duration: 8000 });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-ui selection:bg-primary selection:text-white">
      <SEO title="Sealify Admin Login" />
      <Navbar />
      
      <main className="max-w-xl mx-auto w-full px-4 flex-1 flex flex-col justify-center py-10">
        
        {/* WARNING BANNER FOR SEALIFY OFFICIALS ONLY */}
        <div className="bg-destructive/10 border-2 border-destructive/50 rounded-3xl p-5 mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 pointer-events-none"></div>
          <div className="relative flex items-center gap-3">
            <div className="p-2.5 bg-destructive text-white rounded-2xl shrink-0 shadow-lg">
              <Siren className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-sm font-black text-rose-200 uppercase tracking-widest flex items-center gap-1.5">
                <span>SEALIFY OFFICIALS ONLY</span>
              </h2>
              <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">RESTRICTED GOVERNMENT & SYSTEM ROOT ACCESS</p>
            </div>
          </div>

          <p className="text-xs text-rose-100 leading-relaxed font-sans border-t border-rose-800/80 pt-2.5 font-medium relative">
            <strong>SECURITY NOTICE:</strong> This area is restricted to authorized Sealify administrators. Authentication attempts may be recorded for security monitoring and abuse prevention.
          </p>
        </div>

        {/* AUTHENTICATION LOGIN BOX */}
        <div className="admin-panel-strong p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-surface-stronger border-2 border-primary/40 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-primary">
              <Terminal className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Sealify Official Authentication</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ENCRYPTED ENDPOINT • NODE OGBOMOSO</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 font-mono">
                  Official Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sealify.ng"
                    className="w-full bg-surface border border-surface-border focus:border-primary rounded-xl pl-11 pr-4 py-3 text-xs text-foreground focus:outline-none font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 font-mono">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-surface border border-surface-border focus:border-primary rounded-xl pl-11 pr-10 py-3 text-xs text-foreground focus:outline-none font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-4 gx-primary hover:opacity-90 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/50 flex items-center justify-center gap-2 mt-2 font-mono active:scale-95"
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

          <div className="pt-3 border-t border-surface-border flex items-center justify-between text-[9px] text-muted-foreground font-mono">
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
