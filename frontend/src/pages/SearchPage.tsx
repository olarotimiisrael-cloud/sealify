import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Search, Filter, Clock, Star, MapPin, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const { searchListings } = useSealify();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const res = await searchListings({ q: query });
      setResults(res?.listings || res || []);
      setTotal(res?.meta?.total || res?.total || (res?.listings?.length || 0));
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Search — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anything in Ogbomosoland..."
                className="w-full pl-10 pr-10 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {query.trim() && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-emerald-600" />
                <h2 className="text-xl font-black text-slate-900">
                  {total} results for "{query}"
                </h2>
              </div>
              <button
                onClick={() => navigate('/listings')}
                className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-widest"
              >
                Clear Filters
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3"></div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500 text-xs mb-6">
                  Try adjusting your search terms or browse categories.
                </p>
                <Link to="/listings" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                  Browse All Listings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {results.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`} className="group block">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-xl hover:border-emerald-500/50 h-full flex flex-col">
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {listing.status === 'sold' && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full">SOLD</span>
                          </div>
                        )}
                        {listing.is_boosted && (
                          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                            <Star className="w-2 h-2 fill-current" /> TOP AD
                          </span>
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
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-emerald-600 transition-colors">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{listing.location?.split(',')[0] || 'Nigeria'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

