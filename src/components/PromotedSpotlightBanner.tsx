import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import { Crown, Sparkles, MapPin, Eye, ArrowRight, ChevronLeft, ChevronRight, MessageSquare, ShieldCheck, Tag } from 'lucide-react';

interface PromotedSpotlightBannerProps {
  listings: Listing[];
}

export const PromotedSpotlightBanner: React.FC<PromotedSpotlightBannerProps> = ({ listings }) => {
  const { toggleSaveListing, isSaved, sendMessage, isAuthenticated } = useSealify();
  const navigate = useNavigate();

  // Filter for active promoted/featured listings
  const promotedAds = listings.filter((l) => l.featured || l.viewsCount > 150);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (promotedAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotedAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [promotedAds.length]);

  if (promotedAds.length === 0) return null;

  const currentAd = promotedAds[currentIndex] || promotedAds[0];

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuickChat = () => {
    if (!isAuthenticated) {
      navigate('/messages');
      return;
    }
    sendMessage(currentAd.id, currentAd.sellerId, `Hi ${currentAd.sellerName}! I saw your promoted advert "${currentAd.title}" in the Sealify Spotlight. Is it available for inspection?`);
    navigate('/messages');
  };

  return (
    <section className="relative bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 border-2 border-amber-500/40 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden group font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Column - Product Image & Badge */}
        <div className="relative w-full lg:w-1/2 aspect-[16/10] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group/img">
          <img
            src={currentAd.images[0]}
            alt={currentAd.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-pulse">
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>TOP AD SPOTLIGHT</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-10">
            <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400 font-black text-lg">
              {formatNGN(currentAd.price)}
            </span>

            <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-bold flex items-center gap-1 text-[11px]">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentAd.viewsCount} impressions</span>
            </span>
          </div>
        </div>

        {/* Right Column - Description & Call to Action */}
        <div className="w-full lg:w-1/2 space-y-5 text-center lg:text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center lg:justify-start flex-wrap">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                {currentAd.category}
              </span>
              <VerifiedBadge type={currentAd.sellerVerificationType || 'individual'} showText />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight line-clamp-2">
              {currentAd.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {currentAd.description}
            </p>
          </div>

          <div className="flex items-center gap-4 justify-center lg:justify-start text-xs text-slate-400 font-semibold flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {currentAd.location}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4 text-purple-400" />
              {currentAd.condition}
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              onClick={handleQuickChat}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Instant Live Chat with Seller</span>
            </button>

            <Link
              to={`/listing/${currentAd.id}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>View Full Listing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Slider controls */}
          {promotedAds.length > 1 && (
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex gap-1.5">
                {promotedAds.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase ml-2">
                Promoted {currentIndex + 1} of {promotedAds.length}
              </span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default PromotedSpotlightBanner;