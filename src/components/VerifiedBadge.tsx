import React, { useState } from 'react';
import { ShieldCheck, Building2, Crown, Sparkles, GraduationCap } from 'lucide-react';
import { VerificationBadgeType } from '../types/sealify';
import TrustBadgeExplainerModal from './TrustBadgeExplainerModal';

interface VerifiedBadgeProps {
  type?: VerificationBadgeType;
  showText?: boolean;
  className?: string;
  enableModalClick?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = 'individual',
  showText = false,
  className = '',
  enableModalClick = true,
}) => {
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  if (type === 'none') return null;

  const handleClick = (e: React.MouseEvent) => {
    if (enableModalClick) {
      e.preventDefault();
      e.stopPropagation();
      setIsExplainerOpen(true);
    }
  };

  const renderBadge = () => {
    if (type === 'premium') {
      return (
        <span
          onClick={handleClick}
          className={`inline-flex items-center gap-1 font-black text-purple-200 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 border border-purple-400/50 px-2.5 py-0.5 rounded-full text-[10px] shadow-lg shadow-purple-900/40 animate-pulse cursor-pointer hover:scale-105 transition-transform ${className}`}
          title="Sealify Premium Verified Member — Click to learn more"
        >
          <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          {showText ? <span>Premium Verified</span> : <Sparkles className="w-2.5 h-2.5 text-amber-300" />}
        </span>
      );
    }

    if (type === 'business') {
      return (
        <span
          onClick={handleClick}
          className={`inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] cursor-pointer hover:scale-105 transition-transform ${className}`}
          title="Verified Registered Business (CAC) — Click to learn more"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          {showText && <span>Verified Business</span>}
        </span>
      );
    }

    if (type === 'student') {
      return (
        <span
          onClick={handleClick}
          className={`inline-flex items-center gap-1 font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] cursor-pointer hover:scale-105 transition-transform ${className}`}
          title="Verified Student ID (Campus Community) — Click to learn more"
        >
          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
          {showText && <span>Verified Student</span>}
        </span>
      );
    }

    return (
      <span
        onClick={handleClick}
        className={`inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] cursor-pointer hover:scale-105 transition-transform ${className}`}
        title="Verified Individual ID — Click to learn more"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        {showText && <span>Verified ID</span>}
      </span>
    );
  };

  return (
    <>
      {renderBadge()}
      <TrustBadgeExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </>
  );
};

export default VerifiedBadge;