import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSealify } from '@/context/SealifyContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Smartphone, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const ProfileComplete: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSealify();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error('Please fill in your full name and phone number');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No active session');

      const response = await fetch('/api/auth/profile-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete profile');
      }

      toast.success('Profile completed successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <SEO title="Complete Profile — Sealify" />
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl relative text-slate-100 font-sans overflow-hidden">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Complete Your Profile</h1>
          <p className="text-xs text-slate-400">
            To secure your Sealify account, please provide a few additional details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adebayo Ogunlesi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Phone Number *
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+234 812 345 6789"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>

        <p className="mt-6 pt-4 border-t border-slate-800 text-center text-[9px] text-slate-600 flex items-center justify-center gap-1.5 uppercase font-black tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
          Sealify Security Protocol
        </p>
      </section>
    </main>
  );
};

export default ProfileComplete;