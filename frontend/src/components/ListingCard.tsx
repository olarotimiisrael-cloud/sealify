import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import ShareQrModal from './ShareQrModal';
import QuickViewModal from './QuickViewModal';
import { Heart, MapPin, Eye, Scale, TrendingDown, Flame, Tag, Calendar, Share2, Clock, Maximize2 } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { toggleSaveListing, isSaved, toggleCompareListing, isInCompare } = useSealify();
  const saved = isSaved(listing.id);
  const compared = isInCompare(listing.id);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

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

  const isGreatDeal = listing.price < 500000 && (listing.viewsCount > 100 || hasPriceDrop);

  const getDaysLeft = (): number | null => {
    if (!listing.promotionEndDate) return null;
    const end = new Date(listing.promotionEndDate);
    if (isNaN(end.getTime())) return null;
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();
  const shareUrl = `${window.location.origin}/listing/${listing.id}`;

  return (
    <>
      <div className="group bg-white border border-slate-200 hover:border-emerald-400/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100 flex flex-col justify-between relative h-full">
        {/* Top Badges overlay */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start max-w-[65%] pointer-events-none">
          {listing.featured && (
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm pointer-events-auto flex items-center gap-1">
              <span>TOP AD</span>
              {daysLeft !== null && daysLeft > 0 && (
                <span className="text-[7px] bg-white/40 text-slate-900 px-1 rounded font-mono">
                  {daysLeft}d left
                </span>
              )}
            </span>
          )}
          {isGreatDeal && (
            <span className="bg-emerald-600 text-slate-900 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 pointer-events-auto">
              <Tag className="w-2.5 h-2.5 fill-current" /> DEAL
            </span>
          )}
          {listing.viewsCount > 200 && !listing.featured && (
            <span className="bg-purple-600 text-slate-900 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 pointer-events-auto">
              <Flame className="w-2.5 h-2.5 fill-current" /> HOT
            </span>
          )}
        </div>

        {/* Top Action Buttons */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="p-1.5 rounded-full bg-white text-emerald-600 hover:text-emerald-700 shadow-sm transition-transform active:scale-90 border border-slate-200"
            title="Quick Preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsShareOpen(true);
            }}
            className="p-1.5 rounded-full bg-white text-emerald-600 hover:text-emerald-700 shadow-sm transition-transform active:scale-90 border border-slate-200"
            title="Share this item"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompareListing(listing.id);
            }}
            className={`p-1.5 rounded-full shadow-sm transition-transform active:scale-90 border border-slate-200 ${
              compared
                ? 'bg-emerald-600 text-slate-900'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
            title="Compare ad"
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveListing(listing.id);
            }}
            className={`p-1.5 rounded-full shadow-sm transition-transform active:scale-90 border border-slate-200 ${
              saved
                ? 'bg-rose-600 text-slate-900'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
            title="Bookmark ad"
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        <div>
          <Link to={`/listing/${listing.id}`} className="block relative aspect-[4/3] bg-slate-100 overflow-hidden">
            <img
              src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';
              }}
            />
            {listing.status === 'sold' && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-rose-600 text-slate-900 font-black text-xs px-3 py-1 rounded-full tracking-widest uppercase shadow-lg">
                  SOLD
                </span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-white/90 text-slate-900 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm">
              <Eye className="w-3 h-3" />
              <span>{listing.viewsCount}</span>
            </div>
          </Link>

          <div className="p-2.5 sm:p-4 space-y-1">
            <div className="flex justify-between items-baseline gap-1">
              <span className="text-sm sm:text-base md:text-lg font-black text-emerald-600 tracking-tight truncate">
                {formattedPrice}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded uppercase shrink-0">
                {listing.category}
              </span>
            </div>

            <Link to={`/listing/${listing.id}`}>
              <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-emerald-600 transition-colors">
                {listing.title}
              </h3>
            </Link>

            <div className="pt-0.5 flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                {listing.condition}
              </span>
              {hasPriceDrop && (
                <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> -{discountPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-2.5 sm:px-4 py-2 border-t border-slate-100 bg-white text-[10px] text-slate-900 flex justify-between items-center gap-1">
          <div className="flex items-center gap-1 truncate text-slate-900 min-w-0">
            <MapPin className="w-3 h-3 text-slate-900 shrink-0" />
            <span className="truncate">{listing.location.split(',')[0]}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {listing.sellerVerified && (
              <VerifiedBadge type={listing.sellerVerificationType || 'individual'} />
            )}
          </div>
        </div>
      </div>

      <ShareQrModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        listingTitle={listing.title}
        listingPrice={listing.price}
        listingUrl={shareUrl}
      />

      <QuickViewModal
        listing={listing}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};

export default ListingCard;


