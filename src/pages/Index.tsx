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
  MapPin
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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-black px-3 py-1 rounded-full">
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

              <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Trusted & Secure</p>
                    <p className="text-[10px] text-slate-400">Verified Vendors</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Fast Deals</p>
                    <p className="text-[10px] text-slate-400">Direct In-person</p>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-1 sm:gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Trending:</span>
                {POPULAR_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilters((prev) => ({ ...prev, searchQuery: tag }))}
                    className="text-[10px] sm:text-[11px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Banner */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl group bg-slate-900 aspect-video sm:aspect-[16/9] flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=1200&auto=format&fit=crop&q=80"
                  alt="Sealify - Nigeria's Trusted Local Marketplace"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none flex items-end p-3 sm:p-6">
                  <div className="backdrop-blur-md bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800/80 w-full">
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Proudly connecting buyers and sellers in Ogbomosoland, Oyo State & Nigeria</span>
                    </p>
                  </div>
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