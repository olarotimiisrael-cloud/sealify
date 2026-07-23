import React from 'react';
import { X, ShieldCheck, Building2, Crown, Sparkles, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrustBadgeExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVerification?: () => void;
}

export const TrustBadgeExplainerModal: React.FC<TrustBadgeExplainerModalProps> = ({
  isOpen,
  onClose,
  onApplyVerification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sealify Verification Framework</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Understand how seller identity and business registration badges build 100% buyer trust in Ogbomoso & across Nigeria.
          </p>
        </div>

        {/* Badge Tiers Grid */}
        <div className="space-y-3">
          {/* Tier 1: Individual ID */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified ID (Individual)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Level 1 Trust</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Issued to individual sellers who submit a valid government ID card (NIN, Driver's License, or Voter's Card) verified by Sealify administrators.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Protects buyers against identity spoofing and scam accounts</span>
            </div>
          </div>

          {/* Tier 2: Verified Business */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs">
                <Building2 className="w-4 h-4" />
                <span>Verified Business (CAC)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Level 2 Merchant</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Granted to registered companies and local stores in Ogbomosoland that submit official Corporate Affairs Commission (CAC) certificates or tax registration documents.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Includes Storefront Branding & Business Directory Listing</span>
            </div>
          </div>

          {/* Tier 3: Premium Verified */}
          <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-black text-purple-200 bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 rounded-full text-xs shadow-md">
                <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Premium Verified Merchant</span>
              </span>
              <span className="text-[10px] text-purple-400 font-mono font-bold">Top 1% Vendor</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reserved for top-rated merchants with verified identity, active Top Ad promotions, and 98%+ positive buyer reviews.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold pt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Gets 5x higher search placement and animated glowing profile ring</span>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            Close Guide
          </button>

          {onApplyVerification && (
            <button
              onClick={() => {
                onClose();
                onApplyVerification();
              }}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Apply For Badge Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrustBadgeExplainerModal;