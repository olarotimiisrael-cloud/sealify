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
  ExternalLink,
  Share2,
  AlertCircle,
  Crown,
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
  const { listings, allUsers, user, sendMessage } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Verified Seller';
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? true;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Oyo State';
  const sellerPhone = sellerUser?.phoneNumber || sampleListing?.sellerPhone || '+234 800 000 0000';
  const memberSince = sellerUser?.memberSince || '2023';

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews' | 'listings'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [activeConv, setActiveConv] = useState<typeof listings[0] | null>(null);
  const [text, setText] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500"
            />
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {sellerName}
                {sellerVerified && <VerifiedBadge type={sellerVerificationType} showText />}
              </h1>
              <p className="text-slate-400 text-sm">{sellerLocation}</p>
              <p className="text-slate-500 text-xs">Member since {memberSince}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'overview' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'listings' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Listings ({sellerListings.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'reviews' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Analytics
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4">
              <TrustScore 
                score={98} 
                responseTime="< 2 hours" 
                verified={sellerVerified} 
                salesCount={sellerListings.length} 
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">Total Listings</p>
                  <p className="text-2xl font-bold text-white">{sellerListings.length}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">Total Views</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {sellerListings.reduce((acc, l) => acc + l.viewsCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sellerListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-8 text-slate-400">
              <p>No reviews yet</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-8 text-slate-400">
              <p>Analytics coming soon</p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default SellerProfile;