import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import { CategoryGrid } from '../components/CategoryGrid';
import ListingCard from '../components/ListingCard';
import FeaturedAdSection from '../components/FeaturedAdSection';
import FilterDrawer from '../components/FilterDrawer';
import SafetyTipsModal from '../components/SafetyTipsModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import MapView from '../components/MapView';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import LiveActivityToast from '../components/LiveActivityToast';
import { CompareModal } from '../components/CompareModal';
import { 
  SlidersHorizontal, 
  Search, 
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
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Lightbulb,
  Scale,
  Smartphone,
  Eye,
  Building,
  Activity,
  Award
} from 'lucide-react';

const POPULAR_SEARCHES = ['Tesla', 'MacBook', 'Apartment', 'iPhone', 'Sofa', 'Plumbing', 'Real Estate', 'Vehicles'];

const Index: React.FC = () => {
  const { listings, filters, setFilters, resetFilters, recentlyViewedIds, compareListingIds, t } = useSealify();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [isSavedAlertsOpen, setIsSavedAlertsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const recentlyViewedListings = listings.filter((l) => recentlyViewedIds.includes(l.id));
  
  // AI Recommendation simulation
  const recommendedListings = listings
    .filter(l => !recentlyViewedIds.includes(l.id))
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

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
      <Navbar />

      <CategoryBar />

      <LiveActivityToast />

      {/* Hero Showcase */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 py-6 sm:py-8 px-3 sm:px-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-black px-3.5 py-1 rounded-full self-center lg:self-start shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ogbomosoland, Oyo State & Across Nigeria</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {t('trusted_marketplace')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                  in Nigeria
                </span>
              </h1>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl mx-auto">
                {t('browse_categories')} {t('browse_categories_desc')}
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-1 sm:gap-1.5">
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

            {/* Right Column: Redesigned Showcase Hub */}
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
                        <span>{t('live_traffic')}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/post-ad"
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0 self-stretch sm:self-auto justify-center"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('post_free_ad')}</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded">100% Free</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Sell Anything Fast</h4>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-teal-500/40 transition-colors">
                    <div className="flex items-center justify-between text-teal-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-teal-500/10 px-2 py-0.5 rounded">CCTV Safe</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Safe Meetup Zones</h4>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center justify-between text-amber-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded">Direct</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Direct Phone & Chat</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Ads */}
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
                        <span>{t('live_traffic')}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/post-ad"
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0 self-stretch sm:self-auto justify-center"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('post_free_ad')}</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded">100% Free</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Sell Anything Fast</h4>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-teal-500/40 transition-colors">
                    <div className="flex items-center justify-between text-teal-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-teal-500/10 px-2 py-0.5 rounded">CCTV Safe</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Safe Meetup Zones</h4>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center justify-between text-amber-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded">Direct</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Direct Phone & Chat</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Ad Section */}
            <FeaturedAdSection listings={listings} />

            {/* How it Works Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Trading on Sealify is easy</h2>
                <p className="text-xs sm:text-2xl font-bold uppercase tracking-widest">3 Steps to Success</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4 group">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">1. Post Your Ad</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Upload clear photos and set your price. It takes less than 2 minutes to go live.</p>
                  </div>
                </div>

                <div className="text-center space-y-4 group">
                  <div className="w-16 h-16 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/20 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">2. Chat with Buyers</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Respond to inquiries directly via in-app chat or phone. Review buyer profiles.</p>
                  </div>
                </div>

                <div className="text-center space-y-4 group">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Building className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">3. Meet and Seal</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Meet at a verified Safe Exchange Zone, inspect the item, and get paid instantly.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Recently Viewed Section */}
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
            ))}

            {/* View Mode Switcher */}
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

            {/* Grid or Map View */}
            {viewMode === 'map' ? (
              <MapView listings={filteredListings} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

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