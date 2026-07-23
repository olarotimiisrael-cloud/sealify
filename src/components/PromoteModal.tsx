import React, { useState, useRef } from 'react';
import { 
  X, 
  Zap, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  CreditCard, 
  Building, 
  Smartphone, 
  Crown,
  Calendar,
  DollarSign,
  ArrowRight,
  Lock,
  Upload
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

interface DurationPlan {
  months: number;
  label: string;
  monthlyRateNGN: number;
  discountPercent: number;
  badge: string;
}

const DURATION_PLANS: DurationPlan[] = [
  { months: 1, label: '1 Month', monthlyRateNGN: 15000, discountPercent: 0, badge: 'STARTER' },
  { months: 3, label: '3 Months', monthlyRateNGN: 13000, discountPercent: 13, badge: 'POPULAR (13% OFF)' },
  { months: 6, label: '6 Months', monthlyRateNGN: 11500, discountPercent: 23, badge: 'SAVER (23% OFF)' },
  { months: 12, label: '1 Year (12 Mo)', monthlyRateNGN: 9500, discountPercent: 36, badge: 'MAX IMPACT (36% OFF)' },
];

export const PromoteModal: React.FC<PromoteModalProps> = ({
  isOpen,
  onClose,
  listing,
  onPromoteSuccess,
}) => {
  const { submitPromotionPaymentRequest } = useSealify();
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd' | 'paystack' | 'opay'>('card');
  const [step, setStep] = useState<'plan' | 'payment' | 'processing'>('plan');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [paymentProof, setPaymentProof] = useState<string | null>(null); // for Opay proof upload

  if (!isOpen || !listing) return null;

  const currentPlan = DURATION_PLANS.find((p) => p.months === selectedMonths) || DURATION_PLANS[0];
  const totalPriceNGN = currentPlan.monthlyRateNGN * currentPlan.months;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    if (paymentMethod === 'opay') {
      if (!paymentProof) {
        toast.error('Please upload payment proof');
        setStep('payment');
        return;
      }
      // Submit payment proof request
      submitPromotionPaymentRequest({
        userId: listing.sellerId,
        listingId: listing.id,
        amount: totalPriceNGN,
        paymentMethod: 'opay',
        paymentProofUrl: paymentProof,
        planName: currentPlan.label,
        durationMonths: selectedMonths
      });
      // Simulate admin processing delay
      setTimeout(() => {
        toast.success('Payment proof submitted. Awaiting admin verification.');
        setStep('plan');
        onClose();
      }, 2000);
    } else {
      // For other payment methods, simulate payment processing
      setTimeout(() => {
        if (onPromoteSuccess) {
          onPromoteSuccess(listing.id, selectedMonths, `${currentPlan.label} Top Ad Promotion`);
        }
        toast.success(`🎉 ${formatNGN(totalPriceNGN)} Payment Confirmed! "${listing.title}" is now Promoted as Top Ad & user upgraded to Premium Verified!`);
        setStep('plan');
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            setStep('plan');
            onClose();
          }}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'processing' ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Processing NGN Payment...</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Connecting to secure payment gateway. Activating <strong>{currentPlan.label} TOP AD</strong> promotion for {listing.title}...
            </p>
          </div>
        ) : step === 'plan' ? (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <h2 className="text-2xl font-black text-white">Promote Ad & Get Premium Badge</h2>
              <p className="text-xs text-slate-400">
                Boost views by <strong className="text-emerald-400">up to 10x</strong> for: <strong className="text-edge-200">{listing.title}</strong>
              </p>
            </div>

            {/* Select Duration (1 Month Upward) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Promotion Duration (Monthly Plan)</span>
                <span className="text-emerald-400 text-[10px] lowercase font-mono">starts from 1 month</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DURATION_PLANS.map((plan) => {
                  const isSelected = selectedMonths === plan.months;
                  const totalPlanNGN = plan.monthlyRateNGN * plan.months;

                  return (
                    <button
                      key={plan.months}
                      type="button"
                      onClick={() => setSelectedMonths(plan.months)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 text-white ring-2 ring-purple-500/40 shadow-xl'
                          : 'border-slate-800 bg-slate-950/80 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-sm text-white">{plan.label}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {plan.badge}
                        </span>
                      </div>

                      <div className="pt-1">
                        <p className="text-lg font-black text-emerald-400">{formatNGN(totalPlanNGN)}</p>
                        <p className="text-[10px] text-slate-400">({formatNGN(plan.monthlyRateNGN)} / month)</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto-Calculated Charge Box */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Selected Duration:</span>
                <span className="font-bold text-white">{currentPlan.label}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Bonus Included:</span>
                <span className="font-bold text-purple-300 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-300" /> Premium Verified Badge
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 uppercase">Total Auto-Calculated Charge:</span>
                <span className="text-xl font-black text-emerald-400">{formatNGN(totalPriceNGN)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Proceed to Multiple Payment Gateway ({formatNGN(totalPriceNGN)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Payment Step */
          <form onSubmit={handleExecutePayment} className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-lg text-white">Select Payment Channel</h3>
                <p className="text-xs text-slate-400">Total Due: <strong className="text-emerald-400">{formatNGN(totalPriceNGN)}</strong> ({currentPlan.label})</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('plan')}
                className="text-xs text-slate-400 hover:text-white underline font-semibold"
              >
                Change Plan
              </button>
            </div>

            {/* Multiple Payment Options Tabs */}
            <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-colors flex flex-col items-center gap-1 ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-colors flex flex-col items-center gap-1 ${
                  paymentMethod === 'transfer'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ussd')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-colors flex flex-col items-center gap-1 ${
                  paymentMethod === 'ussd'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>USSD</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paystack')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-colors flex flex-col items-center gap-1 ${
                  paymentMethod === 'paystack'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Paystack</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('opay')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-colors flex flex-col items-center gap-1 ${
                  paymentMethod === 'opay'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Opay</span>
              </button>
            </div>

            {/* Option 1: Card */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Debit / Credit Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">CVV / CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Option 2: Bank Transfer */}
            {paymentMethod === 'transfer' && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
                <p className="text-slate-400 font-medium">Transfer exact amount to the dedicated Sealify account below:</p>
                <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-400">Bank Name: <strong className="text-white">GTBank / Moniepoint MFB</strong></p>
                  <p className="text-slate-400">Account Number: <strong className="text-emerald-400 font-mono text-base">08131208468</strong></p>
                  <p className="text-slate-400">Account Name: <strong className="text-white">Sealify Marketplace Ad Hub</strong></p>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold">⚡ Instant auto-detection enabled upon transfer.</p>
              </div>
            )}

            {/* Option 3: USSD */}
            {paymentMethod === 'ussd' && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2 text-center">
                <p className="text-slate-300 font-bold">Dial USSD Code on your registered mobile phone:</p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-lg font-black text-amber-400">
                  *737*33*{totalPriceNGN}#
                </div>
                <p className="text-[10px] text-slate-400">Supported for GTBank, Zenith, Access, FirstBank, UBA & Kuda</p>
              </div>
            )}

            {/* Option 4: Paystack / Flutterwave Gateway */}
            {paymentMethod === 'paystack' && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2 text-center">
                <Sparkles className="w-8 h-8 text-teal-400 mx-auto" />
                <p className="font-bold text-white">Online Gateway Checkout</p>
                <p className="text-slate-400">You will be securely redirected to Paystack / Flutterwave NGN Gateway.</p>
              </div>
            )}

            {/* Option 5: Opay */}
            {paymentMethod === 'opay' && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
                <p className="text-slate-400 font-medium">Make payment to Opay account:</p>
                <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-400">Account Number: <strong className="text-emerald-400 font-mono text-base">6117594285</strong></p>
                  <p className="text-slate-400">Account Name: <strong className="text-white">Israel Ogunpade</strong></p>
                  <p className="text-slate-400">Use Ad ID as description: <strong className="text-emerald-400">{listing.id}</strong></p>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Upload Payment Proof (JPG/PNG) *</label>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setPaymentProof(event.target?.result as string);
                        toast.success('Payment proof uploaded');
                      };
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                      paymentProof ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950 hover:border-emerald-500/50'
                    }`}
                  >
                    {paymentProof ? (
                      <>
                        <Check className="w-8 h-8 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400">Payment proof attached</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Click to upload payment proof</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold">⚡ After upload, submit to verify.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Confirm & Pay {formatNGN(totalPriceNGN)}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PromoteModal;