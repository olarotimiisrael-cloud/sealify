import React from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, DollarSign, Eye, ArrowRight, ShieldAlert, FileText } from 'lucide-react';

interface EscrowProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EscrowProtectionModal: React.FC<EscrowProtectionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Sealify Safe Trading & Escrow Protocol</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Our 3-step protection framework ensuring 0% scam rate across Ogbomosoland and Oyo State
          </p>
        </div>

        {/* Steps Grid */}
        <div className="space-y-3">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Physical Inspection First</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meet the seller in a public <strong>Verified Safe Exchange Spot</strong> (such as Ogbomoso Police HQ or LAUTECH Gate). Inspect and test the product thoroughly before making any payment.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span>Direct / Verified Payment Handover</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only transfer payment or release funds after you have personally verified that the item condition matches the description in the ad.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>"Seal" Transaction & Review Seller</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once payment is confirmed, mark the deal as complete and leave a review for the seller to boost community trust.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Golden Rule of Marketplace Safety</span>
          </div>
          <p className="text-amber-200 leading-relaxed">
            <strong>NEVER send commitment fees, advance delivery deposits, or wire transfers</strong> to sellers prior to seeing and inspecting the physical product. Sealify will never ask for your password or SMS OTP.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>I Understand & Agree to Safe Trading Protocol</span>
        </button>
      </div>
    </div>
  );
};

export default EscrowProtectionModal;