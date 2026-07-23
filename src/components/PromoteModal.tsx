import React, { useState, useRef } from 'react';
import { 
  X, Zap, ShieldCheck, Check, Sparkles, CreditCard, Building, 
  Smartphone, Crown, Calendar, DollarSign, ArrowRight, Lock, Upload,
  ExternalLink, Info, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';

interface PromoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onPromoteSuccess?: (listingId: string, durationMonths: number, planName: string) => void;
}

const DURATION_PLANS = [
  { months: 1, label: '1 Month', rate: 15000, badge: 'STARTER' },
  { months: 3, label: '3 Months', rate: 13000, badge: 'POPULAR (13% OFF)' },
  { months: 6, label: '6 Months', rate: 11500, badge: 'SAVER (23% OFF)' },
  { months: 12, label: '1 Year', rate: 9500, badge: 'MAX IMPACT (36% OFF)' },
];

export const PromoteModal: React.FC<PromoteModalProps> = ({
  isOpen, onClose, listing, onPromoteSuccess,
}) => {
  const { submitPromotionPaymentRequest } = useSealify();
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'paga'>('gateway');
  const [step, setStep] = useState<'plan' | 'payment'>('plan');
  const [receipt, setReceipt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !listing) return null;

  const currentPlan = DURATION_PLANS.find(p => p.months === selectedMonths)!;
  const total = currentPlan.rate * currentPlan.months;

  const handleCopyAdId = () => {
    navigator.clipboard.writeText(listing.id);
    toast.success(`Ad ID "${listing.id}" copied to clipboard! Paste this as your transfer narration.`);
  };

  const handlePagaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      toast.error('Please upload a screenshot of your payment receipt');
      return;
    }
    submitPromotionPaymentRequest({
      userId: listing.sellerId,
      listingId: listing.id,
      amount: total,
      paymentMethod: 'opay',
      paymentProofUrl: receipt,
      planName: currentPlan.label,
      durationMonths: selectedMonths
    });
    toast.success('Payment proof submitted! We have sent a confirmation to your email. Please wait for admin verification.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>

        {step === 'plan' ? (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <h2 className="text-2xl font-black text-white">Boost Your Classified Ad</h2>
              <p className="text-xs text-slate-400">Promote <strong className="text-emerald-400">"{listing.title}"</strong> for maximum visibility</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DURATION_PLANS.map((plan) => (
                <button
                  key={plan.months}
                  onClick={() => setSelectedMonths(plan.months)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedMonths === plan.months ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30' : 'border-slate-800 bg-slate-950/50 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-sm text-white">{plan.label}</span>
                    <span className="text-[8px] font-black bg-slate-800 px-2 py-0.5 rounded uppercase">{plan.badge}</span>
                  </div>
                  <p className="text-xl font-black text-emerald-400">₦{(plan.rate * plan.months).toLocaleString()}</p>
                  <p className="text-[10px]">₦{plan.rate.toLocaleString()} / month</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-colors"
            >
              <span>Continue to Secure Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black">Choose Payment Method</h3>
              <span className="text-emerald-400 font-black">₦{total.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                onClick={() => setPaymentMethod('gateway')}
                className={`py-3 rounded-xl text-xs font-black transition-all ${paymentMethod === 'gateway' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-500'}`}
              >
                Flutterwave Secure
              </button>
              <button
                onClick={() => setPaymentMethod('paga')}
                className={`py-3 rounded-xl text-xs font-black transition-all ${paymentMethod === 'paga' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-500'}`}
              >
                Paga / Direct Transfer
              </button>
            </div>

            {paymentMethod === 'gateway' ? (
              <div className="space-y-4 text-center py-4">
                <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                  <CreditCard className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm text-slate-300">Click the button below to pay via our encrypted Flutterwave gateway. Supports Card, Bank App, and USSD.</p>
                  <a
                    href="https://flutterwave.com/pay/8eqijxd7cmv1"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95"
                  >
                    <span>Launch Payment Gateway</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePagaSubmit} className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-3xl border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
                    <Info className="w-4 h-4" />
                    <span>Direct Transfer Instructions</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p>Bank: <strong className="text-white">Paga</strong></p>
                    <p>Acc Number: <strong className="text-emerald-400 font-mono text-base">6117594285</strong></p>
                    <p>Acc Name: <strong className="text-white">Israel Ogunpade</strong></p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black">Mandatory Transfer Narration / Ad ID:</p>
                      <p className="font-mono text-white font-black">{listing.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAdId}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase">Upload Payment Proof (JPG/PNG)</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setReceipt(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    }
                  }} className="hidden" id="proof-upload" />
                  <label htmlFor="proof-upload" className={`w-full py-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${receipt ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-emerald-500/50'}`}>
                    {receipt ? <Check className="w-8 h-8 text-emerald-400" /> : <Upload className="w-8 h-8 text-slate-600" />}
                    <span className="text-[10px] font-black uppercase">{receipt ? 'Receipt Attached' : 'Select Payment Screenshot'}</span>
                  </label>
                </div>

                <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-colors">Submit Proof & Activate Ad</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoteModal;