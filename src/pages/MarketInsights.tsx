import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  ArrowUpRight,
  Calculator,
  Filter,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MarketInsights: React.FC = () => {
  const { marketStats } = useSealify();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredStats = marketStats.filter((stat) => {
    if (selectedCategory !== 'All' && stat.category !== selectedCategory) return false;
    if (searchQuery && !stat.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return stat.totalAds > 0;
  });

  const chartData = marketStats
    .filter(s => s.totalAds > 0)
    .map(s => ({
      name: s.category,
      avg: s.avgPrice,
      ads: s.totalAds
    }))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Ogbomoso Market Price Index & Insights — Sealify Nigeria"
        description="Check average resale prices, demand scores, and market trends for electronics, vehicles, and real estate in Ogbomosoland."
      />
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
             <div className="space-y-4 max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
                   <TrendingUp className="w-4 h-4" />
                   <span>Real-time Marketplace Economics</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ogbomoso Price Index</h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                   Stop overpaying and start selling smarter. Our AI analyzes local inventory to give you the most accurate fair-market value for items in the Ogbomoso district.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl text-center space-y-1">
                   <p className="text-2xl font-black text-emerald-400">92%</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price Accuracy</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl text-center space-y-1">
                   <p className="text-2xl font-black text-blue-400">2.4k</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analyzed Ads</p>
                </div>
             </div>
          </div>
        </div>

        {/* Price Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Category Resale Benchmark
            </h3>
            <span className="text-[10px] font-black bg-slate-950 text-slate-500 px-3 py-1 rounded-full border border-slate-800">Avg. Listing Value (NGN)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(value: number) => [formatNGN(value), 'Market Average']}
                />
                <Bar dataKey="avg" radius={[8, 8, 0, 0]} barSize={40}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search index by category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['All', 'Vehicles', 'Electronics', 'Real Estate', 'Fashion', 'Home & Furniture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-black shadow'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Category Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredStats.map((stat) => (
              <div key={stat.category} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 hover:border-emerald-500/30 transition-all group shadow-xl">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-lg font-black text-white">{stat.category}</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.totalAds} active ads in zone</p>
                    </div>
                    <div className={`p-2 rounded-xl border ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                       {stat.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Average Resale Value</p>
                       <p className="text-2xl font-black text-emerald-400">{formatNGN(stat.avgPrice)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                          <p className="text-slate-500 font-bold uppercase text-[9px]">Fast Sale</p>
                          <p className="text-white font-black">{formatNGN(stat.minPrice)}</p>
                       </div>
                       <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                          <p className="text-slate-500 font-bold uppercase text-[9px]">Premium</p>
                          <p className="text-white font-black">{formatNGN(stat.maxPrice)}</p>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-slate-400">Demand Velocity</span>
                          <span className="text-blue-400">{stat.demandScore}%</span>
                       </div>
                       <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-blue-500 h-full" style={{ width: `${stat.demandScore}%` }}></div>
                       </div>
                    </div>
                 </div>

                 <Link 
                   to={`/?category=${encodeURIComponent(stat.category)}`}
                   className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                 >
                    <span>View Market Deals</span>
                    <ArrowUpRight className="w-4 h-4" />
                 </Link>
              </div>
           ))}
        </div>

        <div className="bg-emerald-900/10 border-2 border-emerald-500/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="p-5 bg-emerald-500/20 text-emerald-400 rounded-3xl border border-emerald-500/30">
                 <Calculator className="w-10 h-10" />
              </div>
              <div className="space-y-2 flex-1 text-center md:text-left">
                 <h2 className="text-2xl font-black text-white">Value your own item?</h2>
                 <p className="text-sm text-slate-400">Get an instant AI-powered valuation for your car, phone, or laptop based on Ogbomoso's local market behavior.</p>
              </div>
              <Link to="/post-ad" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">START SELLING NOW</Link>
           </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default MarketInsights;