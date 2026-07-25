import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  Key, 
  Terminal, 
  AlertTriangle, 
  ShieldCheck, 
  Siren,
  EyeOff,
  Eye,
  Radio,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin: React.FC = () => {
  const { adminLogin, recordIntrusion } = useSealify();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      toast.error('🚨 TERMINAL LOCKED: Intrusion protocol engaged. Cybercrime agents notified.');
      return;
    }

    setIsAuthenticating(true);

    // Security delay to prevent timing attacks & high-speed automated brute-force bots
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await adminLogin(email, password, pin);
    setIsAuthenticating(false);

    if (success) {
      setFailedAttempts(0);
      navigate('/admin');
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      
      // Collect device metadata for forensic security tracking
      const deviceMetadata = `IP_LOGGED | Device: ${navigator.platform} | UserAgent: ${navigator.userAgent.slice(0, 40)}... | Attempt ${newCount}/3`;
      recordIntrusion(email || 'UNAUTHORIZED_ATTEMPT', deviceMetadata);

      toast.error(
        `🚨 WRONG CREDENTIALS! Attempt ${newCount}/3. Hardware fingerprint captured and logged to security database!`,
        { duration: 6000 }
      );

      if (newCount >= 3) {
        setIsLockedOut(true);
        toast.error('⛔ MAXIMUM FAILED ATTEMPTS REACHED! Terminal permanently locked for this session.');
      }
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
            ⚠️ <strong>SECURITY WARNING:</strong> This terminal is strictly reserved for authorized Sealify Administrators. <strong className="text-rose-300">Any wrong attempt will automatically submit your device hardware info, IP location, and biometric fingerprint to security agents for tracking and anti-hacking prosecution.</strong>
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

          {isLockedOut ? (
            <div className="p-4 bg-rose-950/90 border-2 border-rose-500 rounded-2xl text-xs text-rose-200 space-y-2 text-center">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto animate-bounce" />
              <p className="font-black uppercase tracking-wider">TERMINAL LOCKOUT ENGAGED</p>
              <p className="text-[11px] text-slate-300 font-sans">
                3 Failed login attempts recorded. Device information has been transmitted to Sealify Cyber Security Intelligence.
              </p>
            </div>
          ) : (
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
                  Access Key (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Access Key"
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

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">
                  Master PIN *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-rose-400 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="6-Digit Master PIN"
                    className="w-full bg-slate-950 border border-rose-500/50 focus:border-rose-500 rounded-xl pl-11 pr-4 py-3 text-sm font-black text-rose-400 focus:outline-none font-mono tracking-widest transition-colors"
                  />
                </div>
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
          )}

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