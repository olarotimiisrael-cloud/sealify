import React, { useState } from 'react';
import { X, QrCode, Download, Share2, Copy, Check, Sparkles, MessageCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import VerifiedBadge from './VerifiedBadge';
import Logo from './Logo';
import { VerificationBadgeType } from '../types/sealify';

interface StorefrontFlycardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price?: number;
  location?: string;
  image?: string;
  sellerName?: string;
  sellerPhone?: string;
  verificationType?: VerificationBadgeType;
  businessName?: string;
  itemUrl?: string;
}

export const StorefrontFlycardModal: React.FC<StorefrontFlycardModalProps> = ({
  isOpen,
  onClose,
  title,
  price,
  location = 'Ogbomoso, Oyo State',
  image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
  sellerName = 'Verified Merchant',
  sellerPhone = '+234 813 120 8468',
  verificationType = 'individual',
  businessName,
  itemUrl = window.location.href,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formattedPrice = price ? formatNGN(price) : 'Contact for Price';

  // Ensure absolute URL back to this item with flyer attribution
  const baseUrl = itemUrl.startsWith('http') 
    ? itemUrl 
    : `${window.location.origin}${itemUrl}`;
  
  // Adding Viral Attribution Tag
  const targetItemUrl = baseUrl.includes('?') 
    ? `${baseUrl}&ref=flyer` 
    : `${baseUrl}?ref=flyer`;

  const promoCaption = `🔥 AVAILABLE ON SEALIFY NIGERIA 🔥\n\n📦 Item: ${title}\n💰 Price: ${formattedPrice}\n📍 Location: ${location}\n👤 Seller: ${businessName || sellerName}\n📞 Phone: ${sellerPhone}\n\n👉 Click link below to view details and inspect on Sealify:\n${targetItemUrl}`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(promoCaption);
    setCopiedText(true);
    toast.success('WhatsApp Status caption copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(targetItemUrl);
    setCopiedLink(true);
    toast.success('Viral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(promoCaption)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} — ${formattedPrice} on Sealify`,
        text: promoCaption,
        url: targetItemUrl,
      }).catch(() => {});
    } else {
      handleWhatsAppShare();
    }
  };

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    targetItemUrl
  )}&color=059669&bgcolor=020617`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">WhatsApp & Social Promo Card</h2>
          <p className="text-xs text-slate-400">
            Generates a branded share card with viral tracking enabled
          </p>
        </div>

        <div id="flyer-poster-card" className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <Logo size="sm" />
            <VerifiedBadge type={verificationType} showText />
          </div>

          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-emerald-400 font-black text-lg shadow-lg">
              {formattedPrice}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-base font-black text-white line-clamp-2 leading-tight">{title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{location}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold uppercase text-slate-500">Contact Merchant</p>
                <p className="font-extrabold text-xs text-white truncate">{businessName || sellerName}</p>
                <p className="text-[11px] font-mono text-emerald-400 font-bold">{sellerPhone}</p>
              </div>

              <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 text-center">
                <img src={qrDataUrl} alt="Scan QR" className="w-12 h-12 rounded" />
                <span className="text-[8px] font-bold text-slate-500 uppercase block mt-0.5">Scan Link</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 text-xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Attributed Social Link</p>
            <p className="text-emerald-400 font-mono text-[11px] truncate">{targetItemUrl}</p>
          </div>
          <button
            onClick={handleCopyDirectLink}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors border border-slate-800"
          >
            {copiedLink ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleCopyCaption}
            className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy Caption</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Post to Status</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Viral Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorefrontFlycardModal;