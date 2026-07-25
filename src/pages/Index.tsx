import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import FilterDrawer from '../components/FilterDrawer';
import CompareModal from '../components/CompareModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import SEO from '../components/SEO';
import { 
  Grid, 
  MapPin, 
  SlidersHorizontal, 
  Sparkles, 
  Bell, 
  Scale,
  Zap,
  CheckCircle2,
  Package,
  RotateCcw,
  History,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function Index() {
  const [searchParams] = useSearchParams();
  const { 
    listings, 
    filters, 
    setFilters,
    activeCategory, 
    announcements, 
    compareListingIds,
    recentDeals,
    resetFilters,
    recentlyViewedIds,
    userInterests,
    t
  } = useSealify();

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Sync URL search parameters with filter state
  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    const locParam = searchParams.get('location');

    if (qParam || catParam || locParam) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: qParam || prev.searchQuery,
        category: (catParam as any) || prev.category,
        location: locParam || prev.location,
      }));
    }
  }, [searchParams, setFilters]);

  const activeAnnouncements = announcements.filter((a) => a.active);

  const filteredListings = listings.filter((item) => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (filters.category !== 'All' && item.category !== filters.category) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice !== null && item.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && item.price > filters.maxPrice) return false;
    return true;
  });

  const recentlyViewed = listings.filter(l => recentlyViewedIds.includes(l.id));

  // AI Recommendation Logic: Sort by interest category first, then featured
  const recommendedListings = useMemo(() => {
    if (Object.keys(userInterests).length === 0) return [];
    
    // Sort categories by interest count
    const sortedInterests = Object.entries(userInterests)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => cat);

    return listings
      .filter(l => l.status === 'active' && !recentlyViewedIds.includes(l.id))
      .sort((a, b) => {
        const aIndex = sortedInterests.indexOf(a.category);
        const bIndex = sortedInterests.indexOf(b.category);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      })
      .slice(0, 4);
  }, [listings, userInterests, recentlyViewedIds]);

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasActiveFilters = filters.searchQuery || filters.category !== 'All' || filters.location || filters.minPrice !== null || filters.maxPrice !== null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 md:pb-0 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO 
        title="Sealify — Nigeria's Trusted Local Marketplace"
        description="Buy, sell, and connect safely with verified sellers in Ogbomoso, Oyo State, and across Nigeria."
      />

      <Navbar />
      <CategoryBar />

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 flex-1 space-y-8 overflow-x-hidden">
        
        {activeAnnouncements.length > 0 && (
          <div className="space-y-2">
            {activeAnnouncements.map((ann) => (
              <div key={ann.id} className="p-3.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs shadow-lg animate-in fade-in">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0"><Sparkles className="w-4 h-4 animate-pulse" /></span>
                <p className="min-w-0 truncate"><strong className="text-white font-black">{ann.title}: </strong>{ann.message}</p>
              </div>
            ))}
          </div>
        )}

        <PromotedSpotlightBanner listings={listings} />

        {/* Recent Market Activity Ticker */}
        {recentDeals.length > 0 && (activeCategory === 'All') && (
          <section className="bg-slate-900/40 border-y border-slate-800/50 py-3 -mx-4 sm:-mx-8 overflow-hidden">
            <div className="flex items-center gap-4 px-4 whitespace-nowrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase shrink-0">
                <Zap className="w-3 h-3 fill-current" />
                <span>Recent Deals</span>
              </div>
              <div className="flex items-center gap-8 animate-marquee">
                {recentDeals.concat(recentDeals).map((deal, idx) => (
                  <div key={`${deal.id}-${idx}`} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-400">Sold:</span>
                    <span className="font-bold text-white">{deal.itemTitle}</span>
                    <span className="text-emerald-400 font-black">{formatNGN(deal.price)}</span>
                    <span className="text-slate-500 text-[10px]">{deal.location}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* AI Recommendations Section */}
        {recommendedListings.length > 0 && activeCategory === 'All' && !hasActiveFilters && (
          <section className="bg-slate-900/50 border border-slate-800/50 p-6 rounded-[2.5rem] space-y-4 animate-in fade-in slide-in-from-right-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{t('recommended_for_you')}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('ai_matched')}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedListings.map(item => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && activeCategory === 'All' && !hasActiveFilters && (
          <section className="space-y-4 animate-in fade-in slide-in-from-left-4">
             <div className="flex items-center gap-2 px-1">
                <History className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-black text-white">Recently Viewed</h2>
             </div>
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {recentlyViewed.map(item => (
                  <div key={item.id} className="min-w-[200px] w-48 shrink-0">
                     <ListingCard listing={item} />
                  </div>
                ))}
             </div>
          </section>
        )}

        <CategoryGrid />
        <NeighborhoodFilter />
        <FeaturedVendorsSection />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t('marketplace_feed')}</h2>
              <span className="text-[10px] bg-slate-900 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-slate-800 shadow">
                {sortedListings.length} ads
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/20 flex items-center gap-1 transition-colors"
                >
                  <circle cx="5" cy="5" r="4" /><RotateCcw className="w-3 h-3" /> Clear Search
                </button>
              )}
            </div>
            {filters.searchQuery && (
              <p className="text-xs text-slate-400 mt-1">
                Showing results for "<strong className="text-emerald-400">{filters.searchQuery}</strong>"
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setIsAlertsOpen(true)} className="px-3 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>{t('search_alerts')}</span>
            </button>
            <button onClick={() => setIsCompareOpen(true)} className="px-3 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>{t('compare')} ({compareListingIds.length})</span>
            </button>
            <button onClick={() => setIsFilterOpen(true)} className="px-3 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>{t('filters')}</span>
            </button>
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-lg ${viewMode === 'map' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}><MapPin className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {viewMode === 'map' ? (
          <MapView listings={sortedListings} />
        ) : sortedListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {sortedListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs my-6 space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto border border-slate-800">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No ads found matching your criteria</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Try clearing your search keyword, category, or location filters to view all listings.</p>
            </div>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors shadow-lg"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
      <SavedAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    </div>
  );
}