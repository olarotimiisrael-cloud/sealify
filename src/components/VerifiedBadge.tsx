import React from 'react';
import { ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
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