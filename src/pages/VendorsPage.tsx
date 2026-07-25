import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import VerifiedBadge from '../components/VerifiedBadge';
import { 
  Building2, 
  Search, 
  MapPin, 
  ShieldCheck, 
  ExternalLink, 
  Package, 
  Users,
  CheckCircle2,
  SlidersHorizontal,
  User
} from 'lucide-react';
import { VerificationBadgeType } from '../types/sealify';

type BadgeFilter = 'All' | 'individual' | 'business' | 'premium';

export const VendorsPage: React.FC = () => {
  const { allUsers, listings } = useSealify();
  const [searchQuery, setSearchQuery] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>('All');

  // Filter vendors/sellers
  const vendors = allUsers.filter((u) => u.verified || u.role === 'seller' || u.role === 'admin');

  const filteredVendors = vendors.filter((vendor) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = vendor.fullName.toLowerCase().includes(q);
    const businessMatch = vendor.businessName ? vendor.businessName.toLowerCase().includes(q) : false;
    const locationMatch = vendor.location ? vendor.location.toLowerCase().includes(q) : false;

    if (q && !nameMatch && !businessMatch && !locationMatch) return false;
    if (badgeFilter !== 'All' && vendor.verificationType !== badgeFilter) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Verified Vendor & Business Directory — Sealify Nigeria"
        description="Browse registered local businesses, verified sellers, and top merchants in Ogbomosoland, Oyo State, and across Nigeria."
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                <Building2 className="w-4 h-4" />
                <span>Ogbomoso & Oyo State Trusted Merchant Network</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Verified Vendor Directory</h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Connect with admin-verified individual sellers, CAC-registered local businesses, and premium partners. Every merchant in this directory has completed identity verification.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl space-y-1 shrink-0 text-center w-full sm:w-auto">
              <p className="text-2xl font-black text-emerald-400">{vendors.length}</p>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Active Trusted Merchants</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search store name, merchant, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {(['All', 'individual', 'business', 'premium'] as BadgeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setBadgeFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                  badgeFilter === filter
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'All' ? 'All Vendors' : `${filter} Badge`}
              </button>
            ))}
          </div>
        </div>

        {filteredVendors.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs my-8 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-bold text-white text-sm">No vendors found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => {
              const vendorListings = listings.filter((l) => l.sellerId === vendor.id);
              return (
                <div
                  key={vendor.id}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 relative group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {vendor.avatarUrl ? (
                          <img
                            src={vendor.avatarUrl}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                            alt={vendor.fullName}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl border-2 border-emerald-500 bg-slate-950 flex flex-col items-center justify-center text-slate-500 shadow-md">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-base text-white truncate">{vendor.fullName}</h3>
                          {vendor.businessName && <p className="text-xs font-bold text-emerald-400 truncate">{vendor.businessName}</p>}
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {vendor.location}</p>
                        </div>
                      </div>
                      <VerifiedBadge type={vendor.verificationType || 'individual'} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Inventory</span>
                        <span className="font-black text-white flex items-center gap-1 mt-0.5"><Package className="w-3.5 h-3.5 text-emerald-400" /> {vendorListings.length} Ads</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/seller/${vendor.id}`}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs text-center flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <span>View Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default VendorsPage;