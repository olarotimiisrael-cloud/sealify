import React from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import { Building2, ArrowRight, MapPin, Package, Star, Award } from 'lucide-react';

export const FeaturedVendorsSection: React.FC = () => {
  const { allUsers, listings } = useSealify();

  // Find top verified sellers or admins
  const topVendors = allUsers
    .filter((u) => u.verified || u.role === 'seller' || u.role === 'admin')
    .slice(0, 4);

  if (topVendors.length === 0) return null;

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Verified Local Merchants</h2>
              <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                CAC & ID Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">Discover trusted stores & vendors operating in Ogbomosoland</p>
          </div>
        </div>

        <Link
          to="/vendors"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>View All Directory ({allUsers.filter((u) => u.verified).length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topVendors.map((vendor) => {
          const vendorListings = listings.filter((l) => l.sellerId === vendor.id);
          const storeBanner = vendor.storeBannerUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={vendor.id}
              className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg flex flex-col justify-between group"
            >
              <div>
                {/* Store Cover Header */}
                <div className="h-20 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={storeBanner}
                    alt={vendor.fullName}
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <div className="absolute top-2 right-2">
                    <VerifiedBadge type={vendor.verificationType || 'individual'} />
                  </div>
                </div>

                {/* Avatar & Title info */}
                <div className="p-4 -mt-8 relative z-10 space-y-2">
                  <div className="flex items-end gap-3">
                    <img
                      src={vendor.avatarUrl}
                      alt={vendor.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-950 shadow-md shrink-0 bg-slate-900"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                      }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-white truncate leading-tight">{vendor.fullName}</h3>
                      <p className="text-[11px] font-bold text-emerald-400 truncate">
                        {vendor.businessName || 'Verified Merchant'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      {vendor.location || 'Ogbomoso, Oyo State'}
                    </span>
                    <span className="font-bold text-slate-300 flex items-center gap-1 shrink-0">
                      <Package className="w-3 h-3 text-emerald-400" />
                      {vendorListings.length} Active Ads
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0">
                <Link
                  to={`/seller/${vendor.id}`}
                  className="w-full py-2 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-extrabold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 border border-slate-800 transition-all"
                >
                  <span>Visit Storefront</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedVendorsSection;