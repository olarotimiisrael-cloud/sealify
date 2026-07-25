import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import VerifiedBadge from './VerifiedBadge';
import TrustScore from './TrustScore';
import OfferModal from './OfferModal';
import SwapProposalModal from './SwapProposalModal';
import SafeMeetupModal from './SafeMeetupModal';
import { 
  X, MapPin, Eye, ExternalLink, MessageSquare, Phone, 
  MessageCircle, Tag, ArrowRightLeft, ShieldCheck, Calendar, Sliders
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickViewModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, sendMessage } = useSealify();

  const [activeImageIdx, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isMeetupOpen, setIsMeetupOpen] = useState(false);

  if (!isOpen || !listing) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStartQuickChat = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to initiate chat');
      return;
    }
    sendMessage(
      listing.id, 
      listing.sellerId, 
      `Hi ${listing.sellerName}, I am interested in "${listing.title}" listed for ${formatNGN(listing.price)}. Is it available for meetup?`
    );
    onClose();
    navigate('/messages');
  };

  const handleSendOffer = (offerPrice: number, offerMsg: string) => {
    if (!isAuthenticated) {
      toast.info('Please log in to make an offer');
      return;
    }
    sendMessage(listing.id, listing.sellerId, offerMsg);
    onClose();
    navigate('/messages');
  };

  const handleSendSwap = (swapMsg: string) => {
    if (!isAuthenticated) {
      toast.info('Please log in to propose a swap');
      return;
    }
    sendMessage(listing.id, listing.sellerId, swapMsg);
    onClose();
    navigate('/messages');
  };

  const handleSelectMeetupSpot = (spotName: string, spotAddress: string) => {
    if (!isAuthenticated) {
      toast.info('Please log in to propose a meetup');
      return;
    }
    sendMessage(listing.id, listing.sellerId, `📍 PROPOSED SAFE MEETUP LOCATION:\n${spotName}\n${spotAddress}`);
    onClose();
    navigate('/messages');
  };

  const whatsappUrl = `https://wa.me/${listing.sellerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${listing.sellerName}, I saw your ad on Sealify: "${listing.title}" (${formatNGN(listing.price)})`
  )}`;

  const hasSpecs = listing.specifications && Object.keys(listing.specifications).length > 0;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-10"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={listing.images[activeImageIdx] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1 font-bold">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>{listing.viewsCount} views</span>
                </div>
              </div>

              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIdx === idx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Technical Specifications preview */}
              {hasSpecs && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Quick Specifications</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {Object.entries(listing.specifications!).map(([k, v]) => (
                      <div key={k} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">{k}</span>
                        <span className="font-bold text-white truncate block">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    {listing.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {listing.condition}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-white leading-tight line-clamp-2">{listing.title}</h2>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{formatNGN(listing.price)}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {listing.location}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {listing.createdAt}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  {listing.description}
                </p>

                {/* Seller snippet */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={listing.sellerAvatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{listing.sellerName}</p>
                      {listing.sellerVerified && <VerifiedBadge type={listing.sellerVerificationType || 'individual'} showText />}
                    </div>
                  </div>
                  <Link
                    to={`/seller/${listing.sellerId}`}
                    onClick={onClose}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 font-bold shrink-0 transition-colors"
                  >
                    <span>Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsOfferOpen(true)}
                    className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-emerald-500/30 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Make Offer</span>
                  </button>

                  <button
                    onClick={() => setIsSwapOpen(true)}
                    className="py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-amber-500/30 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Propose Swap</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{showPhone ? listing.sellerPhone : 'Show Phone'}</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartQuickChat}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Live Chat</span>
                  </button>

                  <Link
                    to={`/listing/${listing.id}`}
                    onClick={onClose}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Full Ad Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        listingTitle={listing.title}
        originalPrice={listing.price}
        onSendOffer={handleSendOffer}
      />

      <SwapProposalModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        targetItemTitle={listing.title}
        targetItemPrice={listing.price}
        sellerName={listing.sellerName}
        onSendSwapToChat={handleSendSwap}
      />

      <SafeMeetupModal
        isOpen={isMeetupOpen}
        onClose={() => setIsMeetupOpen(false)}
        itemTitle={listing.title}
        onSelectSpot={handleSelectMeetupSpot}
      />
    </>
  );
};

export default QuickViewModal;