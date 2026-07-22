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
import { Trash2, CheckCircle, PlusCircle, Edit3, Award, BarChart2, Crown } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img src={user?.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" />
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl font-extrabold text-white">{user?.fullName}</h1>
                {user?.verified ? (
                  <VerifiedBadge type={user.verificationType || 'individual'} showText />
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{user?.email} • {user?.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => setIsVerificationOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700"
            >
              <Award className="w-4 h-4" />
              <span>Apply for Verification</span>
            </button>

            <Link
              to="/post-ad"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Another Ad</span>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Your Classified Ads ({myAds.length})</h2>

          <div className="space-y-3">
            {myAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <img src={ad.images[0]} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{ad.title}</h3>
                      {ad.featured && (
                        <span className="text-[9px] font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow">
                          <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
                          <span>TOP AD</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-emerald-400">{formatNGN(ad.price)}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase mt-1 ${
                      ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    onClick={() => setAnalyticsListing(ad)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs"
                    title="View Ad Analytics"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Stats</span>
                  </button>

                  {ad.status === 'active' && (
                    <>
                      <button
                        onClick={() => setEditingListing(ad)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setPromotingListing(ad)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-purple-900/40"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Promote</span>
                      </button>

                      <button
                        onClick={() => setSoldPromptListing(ad)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-xl text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Sold</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteListing(ad.id)}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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