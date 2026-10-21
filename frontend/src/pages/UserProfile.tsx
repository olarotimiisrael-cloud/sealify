import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { useFollowers, useFollowing } from '../lib/api-client';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { User, ShieldCheck, Mail, Phone, MapPin, AlertCircle, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import FollowButton from '../components/FollowButton';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchUser, fetchUserListings } = useSealify();
  const { data: followersData } = useFollowers(id || '');
  const { data: followingData } = useFollowing(id || '');
  const followerCount = followersData?.data?.length || 0;
  const followingCount = followingData?.data?.length || 0;

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    setLoading(true);
    try {
      const [userRes, listingsRes] = await Promise.all([
        fetchUser(userId),
        fetchUserListings(userId),
      ]);
      setUser(userRes?.user || userRes);
      setListings(listingsRes?.listings || listingsRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center py-20">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-2">User Not Found</h2>
        <p className="text-slate-500 text-xs">The user profile you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title={`${user.name || 'User'} Profile — Sealify Nigeria`} />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-emerald-100"
                />
                {user.is_verified_seller && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{user.name || 'Sealify User'}</h1>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {user.is_verified_seller ? 'Verified Seller' : 'Unverified User'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:flex-1 justify-end">
              {user.phone_number && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">{user.phone_number}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">{user.location}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-900">{followerCount}</span>
                <span className="text-[10px] text-slate-500 uppercase">Followers</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-900">{followingCount}</span>
                <span className="text-[10px] text-slate-500 uppercase">Following</span>
              </div>
              <FollowButton userId={user.id} className="px-4 py-1.5" />
            </div>
          </div>
        </div>

        {/* User Listings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">Their Listings ({listings.length})</h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.total_listings || 0} total</span>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">No listings yet</h3>
              <p className="text-slate-500 text-xs">{user.name} hasn't posted any items for sale.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-xl hover:border-emerald-500/50">
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {listing.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full">SOLD</span>
                      </div>
                    )}
                    {listing.is_boosted && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Star className="w-2 h-2 fill-current" /> TOP AD
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="text-sm sm:text-base md:text-lg font-black text-emerald-600 tracking-tight truncate">
                        ₦{Number(listing.price || 0).toLocaleString()}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                        {listing.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-emerald-600 transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{listing.location?.split(',')[0] || 'Nigeria'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

