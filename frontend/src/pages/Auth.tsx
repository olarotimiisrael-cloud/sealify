import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const modeFromUrl = searchParams.get('mode') as 'login' | 'signup' | null;
  const [mode, setMode] = useState<'login' | 'signup'>(modeFromUrl || 'login');
  const { isAuthenticated } = useSealify();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title={`${mode === 'signup' ? 'Sign Up' : 'Log In'} — Sealify Nigeria`} />
      <Navbar />
      <main className="max-w-md mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-[0_25px_80px_rgba(15,23,42,0.2)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
              <Mail className="w-3 h-3" />
              <span>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              {mode === 'signup' ? 'Join Sealify' : 'Sign In'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              {mode === 'signup'
                ? 'Start buying and selling safely in Ogbomosoland.'
                : 'Enter your credentials to access your account.'}
            </p>
          </div>

          {mode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setMode('signup')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}

          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-400">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}
