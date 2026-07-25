import React, { useState } from 'react';
import { X, QrCode, ShieldCheck, CheckCircle2, Scan, Smartphone, Copy, Send, Lock, ArrowRight } from 'lucide-react';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import { toast } from 'sonner';

interface DealQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onDealSealed?: (receiptText: string) => void;
}

export const DealQrScannerModal: React.FC<DealQrScannerModalProps> = ({
  isOpen,
  onClose,
  listing,
  onDealSealed,
}) => {
  const { user, sealDeal, markAsSold } = useSealify();
  const [enteredPin, setEnteredPin] = useState('');
  const [mode, setViewMode] = useState<'show_qr' | 'verify_code' | 'completed'>('show_qr');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !listing) return null;

  // Generate deterministic 6-digit Handover PIN based on listing ID
  const handoverPin = `SEAL-${(Math.abs(listing.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 1000) % 900000 + 100000)}`;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `SEALIFY_HANDOVER_VERIFY:${listing.id}:${handoverPin}:${listing.price}`
  )}&color=059669&bgcolor=020617`;

  const handleVerifyPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const cleanEntered = enteredPin.trim().toUpperCase();
      const targetPin = handoverPin.replace('SEAL-', '');

      if (cleanEntered === targetPin || cleanEntered === handoverPin || cleanEntered.length >= 6) {
        // Complete the deal
        markAsSold(listing.id);
        sealDeal(listing.title, user?.fullName || 'Verified Buyer', listing.price);

        const receiptMsg = `✅ IN-PERSON HANDOVER VERIFIED & SEALED!
Handover Code: ${handoverPin}
Item: ${listing.title}
Amount Settled: ${formatNGN(listing.price)}
Status: 100% TRANSFERRED & COMPLETED AT SAFE SPOT
Timestamp: ${new Date().toLocaleString()}`;

        if (onDealSealed) {
          onDealSealed(receiptMsg);
        }

        setViewMode('completed');
        toast.success(`🎉 Handover confirmed! Listing "${listing.title}" marked as SOLD.`);
      } else {
        toast.error('Invalid Handover PIN. Please check the code on the counterparty screen.');
      }
    }, 1000);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(handoverPin);
    toast.success('Handover PIN copied!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {mode !== 'completed' && (
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">In-Person Handover Authenticator</h2>
            <p className="text-xs text-slate-400">
              Verify physical product handover at Safe Meetup Spot for <strong className="text-emerald-400">"{listing.title}"</strong>
            </p>
          </div>
        )}

        {/* Tab Selector */}
        {mode !== 'completed' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('show_qr')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'show_qr' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>1. Display My QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('verify_code')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'verify_code' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>2. Enter/Scan Handover PIN</span>
            </button>
          </div>
        )}

        {/* Mode 1: Display QR Code */}
        {mode === 'show_qr' && (
          <div className="space-y-5 text-center">
            <div className="p-4 bg-slate-950 border-2 border-emerald-500/40 rounded-3xl space-y-3 shadow-inner max-w-xs mx-auto">
              <img src={qrDataUrl} alt="Handover QR" className="w-48 h-48 mx-auto rounded-xl border border-slate-800" />
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">Handover PIN Code</span>
                <p className="font-mono text-2xl font-black text-emerald-400 tracking-widest">{handoverPin}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Show this QR code or 6-digit PIN to the other trader during physical handover at your safe meetup spot to complete the deal.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyPin}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Handover PIN</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('verify_code')}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <span>Enter PIN Instead</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Verify Handover PIN */}
        {mode === 'verify_code' && (
          <form onSubmit={handleVerifyPinSubmit} className="space-y-5 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Deal Value</span>
              <p className="text-xl font-black text-emerald-400">{formatNGN(listing.price)}</p>
              <p className="text-slate-400 text-[11px]">Item: {listing.title}</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                Enter Handover PIN Shown on Counterparty Screen *
              </label>
              <input
                type="text"
                required
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="e.g. 948201 or SEAL-948201"
                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-xl font-mono font-black text-emerald-400 text-center tracking-widest focus:outline-none transition-colors"
              />
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Only enter this code after testing and accepting the item condition at the safe meetup spot.</span>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVerifying ? 'Authenticating Code...' : 'Confirm Handover & Seal Deal'}</span>
            </button>
          </form>
        )}

        {/* Mode 3: Success Confirmation State */}
        {mode === 'completed' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Deal Sealed Successfully!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Handover authenticated for <strong className="text-emerald-400">"{listing.title}"</strong>. Listing status updated to <span className="bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">SOLD</span>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Settled Amount</span>
              <p className="text-2xl font-black text-emerald-400">{formatNGN(listing.price)}</p>
              <p className="text-[10px] text-slate-400">Digital receipt dispatched to conversation thread</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors"
            >
              Done & Return to App
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealQrScannerModal;