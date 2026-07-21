import React from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedAds: React.FC = () => {
  const { listings, savedListingIds } = useSealify();
  const savedListings = listings.filter((l) => savedListingIds.includes(l.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-black text-white">Saved Advertisements</h1>
          <span className="text-xs bg-slate-800 text-slate-400 font-semibold px-2.5 py-0.5 rounded-full">
            {savedListings.length}
          </span>
        </div>

        {savedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {savedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <Heart className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No saved ads yet</h3>
            <p className="text-xs text-slate-400">
              Bookmark items while browsing to keep track of prices and seller contact details.
            </p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Explore Classifieds
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedAds;