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
  Bell, 
  Scale,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function Index() {
  const { 
    listings, 
    filters, 
    activeCategory, 
    announcements, 
    compareListingIds,
    recentDeals,
    t
  } = useSealify();

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const activeAnnouncements = announcements.filter((a) => a.active);

  const filteredListings = listings.filter((item) => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (filters.category !== 'All' && item.category !== filters.category) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      if (!matchTitle) return false;
    }
    if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice !== null && item.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && item.price > filters.maxPrice) return false;
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

        <CategoryGrid />
        <NeighborhoodFilter />
        <FeaturedVendorsSection />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t('marketplace_feed')}</h2>
              <span className="text-[10px] bg-slate-900 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-slate-800 shadow">{sortedListings.length} ads</span>
            </div>
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {sortedListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
      <LiveActivityToast />
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
      <SavedAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    </div>
  );
}