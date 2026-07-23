import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import EditListingModal from '../components/EditListingModal';
import PromoteModal from '../components/PromoteModal';
import VerificationModal from '../components/VerificationModal';
import SoldConfirmationModal from '../components/SoldConfirmationModal';
import AdAnalyticsModal from '../components/AdAnalyticsModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { Listing } from '../types/sealify';
import { Trash2, CheckCircle, PlusCircle, Edit3, Award, BarChart2, Crown, Zap, Clock, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyAds: React.FC = () => {
  const { user, listings, deleteListing, markAsSold, updateListing, promoteListing } = useSealify();
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [promotingListing, setPromotingListing] = useState<Listing | null>(null);
  const [analyticsListing, setAnalyticsListing] = useState<Listing | null>(null);
  const [soldPromptListing, setSoldPromptListing] = useState<Listing | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const myAds = listings.filter((l) => l.sellerId === user?.id);

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysLeft = (endDate?: string): number | null => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -left-12 -top-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-5 text-center sm:text-left relative z-10">
            <div className="relative">
              <img src={user?.avatarUrl} className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl" />
              {user?.verified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-black text-white">{user?.fullName}</h1>
                {user?.verified ? (
                  <VerifiedBadge type={user.verificationType || 'individual'} showText />
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">{user?.email} • {user?.phoneNumber}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-emerald-400" /> {myAds.length} Total Ads</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Joined {user?.memberSince || '2023'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end relative z-10">
            {!user?.verified && (
              <button
                onClick={() => setIsVerificationOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-black rounded-xl text-xs border border-slate-700 shadow-lg"
              >
                <Award className="w-4 h-4" />
                <span>Get Verified</span>
              </button>
            )}

            <Link
              to="/post-ad"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-xl shadow-emerald-500/20 uppercase tracking-widest transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Ad</span>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Manage Classifieds</h2>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:block">
              Listing controls & insights
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {myAds.map((ad) => {
              const daysLeft = getDaysLeft(ad.promotionEndDate);
              return (
                <div
                  key={ad.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 hover:border-emerald-500/30 transition-colors shadow-xl group"
                >
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="relative shrink-0">
                      <img src={ad.images[0]} className="w-20 h-20 rounded-2xl object-cover border border-slate-800" />
                      {ad.featured && (
                        <div className="absolute -top-2 -left-2 bg-amber-500 text-slate-950 p-1 rounded-lg shadow-lg">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-white truncate">{ad.title}</h3>
                        {ad.status === 'sold' && (
                          <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase">SOLD</span>
                        )}
                      </div>
                      <p className="text-sm font-black text-emerald-400">{formatNGN(ad.price)}</p>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                          ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {ad.status}
                        </span>
                        {ad.featured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase border border-amber-500/20">
                            <Zap className="w-3 h-3 fill-current" /> Promoted ({daysLeft}d left)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <BarChart2 className="w-3 h-3" /> {ad.viewsCount} views
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setAnalyticsListing(ad)}
                      className="p-3 bg-slate-950 hover:bg-slate-800 text-teal-400 border border-slate-800 rounded-2xl transition-all"
                      title="Performance Insights"
                    >
                      <BarChart2 className="w-4.5 h-4.5" />
                    </button>

                    {ad.status === 'active' && (
                      <>
                        <button
                          onClick={() => setEditingListing(ad)}
                          className="p-3 bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 rounded-2xl transition-all"
                          title="Edit Ad"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>

                        {!ad.featured && (
                          <button
                            onClick={() => setPromotingListing(ad)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-orange-950/20"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>Boost Ad</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSoldPromptListing(ad)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-slate-700 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Sold</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Delete this ad permanently?')) deleteListing(ad.id);
                      }}
                      className="p-3 bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {myAds.length === 0 && (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[2.5rem] p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto opacity-40">
                  <Package className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-400">No Advertisements Yet</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Start selling in Ogbomoso today. Your first ad is completely free!</p>
                </div>
                <Link
                  to="/post-ad"
                  className="inline-block px-6 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest"
                >
                  Create My First Ad
                </Link>
              </div>
            )}
          </div>
        </div>
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