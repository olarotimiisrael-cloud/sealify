import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Share2, MessageCircle, Mail, Send, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
  listingPrice: number;
  listingUrl: string;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({
  isOpen,
  onClose,
  listingTitle,
  listingPrice,
  listingUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(listingUrl);
    setCopied(true);
    toast.success('Listing link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listingTitle,
        text: `Check out "${listingTitle}" for ${formatNGN(listingPrice)} on Sealify!`,
        url: listingUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    listingUrl
  )}&color=000000&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 text-center">
          <div className="space-y-1">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-black text-xl text-white">Share & Scan QR Code</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs mx-auto">
              {listingTitle} • <span className="text-emerald-400 font-bold">{formatNGN(listingPrice)}</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center border-4 border-emerald-500/30 shadow-xl">
            <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
          </div>

          <p className="text-[11px] text-slate-400">
            Scan with any phone camera to view listing details instantly or show during in-person meetups.
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-emerald-400 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
              <span className="text-[10px] font-bold">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${listingTitle} on Sealify: ${listingUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] font-bold">WhatsApp</span>
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(listingTitle)}&body=${encodeURIComponent(`Check out this item on Sealify: ${listingUrl}`)}`}
              className="flex flex-col items-center gap-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="text-[10px] font-bold">Email</span>
            </a>

            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1 p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
            >
              <Send className="w-5 h-5" />
              <span className="text-[10px] font-extrabold">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareQrModal;