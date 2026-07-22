import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import CategoryBar from '../components/CategoryBar';
import ListingCard from '../components/ListingCard';
import FeaturedAdSection from '../components/FeaturedAdSection';
import FilterDrawer from '../components/FilterDrawer';
import SafetyTipsModal from '../components/SafetyTipsModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import MapView from '../components/MapView';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
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
  Lock
} from 'lucide-react';

const POPULAR_SEARCHES = ['Tesla', 'MacBook', 'Apartment', 'iPhone', 'Sofa', 'Plumbing', 'Real Estate', 'Vehicles'];

const Index: React.FC = () => {
  const { listings, filters, setFilters, resetFilters, recentlyViewedIds } = useSealify();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [isSavedAlertsOpen, setIsSavedAlertsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const recentlyViewedListings = listings.filter((l) => recentlyViewedIds.includes(l.id));

  const filteredListings = listings.filter((item) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    if (filters.category !== 'All' && item.category !== filters.category) {
      return false;
    }

    if (filters.condition !== 'All' && item.condition !== filters.condition) {
      return false;
    }

    if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

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

      {/* Hero Showcase */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 py-6 sm:py-8 px-3 sm:px-4 relative overflow-hidden">
        {/* Glow decorative blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-black px-3.5 py-1 rounded-full self-center lg:self-start shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ogbomosoland, Oyo State & Across Nigeria</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Nigeria's Trusted <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                  Local Marketplace
                </span>
              </h1>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Buy. Sell. Connect. Everything you need in one place — from luxury vehicles and real estate to phones, fashion, and services.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1 text-left">
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 backdrop-blur-md shadow-lg">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white leading-tight">Trusted Sellers</p>
                    <p className="text-[10px] text-slate-400">Verified Badge System</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 backdrop-blur-md shadow-lg">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white leading-tight">Fast In-Person</p>
                    <p className="text-[10px] text-slate-400">Direct Contact Deals</p>
                  </div>
                </div>
              </div>

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

            {/* Right Column: Redesigned Beautiful Showcase Hub */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

                {/* Banner Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-inner shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">
                        Sealify Marketplace Hub
                      </h3>
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
                    <span>Post Free Ad</span>
                  </Link>
                </div>

                {/* 3 Quick Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        100% Free
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Sell Anything Fast</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      List cars, phones, services & properties with zero posting fees.
                    </p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-teal-500/40 transition-colors">
                    <div className="flex items-center justify-between text-teal-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        CCTV Safe
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Safe Meetup Zones</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Select monitored police & public exchange spots directly in chat.
                    </p>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center justify-between text-amber-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Direct
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-white">Direct Phone & Chat</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      No middleman commissions. Negotiate directly with local buyers.
                    </p>
                  </div>
                </div>

                {/* Bottom Highlight Bar */}
                <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-300 font-semibold text-[11px] sm:text-xs">
                      Connecting verified buyers & sellers safely everyday
                    </span>
                  </div>

                  <button
                    onClick={() => setIsSafetyTipsOpen(true)}
                    className="text-emerald-400 font-bold hover:underline text-[11px] shrink-0 flex items-center gap-1"
                  >
                    <span>Safety Rules</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1 space-y-6 sm:space-y-8">
        {/* Promoted TOP ADS Section */}
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
              {filters.category === 'All' ? 'Trending Classifieds' : `${filters.category} Ads`}
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 font-semibold px-2.5 py-0.5 rounded-full">
              {filteredListings.length} items
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map View</span>
              </button>
            </div>

            <button
              onClick={() => setIsSavedAlertsOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-colors"
              title="Save search alert for current filters"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Saved Alerts</span>
            </button>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filter</span>
            </button>

            {(filters.category !== 'All' || filters.searchQuery || filters.condition !== 'All') && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-emerald-400 underline font-medium px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {viewMode === 'map' ? (
          <MapView listings={filteredListings} />
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto my-8 space-y-4">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">No ad listings found</h3>
            <p className="text-xs text-slate-400">
              We couldn't find any items matching your filter criteria. Try searching for something else or resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <SafetyTipsModal isOpen={isSafetyTipsOpen} onClose={() => setIsSafetyTipsOpen(false)} />
      <SavedAlertsModal isOpen={isSavedAlertsOpen} onClose={() => setIsSavedAlertsOpen(false)} />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 sm:py-8 px-4 text-slate-400 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Sealify Logo"
              className="w-7 h-7 object-contain rounded-lg"
            />
            <span className="font-bold text-slate-200">Sealify Classifieds</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button onClick={() => setIsSafetyTipsOpen(true)} className="hover:text-emerald-400 transition-colors">
              Safety Guidelines
            </button>
            <Link to="/faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </Link>
            <Link to="/help-center" className="hover:text-emerald-400 transition-colors">
              Help Center
            </Link>
            <Link to="/contact" className="hover:text-emerald-400 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
};

export default Index;