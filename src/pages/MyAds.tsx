import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import EditListingModal from '../components/EditListingModal';
import { Listing } from '../types/sealify';
import { Trash2, CheckCircle, PlusCircle, ShieldCheck, Zap, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const MyAds: React.FC = () => {
  const { user, listings, deleteListing, markAsSold, updateListing } = useSealify();
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const myAds = listings.filter((l) => l.sellerId === user?.id);

  const handlePromoteAd = (title: string) => {
    toast.success(`"TOP AD" status activated for ${title}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        {/* User profile snippet */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img src={user?.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500" />
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl font-extrabold text-white">{user?.fullName}</h1>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">{user?.email} • {user?.phoneNumber}</p>
            </div>
          </div>

          <Link
            to="/post-ad"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Another Ad</span>
          </Link>
        </div>

        {/* Listings List */}
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
                    <h3 className="font-bold text-sm text-white">{ad.title}</h3>
                    <p className="text-xs font-semibold text-emerald-400">${ad.price}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase mt-1 ${
                      ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-2 sm:pt-0 border-slate-800">
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
                        onClick={() => handlePromoteAd(ad.title)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold rounded-xl text-xs"
                        title="Promote Ad to TOP AD"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Promote</span>
                      </button>

                      <button
                        onClick={() => markAsSold(ad.id)}
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
                    title="Delete Ad"
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
      <MobileNav />
    </div>
  );
};

export default MyAds;