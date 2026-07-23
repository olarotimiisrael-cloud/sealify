import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ReviewModal from '../components/ReviewModal';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import { 
  MapPin, Calendar, Phone, ArrowLeft, Package, Star, MessageSquare, 
  ShieldCheck, Share2, Award, ExternalLink, Activity, Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, allUsers, reviews, addReview, user, isAuthenticated } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sellerReviews = reviews.filter((r) => r.sellerId === id);
  
  const sampleListing = sellerListings[0] || listings[0];
  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Marketplace Seller';
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? false;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Nigeria';
  const memberSince = sellerUser?.memberSince || '2023';

  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'analytics'>('listings');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Mock analytics data for the seller
  const viewStats = [
    { day: 'Mon', views: 45 },
    { day: 'Tue', views: 52 },
    { day: 'Wed', views: 38 },
    { day: 'Thu', views: 65 },
    { day: 'Fri', views: 48 },
    { day: 'Sat', views: 72 },
    { day: 'Sun', views: 59 },
  ];

  const avgRating = sellerReviews.length > 0 
    ? (sellerReviews.reduce((acc, r) => acc + r.rating, 0) / sellerReviews.length).toFixed(1)
    : '0.0';

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${sellerName} on Sealify`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
          <button onClick={handleShareProfile} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="relative">
              <img src={sellerAvatar} alt={sellerName} className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-950 shadow-xl" />
              {sellerVerified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl border-4 border-slate-900">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{sellerName}</h1>
                  {sellerVerified && <VerifiedBadge type={sellerVerificationType} showText />}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest pt-1">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {sellerLocation}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> Joined {memberSince}</span>
                  <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {avgRating} ({sellerReviews.length} reviews)</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all">
                  <Phone className="w-4 h-4" />
                  <span>Call Seller</span>
                </button>
                <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            <div className="w-full md:w-64 space-y-3">
              <TrustScore score={95} responseTime="< 1hr" verified={sellerVerified} salesCount={sellerListings.length + 5} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              ACTIVE ADS ({sellerListings.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'reviews' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              REVIEWS ({sellerReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              INSIGHTS
            </button>
          </div>

          {/* Active Listings Grid */}
          {activeTab === 'listings' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {sellerListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
              {sellerListings.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-800 mx-auto" />
                  <p className="text-slate-500 font-bold">No active listings from this seller.</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews List */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Customer Reviews</h3>
                {isAuthenticated && user?.id !== id && (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 text-emerald-400 font-black rounded-xl text-xs hover:bg-slate-800 transition-colors"
                  >
                    Rate Experience
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellerReviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={rev.reviewerAvatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="text-sm font-bold text-white">{rev.reviewerName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{rev.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-black">{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                ))}
                {sellerReviews.length === 0 && (
                  <div className="col-span-full py-12 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No reviews yet. Be the first to rate!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Listing Views Trend</h3>
                    <p className="text-[10px] text-slate-500 font-bold">Total profile & ad reach past 7 days</p>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewStats}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff'}} />
                      <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300 font-bold uppercase">Conversion Rate</span>
                      <span className="text-emerald-400 font-black text-sm">8.4%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[42%]"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-300 font-bold uppercase">Response Rate</span>
                      <span className="text-blue-400 font-black text-sm">98%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[98%]"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Award className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider">Top Rated Seller</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    This seller consistently provides high quality items and fast responses. Verified member of Sealify Ogbomoso.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        sellerName={sellerName}
        onAddReview={(rating, comment) => addReview(id!, rating, comment)}
      />

      <MobileNav />
    </div>
  );
};

export default SellerProfile;