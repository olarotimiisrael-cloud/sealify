import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import { Crown, Sparkles, MapPin, Eye, ArrowRight, MessageSquare, Tag } from 'lucide-react';

interface PromotedSpotlightBannerProps {
  listings: Listing[];
}

export const PromotedSpotlightBanner: React.FC<PromotedSpotlightBannerProps> = ({ listings }) => {
  const { sendMessage, isAuthenticated } = useSealify();
  const navigate = useNavigate();

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
    <section className="relative bg-gradient-to-r from-purple-950/90 via-slate-900 to-emerald-950/90 border-2 border-amber-500/40 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-7 shadow-2xl overflow-hidden group font-sans">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-8">
        
        {/* Product Image & Badge */}
        <div className="relative w-full lg:w-1/2 aspect-[16/9] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-xl group/img">
          <img
            src={currentAd.images[0]}
            alt={currentAd.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>TOP AD SPOTLIGHT</span>
            </span>
          </div>

          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white z-10">
            <span className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-emerald-400 font-black text-sm sm:text-lg">
              {formatNGN(currentAd.price)}
            </span>

            <span className="bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800 text-slate-300 font-bold flex items-center gap-1 text-[10px]">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>{currentAd.viewsCount} views</span>
            </span>
          </div>
        </div>

        {/* Description & Actions */}
        <div className="w-full lg:w-1/2 space-y-3 sm:space-y-5 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {currentAd.category}
              </span>
              <VerifiedBadge type={currentAd.sellerVerificationType || 'individual'} showText />
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white leading-snug line-clamp-2">
              {currentAd.title}
            </h2>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {currentAd.description}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {currentAd.location}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              {currentAd.condition}
            </span>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleQuickChat}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Live Chat</span>
            </button>

            <Link
              to={`/listing/${currentAd.id}`}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <span>View Ad</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Slider indicators */}
          {promotedAds.length > 1 && (
            <div className="pt-1 flex items-center gap-2">
              <div className="flex gap-1">
                {promotedAds.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] text-slate-500 font-mono uppercase ml-1">
                {currentIndex + 1} of {promotedAds.length}
              </span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default PromotedSpotlightBanner;