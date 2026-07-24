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
import ShareQrModal from '../components/ShareQrModal';
import SEO from '../components/SEO';
import { 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Eye, 
  MessageSquare, 
  MessageCircle,
  Package, 
  Star, 
  Award, 
  ShieldCheck, 
  Phone,
  Plus,
  UserCheck,
  Bell,
  Check,
  Share2,
  Clock,
  Truck,
  CreditCard,
  Building2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, allUsers, isAuthenticated, user, reviews, addReview } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Verified Seller';
  const businessName = sellerUser?.businessName || (sampleListing?.title ? `${sellerName}'s Store` : 'Local Merchant');
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  const sellerBanner = sellerUser?.storeBannerUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? true;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Oyo State';
  const sellerPhone = sellerUser?.phoneNumber || sampleListing?.sellerPhone || '+234 813 120 8468';
  const memberSince = sellerUser?.memberSince || '2023';

  const [activeTab, setActiveTab] = useState<'listings' | 'overview' | 'reviews'>('listings');
  const [showPhone, setShowPhone] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const sellerReviews = reviews.filter(r => r.sellerId === id);

  const totalViews = sellerListings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow storefronts');
      setIsAuthOpen(true);
      return;
    }
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    if (nextState) {
      toast.success(`You are now following ${sellerName}! You will receive alerts when new ads are posted.`);
    } else {
      toast.info(`Unfollowed ${sellerName}`);
    }
  };

  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to leave a review');
      setIsAuthOpen(true);
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleAddReviewToContext = (rating: number, comment: string) => {
    if (!user) return;
    addReview({
      sellerId: id || '',
      buyerId: user.id,
      buyerName: user.fullName,
      buyerAvatar: user.avatarUrl,
      rating,
      comment
    });
  };

  const averageRating = sellerReviews.length > 0
    ? (sellerReviews.reduce((acc, r) => acc + r.rating, 0) / sellerReviews.length).toFixed(1)
    : '5.0';

  const cleanPhone = sellerPhone.replace(/[^0-9]/g, '');
  const formattedWhatsappPhone = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedWhatsappPhone}?text=${encodeURIComponent(
    `Hello ${sellerName}, I am messaging you from your Sealify Vendor Storefront. I would like to inquire about your available inventory.`
  )}`;

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

        {/* Profile Banner & Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="h-44 sm:h-56 w-full bg-slate-950 relative overflow-hidden">
            <img
              src={sellerBanner}
              alt="Storefront Cover"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          </div>

          <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <img
                src={sellerAvatar}
                alt={sellerName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-950"
              />
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{sellerName}</h1>
                  {sellerVerified && (
                    <VerifiedBadge type={sellerVerificationType} showText />
                  )}
                </div>

                {sellerUser?.businessName && (
                  <p className="text-xs font-extrabold text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{sellerUser.businessName}</span>
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-400 justify-center sm:justify-start flex-wrap pt-0.5">
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

            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow ${
                  isFollowing
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isFollowing ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                <span>{isFollowing ? 'Following Store' : 'Follow Vendor'}</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition-colors"
                title="Share Storefront Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowPhone(!showPhone)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-2xl text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{showPhone ? sellerPhone : 'Show Phone'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-800/80 p-4 bg-slate-950/60 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                activeTab === 'listings'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
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
                  : 'bg-slate-900 text-slate-400 hover:text-white'
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
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Reviews ({sellerReviews.length})</span>
            </button>
          </div>
        </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Published Items</p>
                <p className="text-3xl font-black text-white">{sellerListings.length}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Cumulative Views</p>
                <p className="text-3xl font-black text-emerald-400">{totalViews}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Average Buyer Rating</p>
                <p className="text-3xl font-black text-amber-400 flex items-center gap-1">
                  <span>{averageRating}</span>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Storefront Operations & Safe Exchange Info</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <p className="font-bold text-white uppercase text-[10px] text-slate-400">Business Operating Hours</p>
                  <p>Mon - Sat: 8:00 AM - 7:00 PM</p>
                  <p>Sun: Closed / Appointments Only</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <p className="font-bold text-white uppercase text-[10px] text-slate-400">Preferred Handover Zone</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Ogbomoso Police HQ Safe Zone or LAUTECH Gate</p>
                </div>
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
                  <p className="text-xs text-slate-400 mt-0.5">Based on {sellerReviews.length} verified buyer reviews</p>
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
              {sellerReviews.length === 0 ? (
                 <div className="py-12 text-center text-slate-500 italic text-xs">No reviews for this vendor yet. Be the first to rate!</div>
              ) : (
                sellerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.buyerAvatar}
                          alt={rev.buyerName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-white">{rev.buyerName}</h4>
                          <p className="text-[10px] text-slate-500">{rev.createdAt}</p>
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
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        sellerName={sellerName}
        onAddReview={handleAddReviewToContext}
      />

      <ShareQrModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listingTitle={`${sellerName}'s Storefront`}
        listingPrice={0}
        listingUrl={window.location.href}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <Footer />
      <MobileNav />
    </div>
  );
};

export default SellerProfile;