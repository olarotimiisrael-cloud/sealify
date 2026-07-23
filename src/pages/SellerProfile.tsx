import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ReviewModal from '../components/ReviewModal';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import { 
  MapPin, 
  Calendar, 
  Phone, 
  ArrowLeft, 
  Package, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MessageSquare, 
  Heart,
  Award, 
  ShieldCheck, 
  Zap, 
  Scale,
  Smartphone,
  Eye,
  ShieldAlert,
  ExternalLink,
  Share2,
  Calendar,
  AlertCircle,
  Crown,
  ExternalLink,
  Share2,
  Download,
  Settings,
  Bell,
  Activity,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Filter,
  Grid,
  List
} from 'lucide-react';

const POPULAR_SEARCHES = ['Tesla', 'MacBook', 'Apartment', 'iPhone', 'Sofa', 'Plumbing', 'Real Estate', 'Vehicles'];

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, allUsers, user } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Verified Seller';
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? true;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Nigeria';
  const sellerPhone = sellerUser?.phoneNumber || sampleListing?.sellerPhone || '+234 800 000 0000';
  const memberSince = sellerUser?.memberSince || '2023';

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews' | 'listings'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsMagicSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, text);
    setText('');
  };

  const handleQuickReply = (reply: string) => {
    if (!activeConv) return;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, reply);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200" 
        onClick={onClose}
      />

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
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
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-500 uppercase tracking-widest">
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
                          <p className="text-[10px] text-emerald-400 font-bold">₦{item.price.toLocaleString()}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() === '' ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">No magic matches found</p>
                    <p className="text-xs text-slate-500">Try searching for generic terms like "phone" or "car"</p>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="p-2 space-y-1">
                  <div className="px-3 pb-2 text-[10px] font-black text-slate-500 flex items-center justify-between">
                    <span>Magic Results</span>
                    <span className="text-emerald-500">{results.length} items found</span>
                  </div>
                  {results.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-emerald-500/5 border border-slate-800 transition-all text-left group"
                    >
                      <div className="relative shrink-0">
                        <img src={item.images[0]} className="w-14 h-14 rounded-xl object-cover border border-slate-800" />
                        {item.featured && (
                          <div className="absolute -top-1 -left-1 bg-amber-500 p-0.5 rounded-md">
                            <Zap className="w-2.5 h-2.5 text-slate-950 fill-current" />
                          </div>
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