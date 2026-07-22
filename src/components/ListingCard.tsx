import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import { Heart, MapPin, Eye, Scale, TrendingDown } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { toggleSaveListing, isSaved, toggleCompareListing, isInCompare } = useSealify();
  const saved = isSaved(listing.id);
  const compared = isInCompare(listing.id);

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formattedPrice = formatNGN(listing.price);

  const hasPriceDrop = listing.originalPrice && listing.originalPrice > listing.price;
  const discountPercent = hasPriceDrop
    ? Math.round(((listing.originalPrice! - listing.price) / listing.originalPrice!) * 100)
    : 0;

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between relative">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {listing.featured && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
            TOP AD
          </span>
        )}
        {hasPriceDrop && (
          <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" /> PRICE DROP -{discountPercent}%
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCompareListing(listing.id);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            compared
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950/80'
          }`}
          title={compared ? 'Remove from comparison' : 'Compare this ad'}
        >
          <Scale className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveListing(listing.id);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            saved
              ? 'bg-red-500/90 text-white'
              : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950/80'
          }`}
          title={saved ? 'Unsave' : 'Save ad'}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
        </button>
      </div>

      <div>
        <Link to={`/listing/${listing.id}`} className="block relative aspect-[4/3] bg-slate-850 overflow-hidden">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full tracking-widest uppercase">
                SOLD
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-slate-950/80 text-slate-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <Eye className="w-3 h-3" />
            <span>{listing.viewsCount}</span>
          </div>
        </Link>

        <div className="p-4 space-y-2">
          <div className="flex justify-between items-baseline gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-400 tracking-tight">
                {formattedPrice}
              </span>
              {hasPriceDrop && (
                <span className="text-xs text-slate-500 line-through font-semibold">
                  {formatNGN(listing.originalPrice!)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md uppercase">
              {listing.category}
            </span>
          </div>

          <Link to={`/listing/${listing.id}`}>
            <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 hover:text-emerald-400 transition-colors leading-snug">
              {listing.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
              {listing.condition}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/50 text-xs text-slate-400 flex justify-between items-center gap-2">
        <div className="flex items-center gap-1 truncate text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate text-[11px]">{listing.location}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {listing.sellerVerified && (
            <VerifiedBadge type={listing.sellerVerificationType || 'individual'} />
          )}
          <span className="text-[10px] text-slate-500">{listing.createdAt}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;