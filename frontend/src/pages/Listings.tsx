import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { useListing, useListings } from '../lib/api-client';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import CategoryBar from '../components/CategoryBar';
import { Search, Filter, MapPin, Tag, Star, Clock } from 'lucide-react';

export default function Listings() {
  const { t, activeCategory, setActiveCategory, toggleSaveListing, isSaved } = useSealify();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');

  const { data, isLoading, refetch } = useListings({
    category: activeCategory,
    query,
    location,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    condition: condition || undefined,
  });

  const listings = data?.listings || [];
  const totalCount = data?.meta?.total || 0;

  const handleSearch = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Listings — Sealify Nigeria" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₦"
                className="w-full px-3 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₦"
                className="w-full px-3 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSearch}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Search className="w-3 h-3" />
              <span>Search Listings</span>
            </button>
            <button
              onClick={() => {
                setQuery('');
                setLocation('');
                setMinPrice('');
                setMaxPrice('');
                setCondition('');
                refetch();
              }}
              className="px-3 py-2.5 text-slate-600 hover:text-emerald-600 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-colors"
            >
              <Filter className="w-3 h-3" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-900">{totalCount} {t('found_listings')}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sort by:</span>
            <select className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3"></div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">No listings found</h3>
            <p className="text-slate-500 text-xs mb-6 max-w-sm">
              Try adjusting your search criteria or browse different categories.
            </p>
            <Link to="/" className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm">
              <Clock className="w-3 h-3 mr-2" />
              Browse All Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group relative block h-full"
              >
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-xl hover:border-emerald-500/50">
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    {listing.isBoosted && (
                      <span className="bg-amber-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Star className="w-2 h-2 fill-current" /> TOP AD
                      </span>
                    )}
                  </div>
                  
                  {/* Image */}
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

                  <div className="px-3 sm:px-4 py-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[9px] font-semibold text-slate-600">{listing.condition || 'Good'}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSaveListing(listing.id);
                      }}
                      className={`p-1.5 rounded-full transition-all ${
                        isSaved(listing.id) ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isSaved(listing.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}

