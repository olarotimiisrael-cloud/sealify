import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, DollarSign, Send, ArrowRight, Info, AlertTriangle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface EscrowInitiatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
  price: number;
  sellerName: string;
  onSendEscrowToChat?: (escrowMsg: string) => void;
}

export const EscrowInitiatorModal: React.FC<EscrowInitiatorModalProps> = ({
  isOpen,
  onClose,
  listingTitle,
  price,
  sellerName,
  onSendEscrowToChat,
}) => {
  const [agreedAmount, setAgreedAmount] = useState<string>(price ? price.toString() : '');
  const [inspectionSpot, setInspectionSpot] = useState('Ogbomoso Divisional Police HQ Safe Zone');
  const [paymentOption, setPaymentOption] = useState<'transfer' | 'card'>('transfer');
  const [step, setStep] = useState<'setup' | 'confirmed'>('setup');
  const [escrowCode, setEscrowCode] = useState('');

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const numericAmount = Number(agreedAmount) || price;

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Please enter a valid transacted amount');
      return;
    }

    const generatedCode = `ESC-${Math.floor(100000 + Math.random() * 900000)}`;
    setEscrowCode(generatedCode);
    setStep('confirmed');
  };

  const handleSendToChat = () => {
    const escrowMsg = `🔒 SEALIFY SAFE ESCROW VAULT INITIATED
Lock Code: ${escrowCode}
Item: ${listingTitle}
Locked Amount: ${formatNGN(numericAmount)}
Seller: ${sellerName}
Release Condition: Physical inspection & buyer approval at ${inspectionSpot}
Status: ⏳ FUNDS LOCKED IN VAULT (Pending Physical Handover)`;

    if (onSendEscrowToChat) {
      onSendEscrowToChat(escrowMsg);
    }

    toast.success('Escrow Vault proposal dispatched to conversation thread!');
    onClose();
    setStep('setup');
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

        {step === 'setup' ? (
          <form onSubmit={handleInitiate} className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/30">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Initiate Safe Escrow Lock</h2>
              <p className="text-xs text-slate-400">
                Hold transaction funds securely until product is tested in person
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Target Item</span>
              <p className="font-bold text-sm text-white truncate">{listingTitle}</p>
              <p className="text-xs text-slate-400">Seller: <strong className="text-emerald-400">{sellerName}</strong></p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Agreed Deal Price (₦ NGN) *</label>
                <input
                  type="number"
                  required
                  value={agreedAmount}
                  onChange={(e) => setAgreedAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Designated Meetup Spot *</label>
                <input
                  type="text"
                  required
                  value={inspectionSpot}
                  onChange={(e) => setInspectionSpot(e.target.value)}
                  placeholder="e.g. Ogbomoso Police HQ or LAUTECH Gate"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Payment Vault Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('transfer')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentOption === 'transfer'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Direct Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('card')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentOption === 'card'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Online Debit Card
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2 text-[11px] text-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Funds remain locked in Sealify Escrow Vault until you perform physical inspection and confirm satisfaction.</span>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Lock {formatNGN(numericAmount)} in Escrow Vault</span>
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Escrow Vault Active!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Funds are held in secure neutral custody for <strong className="text-white">"{listingTitle}"</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-teal-500/40 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Unique Escrow Lock Code</span>
              <p className="font-mono text-2xl font-black text-emerald-400 tracking-widest">{escrowCode}</p>
              <p className="text-[10px] text-slate-400">Locked Amount: <strong className="text-white">{formatNGN(numericAmount)}</strong></p>
            </div>

            <button
              type="button"
              onClick={handleSendToChat}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Post Escrow Receipt into Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowInitiatorModal;