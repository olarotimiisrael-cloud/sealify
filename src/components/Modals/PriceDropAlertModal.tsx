import React, { useState } from 'react';
import { X, TrendingDown, Bell, CheckCircle2, ShieldCheck, Send } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { toast } from 'sonner';

interface PriceDropAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  currentPrice: number;
}

export const PriceDropAlertModal: React.FC<PriceDropAlertModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  currentPrice,
}) => {
  const { saveSearchAlert, user } = useSealify();
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9).toString());
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const numericTarget = Number(targetPrice);
    if (!numericTarget || numericTarget <= 0) {
      toast.error('Please enter a valid target price threshold');
      return;
    }

    saveSearchAlert({
      query: listingTitle,
      category: 'All',
      maxPrice: numericTarget,
      location: 'Any Location',
    });

    setIsSaved(true);
    toast.success(`Price drop alert set for "${listingTitle}" below ${formatNGN(numericTarget)}!`);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Target Price Drop Alert</h2>
          <p className="text-xs text-slate-400 truncate max-w-xs mx-auto">
            {listingTitle}
          </p>
        </div>

        {!isSaved ? (
          <form onSubmit={handleSetAlert} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
              <span className="text-slate-400 font-bold">Current Listing Price:</span>
              <strong className="text-white font-black text-sm">{formatNGN(currentPrice)}</strong>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Notify Me When Price Drops Below (₦ NGN)</label>
              <input
                type="number"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter target price"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Activate Price Watch Notification</span>
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">Price Alert Active</h3>
            <p className="text-xs text-slate-400">We will alert your notification center as soon as the seller updates this price!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceDropAlertModal;