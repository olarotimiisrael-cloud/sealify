import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function Auth() {
  const { user, t } = useSealify();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  if (user) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Already Signed In</h2>
        <p className="text-slate-400">You are already logged in as {user.fullName || user.email}</p>
        <Link to="/my-ads" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl">
          Go to My Ads
        </Link>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Sealify Marketplace</h2>
          <p className="text-xs text-slate-400">Nigeria's Trusted Local Classifieds Network</p>
        </div>

        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <span>{t('login')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'signup' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <span>{t('signup')}</span>
          </button>
        </div>

        {activeTab === 'login' && <LoginForm />}
        {activeTab === 'signup' && <RegisterForm />}
      </div>
    </div>
  );
}