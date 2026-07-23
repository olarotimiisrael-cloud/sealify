import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import EditListingModal from '../components/EditListingModal';
import PromoteModal from '../components/PromoteModal';
import VerificationModal from '../components/VerificationModal';
import SoldConfirmationModal from '../components/SoldConfirmationModal';
import AdAnalyticsModal from '../components/AdAnalyticsModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { Listing } from '../types/sealify';
import { 
  Trash2, 
  CheckCircle, 
  PlusCircle, 
  Edit3, 
  Award, 
  BarChart2, 
  Crown,
  RefreshCw,
  Eye,
  Package,
  Sparkles,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'active' | 'sold' | 'featured';

const MyAds: React.FC = () => {
  const { user, listings, deleteListing, markAsSold, updateListing, promoteListing } = useSealify();
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [promotingListing, setPromotingListing] = useState<Listing | null>(null);
  const [analyticsListing, setAnalyticsListing] = useState<Listing | null>(null);
  const [soldPromptListing, setSoldPromptListing] = useState<Listing | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const myAds = listings.filter((l) => l.sellerId === user?.id);

  const filteredAds = myAds.filter((ad) => {
    if (statusFilter === 'active') return ad.status === 'active';
    if (statusFilter === 'sold') return ad.status === 'sold';
    if (statusFilter === 'featured') return ad.featured;
    return true;
  });

  const totalImpressions = myAds.reduce((acc, ad) => acc + (ad.viewsCount || 0), 0);
  const activeCount = myAds.filter((ad) => ad.status === 'active').length;
  const soldCount = myAds.filter((ad) => ad.status === 'sold').length;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBumpAd = (ad: Listing) => {
    updateListing(ad.id, { createdAt: 'Just now' });
    toast.success(`⚡ "${ad.title}" has been bumped to the top of category feeds!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <SEO 
        title="My Ads & Inventory — Sealify Nigeria"
        description="Manage your active listings, view performance analytics, apply for verified vendor badges, and bump ads on Sealify."
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        {/* Profile & Summary Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-4 text-center sm:text-left">
            <img 
              src={user?.avatarUrl} 
              alt={user?.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0" 
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
              }}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user?.fullName}</h1>
                {user?.verified ? (
                  <VerifiedBadge type={user.verificationType || 'individual'} showText />
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    Unverified Seller
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{user?.email} • {user?.phoneNumber}</p>
              <div className="flex items-center gap-4 text-xs pt-1 font-semibold text-slate-400 justify-center sm:justify-start">
                <span>Active Ads: <strong className="text-emerald-400">{activeCount}</strong></span>
                <span>Sold: <strong className="text-teal-400">{soldCount}</strong></span>
                <span>Views: <strong className="text-amber-400">{totalImpressions}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end w-full lg:w-auto">
            <button
              onClick={() => setIsVerificationOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Apply for Verification Badge</span>
            </button>

            <Link
              to="/post-ad"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Another Ad</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white">Your Classified Inventory ({myAds.length})</h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({myAds.length})
            </button>

            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'active' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({activeCount})
            </button>

            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'sold' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sold ({soldCount})
            </button>

            <button
              onClick={() => setStatusFilter('featured')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'featured' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Promoted ({myAds.filter((a) => a.featured).length})
            </button>
          </div>
        </div>

        {/* Ads List */}
        {filteredAds.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-8">
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No ads match your filter</h3>
            <p className="text-xs text-slate-400">
              {statusFilter === 'all'
                ? "You haven't posted any classified ads yet. Start selling today!"
                : `You currently have no ${statusFilter} listings.`}
            </p>
            <Link
              to="/post-ad"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ad Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all shadow-md"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="relative shrink-0">
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title} 
                      className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800" 
                    />
                    {ad.featured && (
                      <div className="absolute -top-1.5 -left-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-md shadow">
                        <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs">{ad.title}</h3>
                      {ad.featured && (
                        <span className="text-[9px] font-black bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>TOP AD</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-extrabold text-emerald-400">{formatNGN(ad.price)}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Eye className="w-3 h-3 text-slate-500" />
                        {ad.viewsCount} views
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {ad.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Posted {ad.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <button
                    onClick={() => setAnalyticsListing(ad)}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs transition-colors"
                    title="View Ad Analytics"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Stats</span>
                  </button>

                  {ad.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleBumpAd(ad)}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 transition-colors"
                        title="Move ad to top of search results"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Bump</span>
                      </button>

                      <button
                        onClick={() => setEditingListing(ad)}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setPromotingListing(ad)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-purple-900/40 transition-all"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Promote</span>
                      </button>

                      <button
                        onClick={() => setSoldPromptListing(ad)}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Sold</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteListing(ad.id)}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <EditListingModal
        isOpen={!!editingListing}
        onClose={() => setEditingListing(null)}
        listing={editingListing}
        onSave={updateListing}
      />

      <PromoteModal
        isOpen={!!promotingListing}
        onClose={() => setPromotingListing(null)}
        listing={promotingListing}
        onPromoteSuccess={(id, dur, plan) => promoteListing(id, dur, plan)}
      />

      <SoldConfirmationModal
        isOpen={!!soldPromptListing}
        onClose={() => setSoldPromptListing(null)}
        listingTitle={soldPromptListing?.title || ''}
        onConfirm={() => soldPromptListing && markAsSold(soldPromptListing.id)}
      />

      <AdAnalyticsModal
        isOpen={!!analyticsListing}
        onClose={() => setAnalyticsListing(null)}
        listing={analyticsListing}
      />

      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        sellerName={user?.fullName || 'Seller'}
      />

      <MobileNav />
    </div>
  );
};

export default MyAds;