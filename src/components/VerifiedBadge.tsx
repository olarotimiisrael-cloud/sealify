import React from 'react';
import { ShieldCheck, Building2, Crown, Sparkles } from 'lucide-react';
import { VerificationBadgeType } from '../types/sealify';

interface VerifiedBadgeProps {
  type?: VerificationBadgeType;
  showText?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = 'individual',
  showText = false,
  className = '',
}) => {
  if (type === 'none') return null;

  if (type === 'premium') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-black text-purple-200 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 border border-purple-400/50 px-2.5 py-0.5 rounded-full text-[10px] shadow-lg shadow-purple-900/40 animate-pulse ${className}`}
        title="Sealify Premium Paid Verified Member"
      >
        <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        {showText ? <span>Premium Verified</span> : <Sparkles className="w-2.5 h-2.5 text-amber-300" />}
      </span>
    );
  }

  if (type === 'business') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] ${className}`}
        title="Verified Registered Business"
      >
        <Building2 className="w-3.5 h-3.5 text-amber-400" />
        {showText && <span>Verified Business</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] ${className}`}
      title="Verified Individual Seller"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      {showText && <span>Verified ID</span>}
    </span>
  );
};

export default VerifiedBadge;