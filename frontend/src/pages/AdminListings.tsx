import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Package, Gavel, ShieldCheck, FileText, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchAdminListings, updateAdminListing } = useSealify();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminListings();
      setListings(res?.data || res || []);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleFeature = async (id: string) => {
    try {
      await updateAdminListing(id, { featured: true });
      toast.success('Listing featured');
      loadListings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to feature listing');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Admin Listings — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <Package className="w-3 h-3" />
            <span>Listing Management</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Manage Listings</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Review, feature, and moderate all marketplace listings.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listing</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seller</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No listings found.
                    </td>
                  </tr>
                ) : (
                  listings.map((l) => (
                    <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium text-slate-900 truncate block">{l.title}</span>
                            <p className="text-[9px] text-slate-400">#{l.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{l.seller_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{l.category}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">₦{Number(l.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          l.status === 'active' ? 'bg-emerald-100 text-emerald-600' : l.status === 'sold' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {l.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {!l.is_boosted && (
                          <button
                            onClick={() => handleFeature(l.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                            title="Feature Listing"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

