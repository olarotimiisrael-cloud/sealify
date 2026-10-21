import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Search, Filter, MapPin, Tag, Star, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { toast } from 'sonner';

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchFavorites, toggleFavorite, user } = useSealify();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetchFavorites();
      setFavorites(res?.favorites || res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Saved Listings — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Saved Listings</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            {favorites.length} items saved for later
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3"></div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading saved items...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">No saved listings yet</h3>
            <p className="text-slate-500 text-xs">
              Bookmark items you love by tapping the heart icon on any listing.
            </p>
            <Link to="/" className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((fav) => {
              const listing = fav.listing || fav;
              return (
                <div key={listing.id || fav.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-xl hover:border-emerald-500/50 h-full flex flex-col">
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden group">
                    <img
                      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(listing.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-white transition-all shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    {listing.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full">SOLD</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="text-sm sm:text-base md:text-lg font-black text-emerald-600 tracking-tight truncate">
                        ₦{Number(listing.price || 0).toLocaleString()}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                        {listing.category}
                      </span>
                    </div>
                    <Link to={`/listing/${listing.id}`} className="block">
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-emerald-600 transition-colors">
                        {listing.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{listing.location?.split(',')[0] || 'Nigeria'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

