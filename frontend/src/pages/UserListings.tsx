import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ListingCard from '../components/ListingCard';
import { ArrowLeft, MapPin, Clock, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UserListings() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchUser, fetchUserListings } = useSealify();
  const navigate = useNavigate();

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
      toast.error(err.message || 'Failed to load user listings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title={`${user?.name || 'User'} Listings — Sealify Nigeria`} />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Marketplace</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {user?.name || 'User'}'s Listings
          </h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-emerald-100"
              />
              {user?.is_verified_seller && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center">
                  <Package className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{user?.name || 'Sealify User'}</h2>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                {user?.is_verified_seller ? 'Verified Seller' : 'Unverified User'}
              </p>
              {user?.location && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {user.location}
                </p>
              )}
            </div>
          </div>
          {user?.bio && (
            <p className="mt-3 text-xs text-slate-600 mt-3">{user.bio}</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Listings ({listings.length})</h2>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{listings.length} items</span>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">No listings yet</h3>
            <p className="text-slate-500 text-xs">{user?.name} hasn't posted any items for sale.</p>
            {user?.id === (JSON.parse(localStorage.getItem('sealify_user') || '{}')?.id) && (
              <Link to="/post-ad" className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                Post Your First Ad
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

