import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Star, CreditCard, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Promotions() {
  const [tab, setTab] = useState<'eligibility' | 'my'>('my');
  const [eligibility, setEligibility] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { checkPromotionEligibility, fetchMyPromotions, promoteListing } = useSealify();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eligRes, promRes] = await Promise.all([
        checkPromotionEligibility(),
        fetchMyPromotions(),
      ]);
      setEligibility(eligRes?.data || eligRes);
      setPromotions(promRes?.data || promRes || []);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (listingId: string, planId: string) => {
    setLoading(true);
    try {
      await promoteListing(listingId, { plan_id: planId });
      toast.success('Listing promoted successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Promotion failed');
    } finally {
      setLoading(false);
    }
  };

  const PLANS = [
    { id: '1_month', name: '1 Month Boost', price: '₦2,000', description: 'Featured for 30 days' },
    { id: '3_months', name: '3 Month Boost', price: '₦5,000', description: 'Featured for 90 days' },
    { id: '6_months', name: '6 Month Boost', price: '₦9,000', description: 'Featured for 180 days' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Promotions — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
                <Star className="w-3 h-3" />
                <span>Promotions</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Boost Your Listings</h1>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
                Promote your ads to reach more buyers. Featured listings get up to 5x more views.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTab('eligibility')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'eligibility'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:text-emerald-600'
                }`}
              >
                Eligibility
              </button>
              <button
                onClick={() => setTab('my')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'my'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:text-emerald-600'
                }`}
              >
                My Promotions
              </button>
            </div>
          </div>
        </div>

        {tab === 'eligibility' && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Promotion Eligibility</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NGN pricing</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Eligible for Promotion</h3>
                  <p className="text-xs text-slate-500">You can promote your listings</p>
                </div>
                <span className="bg-emerald-100 text-emerald-600 font-black text-[10px] px-3 py-1 rounded-full">
                  ✓ Eligible
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <div key={plan.id} className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{plan.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-3">{plan.description}</p>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-xl font-black text-emerald-600">{plan.price}</span>
                      <span className="text-xs text-slate-400">/listing</span>
                    </div>
                    <button
                      onClick={() => handlePromote('listing_id', plan.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Promote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'my' && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">My Promotions</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{promotions.length} active</span>
            </div>

            {promotions.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">No active promotions</h3>
                <p className="text-slate-500 text-xs">Promote your listings to get more visibility.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{p.listing_title || 'Listing'}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status || 'active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{p.plan_name || 'Boost Plan'}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600">₦{Number(p.amount || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">• Expires {new Date(p.expires_at || p.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

