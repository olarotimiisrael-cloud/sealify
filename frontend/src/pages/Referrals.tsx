import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { User, AlertCircle, Clock, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Referrals() {
  const [referrals, setReferrals] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { fetchMyReferrals, validateReferral } = useSealify();

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetchMyReferrals();
      setReferrals(res?.data || res);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await validateReferral(formData.code);
      setReferrals((prev) => ({ ...prev, valid: true, code: formData.code }));
      toast.success('Referral code validated!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid referral code');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({ code: '' });

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Referrals — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <User className="w-3 h-3" />
            <span>Refer & Earn</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Referral Program</h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
            Share Sealify with friends and earn rewards. Get ₦500 for every successful referral.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referral Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-6">
              <h2 className="text-xl font-black text-slate-900 mb-6">Your Referral Code</h2>
              <div className="flex items-center gap-3 px-4 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-black text-slate-900 text-lg tracking-widest">
                  {referrals?.code || 'SEALIFYXX'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referrals?.code || 'SEALIFYXX');
                    toast.success('Code copied!');
                  }}
                  className="ml-auto p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Referral Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Referrals" value={referrals?.total_referrals || 0} icon={User} color="text-blue-600 bg-blue-50" />
                <StatCard title="Total Reward" value={`₦${Number(referrals?.total_reward || 0).toLocaleString()}`} icon={Clock} color="text-emerald-600 bg-emerald-50" />
                <StatCard title="Rewarded" value={referrals?.rewarded || 0} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" />
              </div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Your Referrals</h3>
              {referrals?.referrals?.length > 0 ? (
                <div className="space-y-3">
                  {referrals.referrals.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-slate-700">{r.referee_name || 'User'}</span>
                          <p className="text-[9px] text-slate-400">#{r.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">₦{Number(r.reward_amount || 0).toLocaleString()}</span>
                        <p className="text-[9px]">
                          <span className={`font-bold text-${r.status === 'rewarded' ? 'emerald' : 'amber'}-600`}>
                            {r.status || 'pending'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-black text-slate-900 mb-2">No referrals yet</h3>
                  <p className="text-slate-500 text-xs">Share your code with friends to start earning.</p>
                </div>
              )}
            </div>
          </div>

          {/* Validate Referral */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-[260px]">
              <h2 className="text-xl font-black text-slate-900 mb-6">Validate Code</h2>
              <form onSubmit={handleValidate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referral Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 uppercase"
                    placeholder="SEALIFYXX"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                    loading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  {loading ? 'Validating...' : 'Validate Code'}
                </button>
              </form>
              <p className="text-[10px] text-slate-500 mt-2">
                Enter a friend's referral code to get a welcome bonus.
              </p>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <span className={`text-xl font-bold ${color}`}>{value}</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

