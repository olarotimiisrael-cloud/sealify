import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import Footer from '../components/Footer';
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
  Phone
} from 'lucide-react';

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, allUsers, sendMessage, user } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Verified Seller';
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? true;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Oyo State';
  const sellerPhone = sellerUser?.phoneNumber || sampleListing?.sellerPhone || '+234 800 000 0000';
  const memberSince = sellerUser?.memberSince || '2023';

  const [activeTab, setActiveTab] = useState<'listings' | 'overview' | 'reviews'>('listings');
  const [showPhone, setShowPhone] = useState(false);

  const totalViews = sellerListings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
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
              <span>Reviews</span>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <h3 className="font-bold text-base text-white">Verified Buyer Feedback</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              This seller maintains an impressive 98% overall trust score with quick response time.
            </p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default SellerProfile;