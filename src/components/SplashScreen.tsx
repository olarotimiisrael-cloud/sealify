"use client";

import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { ShieldCheck, Globe, MapPin } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Start fade out after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    // Completely remove from DOM after transition
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none scale-110'
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center space-y-8 animate-in zoom-in-95 fade-in duration-1000">
        {/* Logo with massive glow */}
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/40 transition-colors duration-700"></div>
          <Logo size="xl" withText={false} className="relative z-10 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]" />
        </div>

        {/* High-Impact Typography */}
        <div className="text-center space-y-4">
          <div className="overflow-hidden">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none animate-in slide-in-from-bottom-8 duration-700 delay-300">
              SEAL<span className="text-emerald-500">IFY</span>
            </h1>
          </div>
          
          <div className="flex flex-col items-center gap-3">
             <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-in stretch-in duration-1000 delay-500"></div>
             
             <p className="text-sm sm:text-lg font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                <span className="text-emerald-500">Trusted</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span>in Ogbomoso</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span className="text-emerald-500">Nigeria</span>
             </p>
          </div>
        </div>
      </div>

      {/* Footer Vitals */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest animate-in fade-in duration-1000 delay-1000">
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
            <span>Verified Node</span>
         </div>
         <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500/50" />
            <span>National Hub</span>
         </div>
         <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500/50" />
            <span>Oyo State</span>
         </div>
      </div>

      {/* Loading bar progress simulation */}
      <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-[2200ms] ease-out w-full origin-left animate-in slide-in-from-left-full"></div>
    </div>
  );
};

export default SplashScreen;