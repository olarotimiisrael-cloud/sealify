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
  // the built-in mark is used during load and on any metadata outage.
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
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Falcon Body - streamlined shape */}
          <ellipse 
            cx="50" 
            cy="55" 
            rx="22" 
            ry="28" 
            fill="#10b981" 
          />
          
          {/* Falcon Head */}
          <circle 
            cx="50" 
            cy="30" 
            r="14" 
            fill="#0d9488" 
          />
          
          {/* Falcon Beak - sharp and prominent */}
          <path 
            d="M50 22L62 16L50 30L38 16L50 22Z" 
            fill="#fbbf24" 
          />
          
          {/* Falcon Eye - sharp and focused */}
          <circle 
            cx="55" 
            cy="28" 
            r="3" 
            fill="white" 
          />
          <circle 
            cx="56" 
            cy="28" 
            r="1.5" 
            fill="#000" 
          />
          
          {/* Falcon Wing - left side */}
          <path 
            d="M28 50C28 40 35 35 45 35C40 45 38 55 35 65C30 60 28 55 28 50Z" 
            fill="#047857" 
          />
          
          {/* Falcon Wing - right side */}
          <path 
            d="M72 50C72 40 65 35 55 35C60 45 62 55 65 65C70 60 72 55 72 50Z" 
            fill="#065f46" 
          />
          
          {/* Falcon Tail - pointed downward */}
          <path 
            d="M50 83L42 95H58L50 83Z" 
            fill="#065f46" 
          />
          
          {/* Falcon Chest - highlight */}
          <path 
            d="M40 55C40 50 45 48 50 48C55 48 60 50 60 55C60 60 55 62 50 62C45 62 40 60 40 55Z" 
            fill="#a7f3d0" 
            opacity="0.6"
          />
        </svg>
        )}
      </div>

      {withText && (
        <span className={`font-black tracking-tighter ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'} ${textColor}`}>
          {head && <>{head} </>}
          <span className="text-emerald-500">{tail}</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
