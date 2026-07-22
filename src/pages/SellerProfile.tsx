import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ReviewModal from '../components/ReviewModal';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { MapPin, Calendar, Phone, ArrowLeft, Package, Star } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, allUsers } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Verified Seller';
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? true;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Nigeria';
  const sellerPhone = sellerUser?.phoneNumber || sampleListing?.sellerPhone || '+234 800 000 0000';

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev_1',
      author: 'Michael B.',
      rating: 5,
      comment: 'Very reliable seller. Product was clean and arrived quickly!',
      date: '1 week ago',
    },
  ]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const handleAddReview = (rating: number, comment: string) => {
    const newRev: ReviewItem = {
      id: 'rev_' + Date.now(),
      author: 'You (Verified Buyer)',
      rating,
      comment,
      date: 'Just now',
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

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

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-2xl font-black text-white">{sellerName}</h1>
                {sellerVerified && (
                  <VerifiedBadge type={sellerVerificationType} showText />
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold text-emerald-400">
                  {sellerVerificationType === 'business' ? 'Verified Business Vendor' : 'Verified Marketplace Seller'}
                </span>
                <span className="text-slate-600">•</span>
                <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{avgRating} ({reviews.length} reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {sellerLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Member since {sellerUser?.memberSince || '2023'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsReviewOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Star className="w-4 h-4 fill-emerald-400" />
              <span>Leave Vendor Review</span>
            </button>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center md:text-right">
              <p className="text-[10px] text-slate-400 font-medium uppercase">Direct Contact</p>
              <p className="text-xs font-extrabold text-white mt-0.5 flex items-center justify-center md:justify-end gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{sellerPhone}</span>
              </p>
            </div>
          </div>
        </div>

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

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Buyer Feedback & Reviews ({reviews.length})</h3>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">{rev.author}</span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300">{rev.comment}</p>
                <span className="text-[10px] text-slate-500 block">{rev.date}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        sellerName={sellerName}
        onAddReview={handleAddReview}
      />
      <MobileNav />
    </div>
  );
};

export default SellerProfile;