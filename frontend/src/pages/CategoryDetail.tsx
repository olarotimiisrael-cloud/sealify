import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ArrowLeft, Package, Clock, Star, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchCategory, fetchCategoryListings } = useSealify();

  useEffect(() => {
    if (slug) {
      loadCategory(slug);
    }
  }, [slug]);

  const loadCategory = async (categorySlug: string) => {
    setLoading(true);
    try {
      const [catRes, listingsRes] = await Promise.all([
        fetchCategory(categorySlug),
        fetchCategoryListings(categorySlug),
      ]);
      setCategory(catRes?.category || catRes);
      setListings(listingsRes?.listings || listingsRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load category');
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

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center py-20">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-2">Category Not Found</h2>
        <p className="text-slate-500 text-xs">The category you're looking for doesn't exist.</p>
        <Link to="/categories" className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
          Browse Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title={`${category.name} — Sealify Nigeria`} />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <Link to="/categories" className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Categories</span>
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            {category.name}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
            Browse verified {category.name.toLowerCase()} items in Ogbomosoland and nearby areas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <Link key={listing.id} to={`/listing/${listing.id}`} className="group block">
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-xl hover:border-emerald-500/50 h-full flex flex-col">
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
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">No items in this category</h3>
              <p className="text-slate-500 text-xs">Be the first to post an item in {category.name}.</p>
              <Link to="/post-ad" className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                Post Free Ad
              </Link>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

