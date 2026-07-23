import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import Footer from '../components/Footer';
import ReviewModal from '../components/ReviewModal';
import AuthModal from '../components/AuthModal';
import SEO from '../components/SEO';
import { 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Eye, 
  MessageSquare, 
  Package, 
  Star, 
  Award, 
  ShieldCheck, 
  Phone,
  Plus,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, allUsers, isAuthenticated, user } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Verified Seller';
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? true;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Oyo State';
  const sellerPhone = sellerUser?.phoneNumber || sampleListing?.sellerPhone || '+234 800 000 0000';
  const memberSince = sellerUser?.memberSince || '2023';

  const [activeTab, setActiveTab] = useState<'listings' | 'overview' | 'reviews'>('listings');
  const [showPhone, setShowPhone] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev_1',
      reviewerName: 'Tunde Bakare',
      reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 5,
      comment: 'Very polite seller! Inspected the item at Ogbomoso Police HQ safe zone. Smooth transaction.',
      date: '3 days ago',
    },
    {
      id: 'rev_2',
      reviewerName: 'Chioma Nnadi',
      reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      rating: 5,
      comment: 'Item was exactly as described in the ad video. Highly recommended seller!',
      date: '1 week ago',
    },
  ]);

  const totalViews = sellerListings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);

  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to leave a review');
      setIsAuthModalOpen(true);
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleAddReview = (rating: number, comment: string) => {
    const newRev: ReviewItem = {
      id: 'rev_' + Date.now(),
      reviewerName: user?.fullName || 'Anonymous Buyer',
      reviewerAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      rating,
      comment,
      date: 'Just now',
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title={`${sellerName}'s Store & Listings — Sealify Nigeria`} 
        description={`Explore items and services offered by ${sellerName} in ${sellerLocation}. Verified vendor profile.`}
        image={sellerAvatar}
        url={window.location.href}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Profile Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={sellerAvatar}
                alt={sellerName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl font-black text-white tracking-tight">{sellerName}</h1>
                  {sellerVerified && (
                    <VerifiedBadge type={sellerVerificationType} showText />
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 justify-center sm:justify-start flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {sellerLocation}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPhone(!showPhone)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-2xl text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{showPhone ? sellerPhone : 'Contact Seller'}</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-t border-slate-800/80 pt-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                activeTab === 'listings'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Active Ads ({sellerListings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Trust & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Reviews ({reviews.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">All Classifieds by {sellerName}</h2>
            {sellerListings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
                No active listings from this vendor at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sellerListings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <TrustScore
              score={98}
              responseTime="< 2 hours"
              verified={sellerVerified}
              salesCount={sellerListings.length}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Published Items</p>
                <p className="text-3xl font-black text-white">{sellerListings.length}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Cumulative Views</p>
                <p className="text-3xl font-black text-emerald-400">{totalViews}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
                  <Star className="w-8 h-8 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{averageRating}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 5.0 Rating</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Based on {reviews.length} verified buyer reviews</p>
                </div>
              </div>

              <button
                onClick={handleOpenReviewModal}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.reviewerAvatar}
                        alt={rev.reviewerName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white">{rev.reviewerName}</h4>
                        <p className="text-[10px] text-slate-500">{rev.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        sellerName={sellerName}
        onAddReview={handleAddReview}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Footer />
      <MobileNav />
    </div>
  );
};

export default SellerProfile;