import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { ShieldAlert, Lock, Mail, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useSealify();
  const navigate = useNavigate();

  const [email, setEmail] = useState('olarotimiisrael@gmail.com');
  const [password, setPassword] = useState('Tscw+1234');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(email, password);
    if (success) {
      navigate('/admin');
    }
  };

  const handleFillDefaultAdmin = () => {
    setEmail('olarotimiisrael@gmail.com');
    setPassword('Tscw+1234');
    toast.info('Default Admin credentials loaded');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <SEO 
        title="Admin Portal Access — Sealify Nigeria" 
        description="Restricted administrative dashboard access for Sealify platform security moderators." 
      />
      <Navbar />

      <main className="max-w-md mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal Access</h1>
            <p className="text-slate-400 text-xs">
              Log in with administrator privileges to manage users and platform records.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sealify.ng"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>Authenticate & Access Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center space-y-2">
            <button
              type="button"
              onClick={handleFillDefaultAdmin}
              className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Default Admin Credentials</span>
            </button>
            <p className="text-[10px] text-slate-500">
              Default Admin: <strong className="text-slate-300">olarotimiisrael@gmail.com</strong>
            </p>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default AdminLogin;