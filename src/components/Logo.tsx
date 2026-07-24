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
          {/* Shopping Bag Body */}
          <path 
            d="M20 30C20 27.2386 22.2386 25 25 25H75C77.7614 25 80 27.2386 80 30V85C80 90.5228 75.5228 95 70 95H30C24.4772 95 20 90.5228 20 85V30Z" 
            fill="#1e3a8a" 
          />
          
          {/* Left Side Highlight (Teal) */}
          <path 
            d="M20 30C20 27.2386 22.2386 25 25 25H30V95H25C22.2386 95 20 92.7614 20 90V30Z" 
            fill="#0d9488" 
          />

          {/* Bag Handles */}
          <path 
            d="M35 25C35 16.7157 41.7157 10 50 10C58.2843 10 65 16.7157 65 25" 
            stroke="#0d9488" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
          <circle cx="35" cy="25" r="3" fill="white" />
          <circle cx="65" cy="25" r="3" fill="white" />

          {/* Stylized 'S' with Arrow */}
          <path 
            d="M32 75C45 75 55 65 65 60M65 35C45 35 35 45 35 55" 
            stroke="white" 
            strokeWidth="10" 
            strokeLinecap="round" 
          />
          
          {/* Golden Arrow Part of 'S' */}
          <path 
            d="M35 75L62 55L58 48L35 75Z" 
            fill="#fbbf24" 
          />
          <path 
            d="M62 55L50 58" 
            stroke="#fbbf24" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
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