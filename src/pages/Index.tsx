import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import CategoryGrid from '../components/CategoryGrid';
import CategoryBar from '../components/CategoryBar';
import NeighborhoodFilter from '../components/NeighborhoodFilter';
import ListingCard from '../components/ListingCard';
import PromotedSpotlightBanner from '../components/PromotedSpotlightBanner';
import FeaturedVendorsSection from '../components/FeaturedVendorsSection';
import MapView from '../components/MapView';
import LiveActivityToast from '../components/LiveActivityToast';
import FilterDrawer from '../components/FilterDrawer';
import CompareModal from '../components/CompareModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import SEO from '../components/SEO';
import { 
  Grid, 
  MapPin, 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  Bell, 
  Scale, 
  Layers, 
  Search,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { 
    listings, 
    filters, 
    setFilters, 
    resetFilters, 
    activeCategory, 
    announcements, 
    compareListingIds,
    t
  } = useSealify();

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Active System Banners
  const activeAnnouncements = announcements.filter((a) => a.active);

  // Filter listings based on current filters and category selection
  const filteredListings = listings.filter((item) => {
    // Category Filter
    if (activeCategory !== 'All' && item.category !== activeCategory) {
      return false;
    }
    if (filters.category !== 'All' && item.category !== filters.category) {
      return false;
    }

    // Search Query Filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchCategory = item.category.toLowerCase().includes(query);
      const matchLoc = item.location.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      if (!matchTitle && !matchCategory && !matchLoc && !matchDesc) {
        return false;
      }
    }

    // Location Filter
    if (filters.location) {
      if (!item.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Condition Filter
    if (filters.condition !== 'All' && item.condition !== filters.condition) {
      return false;
    }

    // Price Filters
    if (filters.minPrice !== null && item.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== null && item.price > filters.maxPrice) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    // 'newest' default
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const activeFiltersCount = 
    (filters.searchQuery ? 1 : 0) +
    (filters.category !== 'All' ? 1 : 0) +
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.condition !== 'All' ? 1 : 0) +
    (filters.location ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 md:pb-0 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO 
        title="Sealify — Nigeria's Trusted Local Marketplace"
        description="Buy, sell, and connect safely with verified sellers in Ogbomoso, Oyo State, and across Nigeria."
      />

      <Navbar />
      <CategoryBar />

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 flex-1 space-y-8">
        
        {/* Active System Announcements */}
        {activeAnnouncements.length > 0 && (
          <div className="space-y-2">
            {activeAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </span>
                  <div className="min-w-0">
                    <strong className="text-white font-black">{ann.title}: </strong>
                    <span className="text-slate-300 truncate">{ann.message}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hero & Top Advert Spotlight Banner */}
        <PromotedSpotlightBanner listings={listings} />

        {/* Category Grid Section */}
        <CategoryGrid />

        {/* Local Neighborhood Hub Filter */}
        <NeighborhoodFilter />

        {/* Verified Merchants Directory Teaser */}
        <FeaturedVendorsSection />

        {/* Feed Controls Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeCategory !== 'All' ? `${activeCategory} Classifieds` : 'Fresh Marketplace Listings'}
              </h2>
              <span className="text-xs bg-slate-900 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-slate-800 shadow">
                {sortedListings.length} ads
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified local items available for immediate pickup or delivery
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Compare Drawer Button */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="relative px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition-colors flex items-center gap-1.5"
              title="Compare Ads Side-by-Side"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Compare</span>
              {compareListingIds.length > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {compareListingIds.length}
                </span>
              )}
            </button>

            {/* Saved Alerts Modal Trigger */}
            <button
              onClick={() => setIsAlertsOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition-colors flex items-center gap-1.5"
              title="Saved Search Alerts"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Alerts</span>
            </button>

            {/* Filter Drawer Trigger */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                activeFiltersCount > 0
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-slate-950 text-emerald-400 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Interactive Map View"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills Bar if Active */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Active Filters:</span>
            
            {filters.searchQuery && (
              <span className="bg-slate-950 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 font-semibold">
                "{filters.searchQuery}"
              </span>
            )}

            {filters.location && (
              <span className="bg-slate-950 text-teal-400 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 font-semibold">
                <MapPin className="w-3 h-3" /> {filters.location}
              </span>
            )}

            {filters.condition !== 'All' && (
              <span className="bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold">
                Condition: {filters.condition}
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-emerald-400 hover:underline font-bold text-xs ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Main Feed Content */}
        {viewMode === 'map' ? (
          <MapView listings={sortedListings} />
        ) : sortedListings.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xl">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No ads match your search criteria</h3>
            <p className="text-xs text-slate-400">
              Try removing filters, searching for alternative keywords, or posting an item request to the community.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Reset Search
              </button>
              <Link
                to="/requests"
                className="px-4 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow hover:bg-emerald-400 transition-colors"
              >
                Post Item Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {sortedListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />

      {/* Realtime Social Activity Toast */}
      <LiveActivityToast />

      {/* Utility Modals */}
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
      <SavedAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    </div>
  );
}