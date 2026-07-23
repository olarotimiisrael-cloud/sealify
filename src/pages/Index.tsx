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
  const { siteSettings, listings, filters, setFilters, resetFilters, recentlyViewedIds, compareListingIds, announcements, recentDeals, t } = useSealify();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [isSavedAlertsOpen, setIsSavedAlertsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [dismissedBannerIds, setDismissedBannerIds] = useState<string[]>([]);

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

      <CategoryBar />
      <LiveActivityToast />

      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 py-6 sm:py-10 px-3 sm:px-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full self-center lg:self-start">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ogbomosoland, Oyo State & Across Nigeria</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {t('trusted_marketplace')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">{siteSettings.siteName}</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">{siteSettings.siteDescription}</p>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-inner"><Sparkles className="w-6 h-6" /></div>
                    <div><h3 className="text-lg font-black text-white leading-tight">{siteSettings.siteName} Hub</h3><p className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /><span>Verified & Safe</span></p></div>
                  </div>
                  <Link to="/post-ad" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg">{t('post_free_ad').toUpperCase()}</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-emerald-500/40 transition-colors"><div className="flex items-center justify-between text-emerald-400"><Zap className="w-4 h-4" /><span className="text-[9px] font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">100% Free</span></div><h4 className="font-extrabold text-xs text-white">Sell Fast</h4></div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-teal-500/40 transition-colors"><div className="flex items-center justify-between text-teal-400"><ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CCTV Safe</span></div><h4 className="font-extrabold text-xs text-white">Meetup Zones</h4></div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-amber-500/40 transition-colors"><div className="flex items-center justify-between text-amber-400"><MessageSquare className="w-4 h-4" /><span className="text-[9px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Direct</span></div><h4 className="font-extrabold text-xs text-white">Direct Contact</h4></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1 space-y-8 sm:space-y-12">
        <CategoryGrid />
        <NeighborhoodFilter />
        <FeaturedVendorsSection />

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20"><Lightbulb className="w-4 h-4" /></div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">{t('recommended_for_you')}</h3>
            <span className="text-[9px] font-black uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">{t('ai_matched')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {recommendedListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

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

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;