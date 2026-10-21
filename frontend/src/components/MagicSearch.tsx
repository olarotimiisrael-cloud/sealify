import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { Search, Sparkles, X, ArrowRight, TrendingUp, Command, Smartphone, Car, Home, Shield, MapPin, Tag, Zap, Clock, Shirt, Armchair, Wrench, Briefcase, History } from 'lucide-react';

interface MagicSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { name: 'Vehicles', icon: Car, color: 'text-blue-400' },
  { name: 'Electronics', icon: Smartphone, color: 'text-purple-600' },
  { name: 'Real Estate', icon: Home, color: 'text-teal-600' },
  { name: 'Fashion', icon: Shirt, color: 'text-pink-400' },
  { name: 'Home & Furniture', icon: Armchair, color: 'text-amber-600' },
  { name: 'Services', icon: Wrench, color: 'text-cyan-400' },
];

const TRENDING_SEARCHES = ['iPhone 13', 'Toyota Corolla', 'Hostel in Under G', 'Starlink Kit', 'Self Contain'];

export const MagicSearch: React.FC<MagicSearchProps> = ({ isOpen, onClose }) => {
  const { listings, setFilters, recentlyViewedIds } = useSealify();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('sealify_search_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const navigate = useNavigate();

  const recentlyViewed = listings.filter((l) => recentlyViewedIds.includes(l.id));

  const results = query.trim() === ''
    ? []
    : listings.filter(l =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.category.toLowerCase().includes(query.toLowerCase()) ||
        l.location.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);

  const handleSelect = (id: string) => {
    navigate(`/listing/${id}`);
    onClose();
    setQuery('');
  };

  const handleFullSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    // Save to history
    const newHistory = [searchTerm.trim(), ...searchHistory.filter(h => h !== searchTerm.trim())].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('sealify_search_history', JSON.stringify(newHistory));

    setFilters((prev) => ({
      ...prev,
      searchQuery: searchTerm.trim(),
    }));
    navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    onClose();
    setQuery('');
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('sealify_search_history');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFullSearch(query);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-white/60 backdrop-blur-md" onClick={onClose} />

      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-4 border-b border-slate-200 flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Search className="w-5 h-5 text-emerald-600" />
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Search ads, categories, or locations..."
            className="flex-1 bg-transparent border-none text-slate-900 text-lg focus:outline-none placeholder:text-slate-600 font-bold"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-[10px] font-black">
              <Command className="w-2.5 h-2.5" />
              <span className="text-slate-600">ESC</span>
            </div>
            <button onClick={onClose} className="p-2 text-slate-600 hover:text-slate-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
          {query.trim() === '' ? (
            <div className="p-4 space-y-6">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      <History className="w-3.5 h-3.5" />
                      <span>Recent Searches</span>
                    </div>
                    <button onClick={clearHistory} className="text-[10px] font-bold text-slate-600 hover:text-emerald-600">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => handleFullSearch(h)}
                        className="px-3 py-1.5 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-300 transition-all"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trending in Ogbomoso</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TRENDING_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleFullSearch(term)}
                      className="flex items-center gap-2 p-3 bg-white/40 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all text-left"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900">{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Browse Categories</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => handleFullSearch(cat.name)}
                      className="flex flex-col items-center justify-center p-4 bg-white/40 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all gap-2 group"
                    >
                      <cat.icon className={`w-5 h-5 ${cat.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-[10px] font-black text-slate-900 uppercase">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                <span>Instant Matches</span>
                <button onClick={() => handleFullSearch(query)} className="text-emerald-600 hover:underline">See all for "{query}"</button>
              </div>

              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-slate-200 rounded-2xl transition-all text-left group"
                >
                  <img src={item.images[0]} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-emerald-600 font-black">₦{item.price.toLocaleString()} • {item.location}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}

              <button
                onClick={() => handleFullSearch(query)}
                className="w-full py-3 mt-2 bg-slate-100 hover:bg-slate-200 text-emerald-600 font-black rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-200"
              >
                <span>Search Marketplace for "{query}"</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-xs text-slate-600">No instant results found. Try a broader search.</p>
              <button
                onClick={() => handleFullSearch(query)}
                className="px-6 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs"
              >
                Search all listings for "{query}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicSearch;

