import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import { Flame, MapPin, Eye, Heart, ArrowRight } from 'lucide-react';

interface FeaturedAdSectionProps {
  listings: Listing[];
}

export const FeaturedAdSection: React.FC<FeaturedAdSectionProps> = ({ listings }) => {
  const { toggleSaveListing, isSaved } = useSealify();

  const featuredListings = listings.filter((l) => l.featured || l.viewsCount > 150).slice(0, 4);

  if (featuredListings.length === 0) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Promoted Top Ads</h2>
              <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-mono">
                5x Boost
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Handpicked verified deals across Ogbomoso & Oyo State</p>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {featuredListings.map((item) => {
          const saved = isSaved(item.id);
          return (
            <div
              key={item.id}
              className="group bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between relative shadow-lg h-full"
            >
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-slate-950" /> TOP AD
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSaveListing(item.id);
                }}
                className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
                  saved ? 'bg-rose-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
              </button>

              <div>
                <Link to={`/listing/${item.id}`} className="block relative aspect-[4/3] bg-slate-900 overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-slate-950/80 text-slate-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Eye className="w-3 h-3" />
                    <span>{item.viewsCount}</span>
                  </div>
                </Link>

                <div className="p-3 space-y-1">
                  <div className="flex justify-between items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-amber-400">{formatNGN(item.price)}</span>
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded shrink-0">
                      {item.category}
                    </span>
                  </div>

                  <Link to={`/listing/${item.id}`}>
                    <h3 className="text-xs font-bold text-slate-100 line-clamp-1 hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{item.location}</span>
                    {item.sellerVerified && (
                      <VerifiedBadge type={item.sellerVerificationType || 'individual'} className="ml-auto shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedAdSection;