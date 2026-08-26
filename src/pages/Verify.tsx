import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../integrations/supabase/client';

const Verify: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'verified' | 'pending'>('checking');

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setStatus(data.session ? 'verified' : 'pending');
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <SEO title="Email Verification — Sealify" />
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        {status === 'checking' ? (
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-400" />
        ) : (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        )}
        <h1 className="mt-4 text-2xl font-black text-white">
          {status === 'verified' ? 'Email verified' : status === 'pending' ? 'Verification link received' : 'Checking verification'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {status === 'verified'
            ? 'Your Sealify account is ready. You can continue to the marketplace.'
            : 'If your email provider opened this page without a session, return to the confirmation email and open the link again.'}
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">
          Continue to Sealify
        </Link>
      </section>
    </main>
  );
};

export default Verify;
