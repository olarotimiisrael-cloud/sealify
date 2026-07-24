import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { ShieldAlert, Lock, Mail, Key, ArrowRight, Terminal, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin: React.FC = () => {
  const { adminLogin, recordIntrusion } = useSealify();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      toast.error('Terminal locked due to security violation.');
      return;
    }

    const success = await adminLogin(email, password, pin);
    if (success) {
      setFailedAttempts(0);
      navigate('/admin');
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      
      // Log threat in forensic database
      recordIntrusion(email, `Failed Access Attempt ${newCount}/3`);

      if (newCount >= 3) {
        setIsLockedOut(true);
        toast.error('🚨 Security Lockout: 3 failed attempts. Terminal blocked.');
      } else {
        toast.error(`Access denied. ${3 - newCount} attempts remaining.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-mono">
      <SEO title="Secure Admin Access Terminal" />
      <Navbar />
      <main className="max-w-md mx-auto w-full px-4 flex-1 flex flex-col justify-center py-12">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-slate-950 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner"><Terminal className="w-8 h-8 text-emerald-500" /></div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Admin Verification</h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Authorized Personnel Only • Encrypted Terminal</p>
          </div>

          {isLockedOut && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>Security Lockout Active. Access completely blocked.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal Email ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-4 top-3.5" />
                <input 
                  type="email" 
                  required 
                  disabled={isLockedOut}
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@sealify.ng" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800 disabled:opacity-50" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-4 top-3.5" />
                <input 
                  type="password" 
                  required 
                  disabled={isLockedOut}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800 disabled:opacity-50" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Master Security Access PIN</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-600 absolute left-4 top-3.5" />
                <input 
                  type="password" 
                  required 
                  maxLength={6}
                  disabled={isLockedOut}
                  value={pin} 
                  onChange={e => setPin(e.target.value)} 
                  placeholder="6-Digit PIN" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800 font-mono tracking-widest disabled:opacity-50" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLockedOut}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>Execute Authentication</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2 opacity-30 group cursor-default">
             <ShieldAlert className="w-4 h-4" /><span className="text-[9px] font-black uppercase">Encrypted Endpoint Protection Active</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;