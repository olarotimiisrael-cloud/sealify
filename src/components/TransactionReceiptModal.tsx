import React, { useState } from 'react';
import { X, FileText, Printer, Share2, ShieldCheck, CheckCircle2, QrCode, Copy, Send, Download, Building2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import { toast } from 'sonner';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onSendToChat?: (receiptText: string) => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSendToChat,
}) => {
  const { user } = useSealify();
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [agreedPrice, setAgreedPrice] = useState(listing?.price ? listing.price.toString() : '');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash Handover' | 'Escrow Protocol'>('Bank Transfer');
  const [meetupLocation, setMeetupLocation] = useState('Ogbomoso Police HQ Safe Spot');
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !listing) return null;

  const receiptId = `RCP-${new Date().getFullYear()}-${listing.id.replace(/[^0-9]/g, '').slice(-6) || '984021'}`;
  const currentDate = new Date().toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const finalAmount = Number(agreedPrice) || listing.price;

  const receiptSummaryText = `🧾 OFFICIAL SEALIFY TRANSACTION RECEIPT
Receipt Ref: ${receiptId}
Date: ${currentDate}
----------------------------------------
Item: ${listing.title}
Category: ${listing.category}
Condition: ${listing.condition}
Amount Paid: ${formatNGN(finalAmount)}
Payment Method: ${paymentMethod}
Exchange Spot: ${meetupLocation}
----------------------------------------
Seller: ${listing.sellerName} (${user?.phoneNumber || listing.sellerPhone})
Buyer: ${buyerName || 'Verified Buyer'} ${buyerPhone ? `(${buyerPhone})` : ''}
Status: VERIFIED & COMPLETED
----------------------------------------
Verified by Sealify Security Protocol (Ogbomoso, Nigeria)`;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptGenerated(true);
    toast.success('Official transaction receipt generated!');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(receiptSummaryText);
    setCopied(true);
    toast.success('Receipt text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToBuyer = () => {
    if (onSendToChat) {
      onSendToChat(receiptSummaryText);
    }
    toast.success('Receipt dispatched to buyer chat!');
    onClose();
  };

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `Sealify Receipt ${receiptId} | Amount: NGN ${finalAmount} | Item: ${listing.title}`
  )}&color=000000&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!receiptGenerated ? (
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Generate Official Sales Receipt</h2>
              <p className="text-xs text-slate-400">
                Issue proof-of-purchase for <strong className="text-emerald-400">"{listing.title}"</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Buyer Full Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Tunde Bakare"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Buyer Phone Number</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Agreed Final Price (₦ NGN)</label>
                  <input
                    type="number"
                    required
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    placeholder="e.g. 450000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-extrabold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bank Transfer">Bank Transfer (Opay/Paga/GTB)</option>
                    <option value="Cash Handover">Cash Handover</option>
                    <option value="Escrow Protocol">Sealify Safe Escrow</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Exchange Spot / Store Address</label>
                <input
                  type="text"
                  required
                  value={meetupLocation}
                  onChange={(e) => setMeetupLocation(e.target.value)}
                  placeholder="e.g. Ogbomoso Divisional Police HQ Safe Zone"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Preview & Issue Digital Receipt</span>
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Printable Receipt Preview Card */}
            <div id="printable-receipt" className="bg-white text-slate-950 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl border-4 border-emerald-500/40 relative font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">SEALIFY NIGERIA</h3>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Transaction Receipt</p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xs font-black text-emerald-700">{receiptId}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{currentDate}</p>
                </div>
              </div>

              {/* Details table */}
              <div className="space-y-3 text-xs">
                <div className="bg-slate-100 p-3 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Classified Item</span>
                    <strong className="text-sm text-slate-900 leading-snug">{listing.title}</strong>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {listing.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] font-bold uppercase block">Seller Name</span>
                    <strong className="text-slate-800">{listing.sellerName}</strong>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] font-bold uppercase block">Buyer Name</span>
                    <strong className="text-slate-800">{buyerName || 'Verified Buyer'}</strong>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] font-bold uppercase block">Payment Method</span>
                    <strong className="text-slate-800">{paymentMethod}</strong>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] font-bold uppercase block">Exchange Location</span>
                    <strong className="text-slate-800 truncate block">{meetupLocation}</strong>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-emerald-800 uppercase block">Total Amount Transacted</span>
                    <span className="text-xs text-emerald-600 font-bold">100% Fully Settled</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-700">{formatNGN(finalAmount)}</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-3">
                  <img src={qrDataUrl} alt="QR Code" className="w-12 h-12 border rounded" />
                  <div>
                    <p className="font-bold text-slate-800">Sealify Security Stamp</p>
                    <p>Ogbomosoland Hub • Oyo State</p>
                  </div>
                </div>

                <div className="text-right font-mono text-[9px] text-emerald-700 font-bold">
                  ✓ AUTHENTICATED
                </div>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleCopyText}
                className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={handleSendToBuyer}
                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send to Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionReceiptModal;