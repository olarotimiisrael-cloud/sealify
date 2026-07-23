"use client";

import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  withText = true, 
  textColor = "text-white",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-9",
    lg: "h-12",
    xl: "h-16"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} aspect-square relative`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Outer Shield / Seal Shape */}
          <path 
            d="M50 5L15 20V45C15 67.5 30 88 50 95C70 88 85 67.5 85 45V20L50 5Z" 
            fill="url(#logo-gradient)" 
          />
          
          {/* Inner Stylized 'S' for Sealify */}
          <path 
            d="M65 35H42C38 35 35 38 35 42C35 46 38 49 42 49H58C62 49 65 52 65 56C65 60 62 63 58 63H35M65 35V28M35 63V70" 
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Gloss/Highlight Effect */}
          <path 
            d="M50 15L75 25V45C75 58 68 70 58 78" 
            stroke="white" 
            strokeOpacity="0.2" 
            strokeWidth="2" 
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="logo-gradient" x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" /> {/* Emerald 500 */}
              <stop offset="1" stopColor="#0d9488" /> {/* Teal 600 */}
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {withText && (
        <span className={`font-black tracking-tighter ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'} ${textColor}`}>
          Seal<span className="text-emerald-500">ify</span>
        </span>
      )}
    </div>
  );
};

export default Logo;