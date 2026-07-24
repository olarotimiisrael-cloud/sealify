import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { Search, Sparkles, X, ArrowRight, TrendingUp, Command, Smartphone, Car, Home, Shield, MapPin, Tag, Zap, Clock, Shirt, Armchair, Wrench, Briefcase } from 'lucide-react';

interface MagicSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { name: 'Vehicles', icon: Car, color: 'text-blue-400' },
  { name: 'Electronics', icon: Smartphone, color: 'text-purple-400' },
  { name: 'Real Estate', icon: Home, color: 'text-teal-400' },
  { name: 'Fashion', icon: Shirt, color: 'text-pink-400' },
  { name: 'Home & Furniture', icon: Armchair, color: 'text-amber-400' },
  { name: 'Services', icon: Wrench, color: 'text-cyan-400' },
  { name: 'Jobs', icon: Briefcase, color: 'text-indigo-400' },
  { name: 'Beauty & Health', icon: Sparkles, color: 'text-rose-400' },
  { name: 'Utility & Energy', icon: Zap, color: 'text-yellow-400' },
];

export const MagicSearch: React.FC<MagicSearchProps> = ({ isOpen, onClose }) => {
  const { listings, setFilters, recentlyViewedIds } = useSealify();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const recentlyViewed = listings.filter((l) => recentlyViewedIds.includes(l.id));

  const results = query.trim() === ''
    ? []
    : listings.filter(l =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.category.toLowerCase().includes(query.toLowerCase()) ||
        l.location.toLowerCase().includes(query.toLowerCase()) ||
        l.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);

  const handleSelect = (id: string) => {
    navigate(`/listing/${id}`);
    onClose();
    setQuery('');
  };

  const handleFullSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setFilters((prev) => ({
      ...prev,
      searchQuery: searchTerm.trim(),
    }));
    navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    onClose();
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFullSearch(query);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Search Tray */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 font-sans">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-4 border-b border-slate-800 flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Search anything... (Press Enter to search all)"
            className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-slate-500 font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2">
            {query.trim() && (
              <button
                onClick={() => handleFullSearch(query)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow transition-all flex items-center gap-1"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md border border-slate-700 text-[10px] font-black transition-colors">
              <Command className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">ESC</span>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
          {query.trim() === '' ? (
            <div className="p-4 space-y-6">
              {/* Recently Viewed */}
              {recentlyViewed.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Jump Back In</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {recentlyViewed.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all text-left group"
                      >
                        <img src={item.images[0]} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-emerald-400 font-bold">₦{item.price.toLocaleString()}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Categories */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trending Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => handleFullSearch(cat.name)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-slate-300 transition-all"
                    >
                      <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                <span>Magic Matches</span>
                <button
                  onClick={() => handleFullSearch(query)}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  View all results for "{query}" →
                </button>
              </div>

              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-slate-800 rounded-2xl transition-all text-left group"
                >
                  <div className="relative shrink-0">
                    <img src={item.images[0]} className="w-14 h-14 rounded-xl object-cover border border-slate-800" />
                    {item.featured && (
                      <div className="absolute -top-1 -left-1 bg-amber-500 p-0.5 rounded-md">
                        <Zap className="w-2.5 h-2.5 text-slate-950 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500">{item.location}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate mt-1 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm font-black text-white mt-0.5">₦{item.price.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}

              <button
                onClick={() => handleFullSearch(query)}
                className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-black rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <span>Search Marketplace for "{query}"</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">No exact matches for "{query}"</p>
                <p className="text-xs text-slate-500">Try searching for broader terms like "phone" or "car"</p>
              </div>
              <button
                onClick={() => handleFullSearch(query)}
                className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg"
              >
                Search all listings for "{query}"
              </button>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            Instant Discovery Engine Powered by Sealify Logic
          </p>
        </div>
      </div>
    </div>
  );
};

export default MagicSearch;