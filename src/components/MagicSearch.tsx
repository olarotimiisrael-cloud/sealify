import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { 
  Search, 
  Sparkles, 
  X, 
  ArrowRight, 
  TrendingUp, 
  Command,
  Smartphone,
  Car,
  Home,
  Zap,
  Clock
} from 'lucide-react';

interface MagicSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MagicSearch: React.FC<MagicSearchProps> = ({ isOpen, onClose }) => {
  const { listings, recentlyViewedIds, t } = useSealify();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Filter listings based on query
  const results = query.trim() === '' 
    ? [] 
    : listings.filter(l => 
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.category.toLowerCase().includes(query.toLowerCase()) ||
        l.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);

  const recentlyViewed = listings.filter(l => recentlyViewedIds.includes(l.id)).slice(0, 3);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSelect = (id: string) => {
    navigate(`/listing/${id}`);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Search Tray */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-4 border-b border-slate-800 flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Search anything... (AI magic enabled)"
            className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-slate-500 font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-lg border border-slate-700 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Command className="w-3 h-3" />
              <span>ESC</span>
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
                    {recentlyViewed.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all text-left group"
                      >
                        <img src={item.images[0]} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-emerald-400 font-black">₦{item.price.toLocaleString()}</p>
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
                  {[
                    { icon: Smartphone, label: 'Electronics', color: 'text-purple-400' },
                    { icon: Car, label: 'Vehicles', color: 'text-blue-400' },
                    { icon: Home, label: 'Real Estate', color: 'text-teal-400' },
                    { icon: Zap, label: 'Services', color: 'text-amber-400' }
                  ].map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(cat.label)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-slate-300 transition-all"
                    >
                      <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>Magic Results</span>
                <span className="text-emerald-500">{results.length} items found</span>
              </div>
              {results.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-transparent rounded-2xl transition-all text-left group"
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
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">No magic matches found</p>
                <p className="text-xs text-slate-500">Try searching for generic terms like "phone" or "car"</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-500" />
            Instant Discovery Engine Powered by Sealify Logic
          </p>
        </div>
      </div>
    </div>
  );
};

export default MagicSearch;