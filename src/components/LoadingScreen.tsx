import React from 'react';
import { ShieldCheck, Zap, MapPin, Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] transition-all duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center space-y-8 animate-in zoom-in-95 fade-in duration-1000">
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/40 transition-colors duration-700"></div>
          <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-lg">
            <path
              d="M20 30C20 27.2386 22.2386 25 25 25H75C77.7614 25 80 27.2386 80 30V85C80 90.5228 75.5228 95 70 95H30C24.4772 95 20 90.5228 20 85V30Z"
              fill="#1e3a8a"
            />
            <path
              d="M20 30C20 27.2386 22.2386 25 25 25H30V95H25C22.2386 95 20 92.7614 20 90V30Z"
              fill="#0d9488"
            />
            <path
              d="M35 25C35 16.7157 41.7157 10 50 10C58.2843 10 65 16.7157 65 25"
              stroke="#0d9488"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="35" cy="25" r="3" fill="white" />
            <circle cx="65" cy="25" r="3" fill="white" />
            <path
              d="M32 75C45 75 55 65 65 60M65 35C45 35 35 45 35 55"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
            />
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

        <div className="text-center space-y-4">
          <div className="overflow-hidden">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none animate-in slide-in-from-bottom-8 duration-700 delay-300">
              Seal<span className="text-emerald-500">ify</span>
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

      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest animate-in fade-in duration-1000 delay-1000">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
          <span>Verified Node</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500/50" />
          <span>Real-time</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400/50" />
          <span>Oyo State</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-[2200ms] ease-out w-full origin-left animate-in slide-in-from-left-full"></div>
    </div>
  );
};