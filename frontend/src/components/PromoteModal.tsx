import React, { useState } from 'react';
import { 
  X, Zap, ShieldCheck, Check, Sparkles, CreditCard, 
  Crown, ArrowRight, Upload, ExternalLink, Info, Copy, CheckCircle2
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

export const PromoteModal: React.FC<PromoteModalProps> = ({
  isOpen, onClose, listing, onPromoteSuccess,
}) => {
  const { submitPromotionPaymentRequest, user, promotionPlans } = useSealify();
  const [selectedMonths, setSelectedMonths] = useState<number>(promotionPlans[0]?.months || 1);
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'paga'>('gateway');
  const [step, setStep] = useState<'plan' | 'payment' | 'confirmation'>('plan');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [gatewayRef, setGatewayRef] = useState<string>('');

  if (!isOpen || !listing) return null;

  const currentPlan = promotionPlans.find(p => p.months === selectedMonths) || promotionPlans[0];
  const total = currentPlan ? currentPlan.rate * currentPlan.months : 15000;

  const handleCopyAdId = () => {
    navigator.clipboard.writeText(listing.id);
    toast.success(`Ad ID "${listing.id}" copied to clipboard! Paste this as your transfer narration.`);
  };

  const handleGatewaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPromotionPaymentRequest({
      userId: user?.id || listing.sellerId,
      listingId: listing.id,
      amount: total,
      paymentMethod: 'card',
      paymentProofUrl: gatewayRef ? `Gateway Ref: ${gatewayRef}` : 'Flutterwave Online Checkout',
      planName: currentPlan.label,
      durationMonths: selectedMonths
    });
    
    if (onPromoteSuccess) {
      onPromoteSuccess(listing.id, selectedMonths, currentPlan.label);
    }

    setStep('confirmation');
  };

  const handlePagaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      toast.error('Please upload a screenshot of your payment receipt');
      return;
    }
    submitPromotionPaymentRequest({
      userId: user?.id || listing.sellerId,
      listingId: listing.id,
      amount: total,
      paymentMethod: 'opay',
      paymentProofUrl: receipt,
      planName: currentPlan.label,
      durationMonths: selectedMonths
    });

    if (onPromoteSuccess) {
      onPromoteSuccess(listing.id, selectedMonths, currentPlan.label);
    }

    setStep('confirmation');
  };

  const handleResetAndClose = () => {
    setStep('plan');
    setReceipt(null);
    setGatewayRef('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
        <button onClick={handleResetAndClose} className="absolute top-6 right-6 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>

        {step === 'plan' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Boost Your Classified Ad</h2>
              <p className="text-xs text-slate-600">Promote <strong className="text-emerald-600">"{listing.title}"</strong> for maximum visibility</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promotionPlans.map((plan) => (
                <button
                  key={plan.months}
                  type="button"
                  onClick={() => setSelectedMonths(plan.months)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedMonths === plan.months ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/30' : 'border-slate-200 bg-white/50 text-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-sm text-slate-900">{plan.label}</span>
                    <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded uppercase">{plan.badge}</span>
                  </div>
                  <p className="text-xl font-black text-emerald-600">₦{(plan.rate * plan.months).toLocaleString()}</p>
                  <p className="text-[10px]">₦{plan.rate.toLocaleString()} / month</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep('payment')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-colors"
            >
              <span>Continue to Secure Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-black">Choose Payment Method</h3>
              <span className="text-emerald-600 font-black text-lg">₦{total.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPaymentMethod('gateway')}
                className={`py-3 rounded-xl text-xs font-black transition-all ${paymentMethod === 'gateway' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-600'}`}
              >
                Flutterwave Secure
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paga')}
                className={`py-3 rounded-xl text-xs font-black transition-all ${paymentMethod === 'paga' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-600'}`}
              >
                Paga / Direct Transfer
              </button>
            </div>

            {paymentMethod === 'gateway' ? (
              <form onSubmit={handleGatewaySubmit} className="space-y-4">
                <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 text-center">
                  <CreditCard className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click below to open our encrypted Flutterwave gateway to complete payment via Card, Bank Transfer, or USSD.
                  </p>
                  
                  <a
                    href="https://flutterwave.com/pay/8eqijxd7cmv1"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-slate-900 font-black rounded-2xl shadow-lg transition-transform active:scale-95 text-xs"
                  >
                    <span>Launch Flutterwave Checkout</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <div className="pt-3 border-t border-slate-200 space-y-2 text-left">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Gateway Reference / Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={gatewayRef}
                      onChange={(e) => setGatewayRef(e.target.value)}
                      placeholder="e.g. FLW-29401824"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-colors text-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Notify Admin & Activate Promotion</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handlePagaSubmit} className="space-y-4">
                <div className="bg-white p-4 rounded-3xl border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 text-xs font-black uppercase tracking-widest">
                    <Info className="w-4 h-4" />
                    <span>Direct Transfer Details</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p>Bank: <strong className="text-slate-900">Paga</strong></p>
                    <p>Acc Number: <strong className="text-emerald-600 font-mono text-base">6117594285</strong></p>
                    <p>Acc Name: <strong className="text-slate-900">Israel Ogunpade</strong></p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase font-black">Mandatory Transfer Narration / Ad ID:</p>
                      <p className="font-mono text-slate-900 font-black text-xs">{listing.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAdId}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-emerald-600 rounded-xl text-xs flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase">Upload Payment Screenshot *</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setReceipt(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    }
                  }} className="hidden" id="proof-upload" />
                  <label htmlFor="proof-upload" className={`w-full py-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${receipt ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 hover:border-emerald-500/50'}`}>
                    {receipt ? <Check className="w-8 h-8 text-emerald-600" /> : <Upload className="w-8 h-8 text-slate-600" />}
                    <span className="text-[10px] font-black uppercase">{receipt ? 'Receipt Attached' : 'Select Payment Screenshot'}</span>
                  </label>
                </div>

                <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-colors text-xs flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Proof & Activate Ad</span>
                </button>
              </form>
            )}
          </div>
        )}

        {step === 'confirmation' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Promotion Request Submitted!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your promotion payment request for <strong className="text-emerald-600">"{listing.title}"</strong> has been logged in the Sealify Admin ledger. Your Top Ad boost will be active shortly after admin review.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-6 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition-colors shadow-lg"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoteModal;

