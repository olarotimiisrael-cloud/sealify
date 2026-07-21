import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import CategoryBar from '../components/CategoryBar';
import ListingCard from '../components/ListingCard';
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
  TrendingUp, 
  History,
  LayoutGrid,
  Map,
  Bell
} from 'lucide-react';

const POPULAR_SEARCHES = ['Tesla', 'MacBook', 'Apartment', 'iPhone', 'Sofa', 'Plumbing'];

const Index: React.FC = () => {
  const { listings, filters, setFilters, resetFilters, recentlyViewedIds } = useSealify();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [isSavedAlertsOpen, setIsSavedAlertsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const recentlyViewedListings = listings.filter((l) => recentlyViewedIds.includes(l.id));

  // Filter listings based on current search & filters state
  const filteredListings = listings.filter((item) => {
    // Search Query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    // Category
    if (filters.category !== 'All' && item.category !== filters.category) {
      return false;
    }

    // Condition
    if (filters.condition !== 'All' && item.condition !== filters.condition) {
      return false;
    }

    // Location
    if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Price Range
    if (filters.minPrice !== null && item.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && item.price > filters.maxPrice) return false;

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    return 0; // default newest
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      <Navbar />
      <CategoryBar />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/60 py-8 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              <span>Fastest Local Classifieds in USA</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Buy & Sell Anything <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Safely & Instantly.
              </span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Sealify connects verified buyers and sellers nearby. Discover cars, phones, homes, and everyday items with guaranteed fraud protection.
            </p>

            {/* Popular Search Tag Chips */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Popular:</span>
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: tag }))}
                  className="text-[11px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-0.5 rounded-lg transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-white">100%</p>
                <p className="text-[11px] text-slate-400 font-medium">Verified Sellers</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-white">2.4k+</p>
                <p className="text-[11px] text-slate-400 font-medium">Active Ads</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        {/* Recently Viewed Strip */}
        {recentlyViewedListings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">Recently Viewed</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {recentlyViewedListings.map((listing) => (
                <div key={listing.id} className="scale-95">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {filters.category === 'All' ? 'Trending Classifieds' : `${filters.category} Ads`}
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 font-semibold px-2.5 py-0.5 rounded-full">
              {filteredListings.length} items
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Grid vs Map Mode Switcher */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-colors"
              title="Save search alert for current filters"
            >
              <Bell className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Saved Alerts</span>
            </button>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Filter & Sort</span>
            </button>

            {(filters.category !== 'All' || filters.searchQuery || filters.condition !== 'All') && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-emerald-400 underline font-medium px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid OR Map View */}
        {viewMode === 'map' ? (
          <MapView listings={filteredListings} />
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No ad listings found</h3>
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

      {/* Filter Drawer Component */}
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      {/* Safety Tips Modal */}
      <SafetyTipsModal isOpen={isSafetyTipsOpen} onClose={() => setIsSafetyTipsOpen(false)} />

      {/* Saved Alerts Modal */}
      <SavedAlertsModal isOpen={isSavedAlertsOpen} onClose={() => setIsSavedAlertsOpen(false)} />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-slate-400 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              S
            </div>
            <span className="font-bold text-slate-200">Sealify Classifieds</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsSafetyTipsOpen(true)} className="hover:text-emerald-400">
              Safety Guidelines
            </button>
            <a href="#" className="hover:text-emerald-400">Terms of Use</a>
            <a href="#" className="hover:text-emerald-400">Privacy Policy</a>
            <button onClick={() => setIsSafetyTipsOpen(true)} className="hover:text-emerald-400">
              Support & Help
            </button>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
};

export default Index;