import React, { useState } from 'react';
import { X, DollarSign, Send, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
  originalPrice: number;
  onSendOffer: (offerPrice: number, message: string) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  listingTitle,
  originalPrice,
  onSendOffer,
}) => {
  const [offerPrice, setOfferPrice] = useState<string>(Math.round(originalPrice * 0.9).toString());
  const [note, setNote] = useState('Hi! I am interested in buying this item and would like to offer this price.');

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(offerPrice);
    if (!numericPrice || numericPrice <= 0) {
      toast.error('Please enter a valid offer price');
      return;
    }

    const offerMessage = `💰 OFFER PROPOSAL: ${formatNGN(numericPrice)}\n${note}`;
    onSendOffer(numericPrice, offerMessage);
    toast.success(`Price offer of ${formatNGN(numericPrice)} sent to seller!`);
    onClose();
  };

  const discountPercent = Math.round(((originalPrice - Number(offerPrice)) / originalPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
            <Tag className="w-6 h-6" />
            <span>Make an Offer</span>
          </div>

          <p className="text-xs text-slate-400">
            Send a price proposal to the seller for: <strong className="text-slate-200">{listingTitle}</strong>
          </p>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex justify-between items-center text-xs">
            <span className="text-slate-400">Listed Asking Price:</span>
            <span className="font-black text-white text-sm">{formatNGN(originalPrice)}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Offer Price (₦ NGN)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="number"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Enter offer amount"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-base font-extrabold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            {discountPercent > 0 && Number(offerPrice) < originalPrice && (
              <p className="text-[11px] text-emerald-400 font-semibold">
                {discountPercent}% below asking price
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Message to Seller</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Offer Proposal</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;