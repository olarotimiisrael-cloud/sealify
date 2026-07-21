import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import MobileNav from '../components/MobileNav';
import { ShieldCheck, MapPin, Calendar, Phone, ArrowLeft, Package } from 'lucide-react';

export const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings } = useSealify();

  // Find seller listings matching this seller ID or fallback to first seller
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sampleListing?.sellerName || 'Verified Seller';
  const sellerAvatar = sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const sellerVerified = sampleListing?.sellerVerified ?? true;
  const sellerLocation = sampleListing?.location || 'New York, NY';
  const sellerPhone = sampleListing?.sellerPhone || '+1 (555) 234-5678';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Vendor Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-black text-white">{sellerName}</h1>
                {sellerVerified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" title="Verified Vendor" />
                )}
              </div>
              <p className="text-xs font-semibold text-emerald-400">Verified Marketplace Seller</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {sellerLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Member since 2023
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center md:text-right shrink-0 w-full md:w-auto">
            <p className="text-xs text-slate-400 font-medium">Direct Phone Contact</p>
            <p className="text-sm font-extrabold text-white mt-0.5 flex items-center justify-center md:justify-end gap-1.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{sellerPhone}</span>
            </p>
          </div>
        </div>

        {/* Listings by this seller */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Ads by {sellerName} ({sellerListings.length})
            </h2>
          </div>

          {sellerListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {sellerListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
              This seller currently has no other active listings.
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default SellerProfile;