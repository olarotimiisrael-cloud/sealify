import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { ShieldAlert, Lock, Mail, Key, ArrowRight, Terminal, AlertTriangle, ShieldX, UserX, Eye, Info } from 'lucide-react';
import { toast } from 'sonner';

export const AdminLogin: React.FC = () => {
  const { adminLogin, logSecurityBreach } = useSealify();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const captureBreachMetadata = async (isFinalAttempt: boolean) => {
    const meta = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      vendor: navigator.vendor,
      language: navigator.language,
      timestamp: new Date().toISOString(),
      mediaStatus: 'Capture Denied/Blocked'
    };

    if (isFinalAttempt) {
      // Attempt to trigger a media prompt as 'evidence' capture (visual/audio)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        meta.mediaStatus = 'Access Granted (Live Capture Initiated)';
        // Stop the stream immediately after "triggering" the threat
        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        meta.mediaStatus = 'Access Denied (Intruder Blocked Media)';
      }
      
      logSecurityBreach(meta);
      toast.error('🚨 BREACH PROTOCOL INITIALIZED: Your device hardware ID and environmental data have been dispatched to Sealify Security Hub.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      toast.error('Terminal completely locked due to security protocol violation.');
      return;
    }

    if (adminLogin(email, password, pin)) {
      setFailedAttempts(0);
      navigate('/admin');
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      
      if (newCount >= 3) {
        setIsLockedOut(true);
        captureBreachMetadata(true);
      } else {
        captureBreachMetadata(false);
        toast.error(`Access denied. Unauthorized attempt ${newCount} of 3. Security agency will be notified on next failure.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-mono">
      <SEO title="Secure Admin Access Terminal — Sealify" />
      <Navbar />
      
      {/* High-Priority Security Warning Header */}
      <div className="bg-rose-600 py-3 px-4 flex items-center justify-center gap-3 animate-pulse">
        <ShieldAlert className="w-6 h-6 text-white shrink-0" />
        <p className="text-[11px] sm:text-xs font-black uppercase text-white tracking-widest text-center">
          🚨 WARNING: UNAUTHORIZED ACCESS ATTEMPTS ARE FORWARDED TO THE NPF CYBERCRIME UNIT. DO NOT ATTEMPT TO LOGIN IF NOT AUTHORIZED.
        </p>
      </div>

      <main className="max-w-md mx-auto w-full px-4 flex-1 flex flex-col justify-center py-10">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl"></div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-slate-950 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
               {isLockedOut ? <ShieldX className="w-8 h-8 text-rose-500" /> : <Terminal className="w-8 h-8 text-emerald-500" />}
            </div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Admin Terminal</h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Authorized Personnel Only • Encrypted Access</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-rose-500/30 rounded-2xl text-center space-y-2">
            <p className="text-[10px] text-rose-400 font-black flex items-center justify-center gap-1 uppercase">
              <ShieldAlert className="w-3.5 h-3.5" /> Security Protocol
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
              System captures IP, device metadata, and environmental identifiers upon engagement. This data is permanent evidence.
            </p>
          </div>

          {isLockedOut && (
            <div className="p-4 bg-red-950 border border-red-500/50 rounded-2xl text-xs text-red-200 space-y-3 text-center animate-in zoom-in-95">
              <UserX className="w-8 h-8 text-red-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-black uppercase tracking-widest">ACCESS TERMINATED</p>
                <p className="text-[10px] opacity-80 leading-relaxed">Too many failed attempts. Device ID blacklisted. Logs dispatched to admin@sealify.ng and security agencies.</p>
              </div>
            </div>
          )}

          {!isLockedOut && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 absolute left-4 top-3.5" />
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="admin@sealify.ng" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 absolute left-4 top-3.5" />
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••••••" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Master Access PIN</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-600 absolute left-4 top-3.5" />
                  <input 
                    type="password" 
                    required 
                    maxLength={6}
                    value={pin} 
                    onChange={e => setPin(e.target.value)} 
                    placeholder="6-Digit PIN" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800 font-mono tracking-widest" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
              >
                <span>Authorize Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2 opacity-30 cursor-default">
             <Eye className="w-4 h-4" />
             <span className="text-[9px] font-black uppercase tracking-tighter">Activity is being recorded in Real-time</span>
          </div>
        </div>

        <div className="mt-6 text-center">
           <Link to="/" className="text-[10px] font-black text-slate-600 hover:text-emerald-500 uppercase flex items-center justify-center gap-1 transition-colors">
              <Info className="w-3 h-3" /> Back to Public Marketplace
           </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;