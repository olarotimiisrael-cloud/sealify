import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '@/types';
import { useApp } from '@/context/AppContext';
import { Bookmark, MapPin, ShieldCheck, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { savedIds, toggleSaveListing } = useApp();
  const isSaved = savedIds.includes(listing.id);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full relative">
      
      {/* Featured Badge */}
      {listing.is_featured && (
        <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
          Featured
        </span>
      )}

      {/* Save / Bookmark Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSaveListing(listing.id);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${
          isSaved
            ? 'bg-rose-500 text-white shadow-sm'
            : 'bg-black/30 hover:bg-black/50 text-white'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Image Thumbnail Link */}
      <Link to={`/product/${listing.id}`} className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <Badge variant="secondary" className="bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-medium border-0">
            {listing.condition}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              {listing.category}
            </span>
            <span className="text-[11px] text-slate-400">
              {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
            </span>
          </div>

          <Link to={`/product/${listing.id}`}>
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-2 hover:text-emerald-600 transition-colors mb-2">
              {listing.title}
            </h3>
          </Link>
        </div>

        <div>
          <div className="text-lg font-bold text-slate-900 mb-2">
            {formattedPrice}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center text-slate-500 truncate max-w-[140px]">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>

            {listing.seller?.verified && (
              <span className="flex items-center text-emerald-600 font-medium text-[11px]" title="Verified Seller">
                <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                Verified
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};