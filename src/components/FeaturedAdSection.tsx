import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import { MapPin, Eye, Heart, ArrowRight, Crown, Sparkles } from 'lucide-react';

interface FeaturedAdSectionProps {
  listings: Listing[];
}

export const FeaturedAdSection: React.FC<FeaturedAdSectionProps> = ({ listings }) => {
  const { toggleSaveListing, isSaved, t } = useSealify();

  // Sort and filter for featured/promoted ads
  const featuredListings = listings
    .filter((l) => l.featured || l.viewsCount > 120)
    .slice(0, 4);

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
    <section className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-purple-900/20 border-2 border-amber-500/40 rounded-[2.5rem] p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 shadow-inner">
            <Crown className="w-6 h-6 fill-amber-400 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{t('top_ads')}</h2>
              <span className="text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2 py-0.5 rounded-full font-mono shadow-md">
                {t('boost_active')}
              </span>
            </div>
            <p className="text-xs text-slate-400">{t('top_ads_desc')}</p>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30"
        >
          <span>{t('explore_promoted')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 relative z-10">
        {featuredListings.map((item) => {
          const saved = isSaved(item.id);

          return (
            <div
              key={item.id}
              className="group bg-slate-950 border-2 border-amber-500/30 hover:border-amber-400 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between relative shadow-xl hover:shadow-amber-500/10 hover:scale-[1.02]"
            >
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" /> TOP AD
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSaveListing(item.id);
                }}
                className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
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
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 text-slate-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>{item.viewsCount}</span>
                  </div>
                </Link>

                <div className="p-3.5 space-y-1.5">
                  <div className="flex justify-between items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-amber-400 tracking-tight">{formatNGN(item.price)}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded uppercase shrink-0">
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
                    <span className="truncate">{item.location.split(',')[0]}</span>
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