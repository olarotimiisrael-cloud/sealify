import React from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import ListingCard from '../components/ListingCard';
import { Bookmark } from 'lucide-react';

export default function SavedItems() {
  const { listings, savedListingIds } = useSealify();

  const savedListings = listings.filter((l) => savedListingIds.includes(l.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
            Saved Ads ({savedListings.length})
          </h1>
          <p className="text-xs text-slate-400">Your bookmarked items to review anytime</p>
        </div>

        {savedListings.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 my-6">
            <p className="text-slate-400 text-xs">No saved items yet. Click the bookmark icon on any ad to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}