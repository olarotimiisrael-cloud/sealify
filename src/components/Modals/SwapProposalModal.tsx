import React, { useState, useRef } from 'react';
import { X, RefreshCw, DollarSign, Send, ArrowRightLeft, Camera, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SwapProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItemTitle: string;
  targetItemPrice: number;
  sellerName: string;
  onSendSwapToChat?: (swapMsg: string) => void;
}

export const SwapProposalModal: React.FC<SwapProposalModalProps> = ({
  isOpen,
  onClose,
  targetItemTitle,
  targetItemPrice,
  sellerName,
  onSendSwapToChat,
}) => {
  const [offeredItemTitle, setOfferedItemTitle] = useState('');
  const [offeredItemValuation, setOfferedItemValuation] = useState('');
  const [offeredItemCondition, setOfferedItemCondition] = useState('Like New');
  const [cashDifferenceType, setCashDifferenceType] = useState<'i_pay' | 'seller_pays' | 'even_swap'>('i_pay');
  const [cashAmount, setCashAmount] = useState('');
  const [swapNote, setSwapNote] = useState('Hi! I am interested in swapping my item for yours. Please let me know if this trade-in deal works for you!');
  const [itemPhoto, setItemPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setItemPhoto(event.target?.result as string);
        toast.success('Trade-in item photo attached!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!offeredItemTitle.trim() || !offeredItemValuation) {
      toast.error('Please enter the name and estimated value of your trade-in item');
      return;
    }

    const numericValuation = Number(offeredItemValuation);
    const numericCash = Number(cashAmount) || 0;

    let cashSummary = 'Even Swap (No Cash Top-up)';
    if (cashDifferenceType === 'i_pay' && numericCash > 0) {
      cashSummary = `I add ${formatNGN(numericCash)} cash top-up`;
    } else if (cashDifferenceType === 'seller_pays' && numericCash > 0) {
      cashSummary = `Seller adds ${formatNGN(numericCash)} cash balance`;
    }

    const swapMessage = `🔄 OFFICIAL SEALIFY ITEM SWAP & TRADE-IN PROPOSAL
----------------------------------------
Target Item: ${targetItemTitle} (Listed: ${formatNGN(targetItemPrice)})
My Trade-In Item: ${offeredItemTitle} (${offeredItemCondition})
Estimated Valuation: ${formatNGN(numericValuation)}
Cash Difference: ${cashSummary}
----------------------------------------
Note to ${sellerName}: "${swapNote}"
Status: ⏳ PROPOSAL PENDING SELLER REVIEW
----------------------------------------
(Inspect both items at a Verified Safe Meetup Spot before finalizing swap)`;

    if (onSendSwapToChat) {
      onSendSwapToChat(swapMessage);
    }

    toast.success('Swap proposal dispatched to seller chat!');
    onClose();
  };

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
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Item Swap & Trade-In Proposal</h2>
          <p className="text-xs text-slate-400">
            Propose trading your item plus cash for <strong className="text-amber-400">"{targetItemTitle}"</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-slate-400 font-bold">Target Item Asking Price:</span>
            <strong className="text-emerald-400 font-black text-sm">{formatNGN(targetItemPrice)}</strong>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider">Your Trade-In Item Title *</label>
            <input
              type="text"
              required
              value={offeredItemTitle}
              onChange={(e) => setOfferedItemTitle(e.target.value)}
              placeholder="e.g. iPhone 11 Pro Max 256GB or PS4 Slim 500GB"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Estimated Valuation (₦) *</label>
              <input
                type="number"
                required
                value={offeredItemValuation}
                onChange={(e) => setOfferedItemValuation(e.target.value)}
                placeholder="e.g. 220000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-black text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Item Condition</label>
              <select
                value={offeredItemCondition}
                onChange={(e) => setOfferedItemCondition(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-300 uppercase tracking-wider">Cash Difference Term</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCashDifferenceType('i_pay')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  cashDifferenceType === 'i_pay'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                I Add Cash
              </button>

              <button
                type="button"
                onClick={() => setCashDifferenceType('even_swap')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  cashDifferenceType === 'even_swap'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                Even Trade
              </button>

              <button
                type="button"
                onClick={() => setCashDifferenceType('seller_pays')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  cashDifferenceType === 'seller_pays'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                Seller Adds Cash
              </button>
            </div>
          </div>

          {cashDifferenceType !== 'even_swap' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Cash Difference Amount (₦ NGN)</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-black focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider">Attach Photo of Trade-In Item (Optional)</label>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>{itemPhoto ? 'Photo Attached ✓' : 'Upload Trade-In Photo'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider">Note to Seller</label>
            <textarea
              rows={2}
              value={swapNote}
              onChange={(e) => setSwapNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Swap & Trade Proposal to Chat</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SwapProposalModal;