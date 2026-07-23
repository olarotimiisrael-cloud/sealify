import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import SEO from '../components/SEO';
import { CategoryBar } from '../components/CategoryBar';
import { CategoryGrid } from '../components/CategoryGrid';
import ListingCard from '../components/ListingCard';
import FeaturedAdSection from '../components/FeaturedAdSection';
import FeaturedVendorsSection from '../components/FeaturedVendorsSection';
import FilterDrawer from '../components/FilterDrawer';
import SafetyTipsModal from '../components/SafetyTipsModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import MapView from '../components/MapView';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import LiveActivityToast from '../components/LiveActivityToast';
import { CompareModal } from '../components/CompareModal';
import { NeighborhoodFilter } from '../components/NeighborhoodFilter';
import { 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  History,
  LayoutGrid,
  Map,
  Bell,
  MapPin,
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  Lightbulb,
  Scale,
  Activity,
  Megaphone,
  X,
  Filter,
  Tag,
  TrendingUp,
  Handshake,
  ArrowUpRight
} from 'lucide-react';

const POPULAR_SEARCHES = ['Tesla', 'MacBook', 'Apartment', 'iPhone', 'Sofa', 'Plumbing', 'Real Estate', 'Vehicles'];

export const Index: React.FC = () => {
  const { listings, filters, setFilters, resetFilters, recentlyViewedIds, compareListingIds, announcements, recentDeals, t } = useSealify();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [isSavedAlertsOpen, setIsSavedAlertsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [dismissedBannerIds, setDismissedBannerIds] = useState<string[]>([]);

  // Preset state
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const activeAnnouncements = announcements.filter(a => a.active && !dismissedBannerIds.includes(a.id));
  const recentlyViewedListings = listings.filter((l) => recentlyViewedIds.includes(l.id));
  
  const recommendedListings = listings
    .filter(l => !recentlyViewedIds.includes(l.id))
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const applyPreset = (presetKey: string) => {
    if (activePreset === presetKey) {
      setActivePreset(null);
      resetFilters();
      return;
    }

    setActivePreset(presetKey);
    if (presetKey === 'under50k') {
      setFilters(prev => ({ ...prev, maxPrice: 50000, minPrice: null }));
    } else if (presetKey === 'under250k') {
      setFilters(prev => ({ ...prev, maxPrice: 250000, minPrice: null }));
    } else if (presetKey === 'under1m') {
      setFilters(prev => ({ ...prev, maxPrice: 1000000, minPrice: null }));
    } else if (presetKey === 'brandnew') {
      setFilters(prev => ({ ...prev, condition: 'Brand New' }));
    }
  };

  const filteredListings = listings.filter((item) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    if (filters.category !== 'All' && item.category !== filters.category) return false;
    if (filters.condition !== 'All' && item.condition !== filters.condition) return false;
    if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice !== null && item.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && item.price > filters.maxPrice) return false;

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      <SEO />
      <Navbar />
      
      {/* Live System Announcement Banner */}
      {activeAnnouncements.map((ann) => (
        <div 
          key={ann.id}
          className={`py-2 px-4 border-b text-xs flex items-center justify-between gap-3 ${
            ann.type === 'alert' ? 'bg-rose-950 border-rose-800 text-rose-200' :
            ann.type === 'warning' ? 'bg-amber-950 border-amber-800 text-amber-200' :
            ann.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-200' :
            'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 truncate">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="font-bold truncate">{ann.title}:</span>
            <span className="truncate opacity-90">{ann.message}</span>
          </div>

          <button
            onClick={() => setDismissedBannerIds(prev => [...prev, ann.id])}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <CategoryBar />
      <LiveActivityToast />

      {/* Hero Showcase */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 py-6 sm:py-10 px-3 sm:px-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-black px-3.5 py-1 rounded-full self-center lg:self-start shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ogbomosoland, Oyo State & Across Nigeria</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {t('trusted_marketplace')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                  in Nigeria
                </span>
              </h1>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Buy. Sell. Connect. Everything you need in one place — from luxury vehicles and real estate to phones, fashion, and services.
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Trending:</span>
                {POPULAR_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilters((prev) => ({ ...prev, searchQuery: tag }))}
                    className="text-[10px] sm:text-[11px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-inner shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">Sealify Marketplace Hub</h3>
                      <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ogbomosoland, Oyo State & Nationwide</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/post-ad"
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all shrink-0 self-stretch sm:self-auto justify-center"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('post_free_ad').toUpperCase()}</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">100% Free</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Sell Anything Fast</h4>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-teal-500/40 transition-colors">
                    <div className="flex items-center justify-between text-teal-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CCTV Safe</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Safe Meetup Zones</h4>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center justify-between text-amber-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Direct</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Direct Phone & Chat</h4>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1 space-y-8 sm:space-y-12">
        
        {/* Live Marketplace Deals Ticker */}
        <section className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-emerald-500/5 to-transparent"></div>
           <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
              <div className="flex items-center gap-2 shrink-0 border-r border-slate-800 pr-4">
                 <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <Handshake className="w-6 h-6 animate-pulse" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Live Deals</p>
                    <h3 className="text-sm font-black text-white">Ogbomoso Pulse</h3>
                 </div>
              </div>

              <div className="flex-1 overflow-hidden">
                 <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                    {recentDeals.map((deal) => (
                      <div key={deal.id} className="flex items-center gap-2">
                         <span className="text-[11px] font-bold text-slate-100">"{deal.itemTitle}"</span>
                         <span className="text-[11px] font-black text-emerald-400">₦{deal.price.toLocaleString()}</span>
                         <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded-full text-slate-500 font-bold border border-slate-800">
                           {deal.location.split(',')[0]} • {deal.time}
                         </span>
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mx-2"></div>
                      </div>
                    ))}
                    {/* Repeat for continuous loop */}
                    {recentDeals.map((deal) => (
                      <div key={`${deal.id}-copy`} className="flex items-center gap-2">
                         <span className="text-[11px] font-bold text-slate-100">"{deal.itemTitle}"</span>
                         <span className="text-[11px] font-black text-emerald-400">₦{deal.price.toLocaleString()}</span>
                         <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded-full text-slate-500 font-bold border border-slate-800">
                           {deal.location.split(',')[0]} • {deal.time}
                         </span>
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mx-2"></div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="shrink-0 hidden lg:block">
                 <Link to="/vendors" className="text-[11px] font-black text-emerald-400 hover:underline flex items-center gap-1">
                   VIEW MERCHANTS <ArrowUpRight className="w-3.5 h-3.5" />
                 </Link>
              </div>
           </div>
        </section>

        <CategoryGrid />
        
        {/* Neighborhood Filter */}
        <NeighborhoodFilter />

        {/* Featured Vendors Showcase */}
        <FeaturedVendorsSection />

        {/* Local Market Pulse: Live Stats */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute -left-12 -top-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
              <Activity className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Ogbomosoland Market Pulse</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Live trading statistics across Oyo State</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-10 w-full sm:w-auto">
            <div className="text-center sm:text-left">
              <p className="text-2xl font-black text-white">1,400+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Ads Active</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-black text-emerald-400">420</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Verified Sellers</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-black text-teal-400">85%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Success Rate</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-black text-blue-400">12</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Safe Zones</p>
            </div>
          </div>
        </section>

        {/* Quick Filter Presets Row */}
        <section className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Quick Deal Filters:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => applyPreset('under50k')}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                activePreset === 'under50k' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Under ₦50,000
            </button>
            <button
              onClick={() => applyPreset('under250k')}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                activePreset === 'under250k' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Under ₦250,000
            </button>
            <button
              onClick={() => applyPreset('under1m')}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                activePreset === 'under1m' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Under ₦1,000,000
            </button>
            <button
              onClick={() => applyPreset('brandnew')}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                activePreset === 'brandnew' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Brand New Only
            </button>
            {activePreset && (
              <button
                onClick={() => { setActivePreset(null); resetFilters(); }}
                className="px-2.5 py-1 text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors"
              >
                Clear Preset
              </button>
            )}
          </div>
        </section>

        {/* AI Recommendations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">Recommended for You</h3>
            <span className="text-[9px] font-black uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">AI Interest Matched</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {recommendedListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <FeaturedAdSection listings={listings} />

        {recentlyViewedListings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-200">Recently Viewed</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
              {recentlyViewedListings.map((listing) => (
                <div key={listing.id}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {filters.category === 'All' ? t('trending') : `${filters.category} Ads`}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button onClick={() => setViewMode('grid')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('map')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}><Map className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={() => setIsSavedAlertsOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold"><Bell className="w-3.5 h-3.5 text-emerald-400" /> <span>{t('saved')}</span></button>
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold"><SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> <span>Filter</span></button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <MapView listings={filteredListings} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Compare Action Trigger */}
      {compareListingIds.length > 0 && (
        <button
          onClick={() => setIsCompareOpen(true)}
          className="fixed bottom-20 right-6 z-50 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3.5 rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-500/40 animate-in fade-in slide-in-from-bottom-10"
        >
          <Scale className="w-5 h-5" />
          <span>Compare Items ({compareListingIds.length})</span>
        </button>
      )}

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <SafetyTipsModal isOpen={isSafetyTipsOpen} onClose={() => setIsSafetyTipsOpen(false)} />
      <SavedAlertsModal isOpen={isSavedAlertsOpen} onClose={() => setIsSavedAlertsOpen(false)} />
      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
      
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;