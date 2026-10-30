"use client";

import React from 'react';
import { useSiteMetadata } from '@/context/SiteMetadataContext';

interface LogoProps {
  className?: string;
  withText?: boolean;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Overrides the site name from administrator-managed settings. */
  name?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  withText = true,
  textColor = "text-slate-900",
  size = 'md',
  name,
}) => {
  const { resolved, error } = useSiteMetadata();

  const sizeClasses = {
    sm: "h-6",
    md: "h-9",
    lg: "h-12",
    xl: "h-16"
  };

  // Only honour the uploaded logo once the metadata service has answered, so
  // the built-in shopping-bag mark is used during load and on any metadata
  // outage. This guarantees the logo never fails to render.
  const logoUrl = error === null ? resolved.logoUrl : '';
  const siteName = name || (error === null ? resolved.siteName : '') || 'Sealify';

  // Administrators may brand as "Marketplace Name"; the final word keeps the
  // two-tone treatment when the name is a single word such as "Sealify".
  const words = siteName.trim().split(/\s+/).filter(Boolean);
  const head = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const tail = words.length > 1 ? words[words.length - 1] : siteName;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} aspect-square relative shrink-0`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={siteName}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        ) : (
          // Built-in shopping-bag brand mark (always renders, never 404s).
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-lg"
          >
            {/* Bag body */}
            <path
              d="M16 20C16 12 22 8 32 8S48 12 48 20V42H16V20Z"
              fill="#10b981"
            />
            {/* Bag fold / top rim */}
            <path
              d="M16 20C16 12 22 8 32 8S48 12 48 20H16Z"
              fill="#059669"
            />
            {/* Left handle */}
            <path
              d="M24 20C24 10 28 6 32 6C36 6 40 10 40 20"
              fill="#10b981"
            />
            <path
              d="M24 20C24 10 28 6 32 6C36 6 40 10 40 20"
              stroke="#059669"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Right handle */}
            <path
              d="M32 20C36 20 40 16 40 12C40 8 36 4 32 4C28 4 24 8 24 12C24 16 28 20 32 20"
              fill="#10b981"
            />
            <path
              d="M32 20C36 20 40 16 40 12C40 8 36 4 32 4C28 4 24 8 24 12C24 16 28 20 32 20"
              stroke="#059669"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Seal / verified checkmark on bag */}
            <path
              d="M20 36L25 41L38 28"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle
              cx="20"
              cy="36"
              r="4"
              fill="#059669"
            />
          </svg>
        )}
      </div>

      {withText && (
        <span className={`font-black tracking-tighter ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'} ${textColor}`}>
          {head && <>{head} </>}
          <span className="text-emerald-600">{tail}</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
