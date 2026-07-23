import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify, MarketplaceDeal } from '../context/SealifyContext';
import SEO from '../components/SEO';
import { CategoryBar } from '../components/CategoryBar';
import { CategoryGrid } from '../components/CategoryGrid';
import ListingCard from '../components/ListingCard';
import FeaturedAdSection from '../components/FeaturedAdSection';
import FeaturedVendorsSection from '../components/FeaturedVendorsSection';
import FilterDrawer from '../components/FilterDrawer';
import MapView from '../components/MapView';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import LiveActivityToast from '../components/LiveActivityToast';
import { NeighborhoodFilter } from '../components/NeighborhoodFilter';
import { 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  LayoutGrid,
  Map,
  MapPin,
  CheckCircle2,
  Lightbulb,
  Megaphone,
  X,
  Globe,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const Index: React.FC = () => {
  const { siteSettings, listings, filters, announcements, recentDeals, t } = useSealify();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [dismissedBannerIds, setDismissedBannerIds] = useState<string[]>([]);

  const activeAnnouncements = announcements.filter(a => a.active && !dismissedBannerIds.includes(a.id));
  
  const recommendedListings = listings
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const filteredListings = listings.filter((item) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    if (filters.category !== 'All' && item.category !== filters.category) return false;
    if (filters.condition !== 'All' && item.condition !== filters.condition) return false;
    if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice !== null && item.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && item.price > filters.maxPrice) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      <SEO />
      <Navbar />
      
      {activeAnnouncements.map((ann) => (
        <div key={ann.id} className={`py-2 px-4 border-b text-xs flex items-center justify-between gap-3 ${ann.type === 'alert' ? 'bg-rose-950 border-rose-800 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
          <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 truncate">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="font-bold truncate">{ann.title}:</span>
            <span className="truncate opacity-90">{ann.message}</span>
          </div>
          <button onClick={() => setDismissedBannerIds(prev => [...prev, ann.id])} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}

      {/* Live Deals Ticker */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2.5 overflow-hidden relative group">
        <div className="flex items-center gap-3 absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 shadow-lg">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Live Deals Sealed</span>
        </div>
        
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 pl-48">
          {[...recentDeals, ...recentDeals].map((deal, idx) => (
            <div key={`${deal.id}-${idx}`} className="flex items-center gap-2.5 text-[11px] font-bold text-slate-300">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
               <span className="text-white">₦{deal.price.toLocaleString()}</span>
               <span className="text-slate-500">for</span>
               <span className="text-emerald-400 italic">"{deal.itemTitle}"</span>
               <span className="text-slate-600">@ {deal.location}</span>
               <span className="text-[9px] text-slate-700 font-mono ml-1">{deal.time}</span>
            </div>
          ))}
          {recentDeals.length === 0 && (
            <div className="text-[11px] font-bold text-slate-500 italic uppercase tracking-tighter">Ogbomosoland Marketplace Node initializing... Transacting in real-time...</div>
          )}
        </div>
      </div>

      <CategoryBar />
      <LiveActivityToast />

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 py-6 sm:py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                <span>Ogbomosoland Hub & Oyo State District</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {t('trusted_marketplace')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">Sealify Nigeria</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">{siteSettings.siteDescription}</p>
              
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                 <Link to="/post-ad" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">{t('post_free_ad').toUpperCase()}</Link>
                 <button onClick={() => setIsFilterOpen(true)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition-all">{t('search_btn').toUpperCase()}</button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative">
                 <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
                    <Logo size="xl" />
                    <div>
                       <h3 className="text-xl font-black text-white">Official Node</h3>
                       <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Verified Marketplace</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800"><Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" /><p className="text-[10px] font-black uppercase text-slate-500">Free Posts</p></div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800"><ShieldCheck className="w-5 h-5 text-teal-400 mx-auto mb-1" /><p className="text-[10px] font-black uppercase text-slate-500">Secure Scan</p></div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800"><Globe className="w-5 h-5 text-blue-400 mx-auto mb-1" /><p className="text-[10px] font-black uppercase text-slate-500">Ogbomoso</p></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-12">
        <CategoryGrid />
        <NeighborhoodFilter />
        <FeaturedVendorsSection />

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20"><Lightbulb className="w-4 h-4" /></div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">{t('recommended_for_you')}</h3>
            <span className="text-[9px] font-black uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">{t('ai_matched')}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendedListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-black text-white tracking-tight">
              {filters.category === 'All' ? t('trending') : `${filters.category} Ads`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button onClick={() => setViewMode('grid')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('map')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}><Map className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold"><SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> <span>Filter</span></button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <MapView listings={filteredListings} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;