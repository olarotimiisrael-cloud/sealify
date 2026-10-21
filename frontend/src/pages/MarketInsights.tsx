import React, { useEffect, useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { TrendingUp, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketInsights() {
  const [stats, setStats] = useState<any>(null);
  const [priceIndex, setPriceIndex] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { fetchMarketStats, fetchPriceIndex } = useSealify();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, priceRes] = await Promise.all([
        fetchMarketStats(),
        fetchPriceIndex({ category: 'All' }),
      ]);
      setStats(statsRes?.data || statsRes);
      setPriceIndex(priceRes?.data || priceRes);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load market insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Market Insights — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <TrendingUp className="w-3 h-3" />
            <span>Market Data</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Market Insights
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Real-time pricing trends and marketplace statistics for Ogbomosoland.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <StatCard
            title="Total Active Listings"
            value={stats?.total_ads || 0}
            icon={Package}
            color="text-emerald-600 bg-emerald-50"
            subtitle="items for sale"
          />
          <StatCard
            title="Registered Users"
            value={stats?.total_users || 0}
            icon={Users}
            color="text-blue-600 bg-blue-50"
            subtitle="members"
          />
          <StatCard
            title="Average Price"
            value={stats?.avg_price ? `?${Number(stats.avg_price).toLocaleString()}` : '?0'}
            icon={DollarSign}
            color="text-amber-600 bg-amber-50"
            subtitle="market average"
          />
          <StatCard
            title="Total Sold"
            value={stats?.total_sold || 0}
            icon={Clock}
            color="text-purple-600 bg-purple-50"
            subtitle="completed deals"
          />
        </div>

        {/* Price Index */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">Price Index by Category</h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NGN pricing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Price</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Price</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Price</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Ads</th>
                </tr>
              </thead>
              <tbody>
                {priceIndex?.categories?.map((cat: any) => (
                  <tr key={cat.category} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{cat.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">?{Number(cat.min_price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">?{Number(cat.max_price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-medium text-emerald-600">?{Number(cat.avg_price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{cat.total_ads}</td>
                  </tr>
                ))}
                {(priceIndex?.categories?.length || 0) === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No pricing data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black {color.split(' ')[0]}">{value}</span>
            <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl ${color.split(' ')[1]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

