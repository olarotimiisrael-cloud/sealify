"use client";

import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-react';

const TutorialVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="relative w-full aspect-video bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group">
      {/* AI Explainer Interface Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Animated Scanning Line */}
        {isPlaying && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan"></div>
        )}
        
        {/* Corner Accents */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-xl"></div>
        <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-xl"></div>
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-xl"></div>
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-emerald-500/30 rounded-br-xl"></div>

        {/* Dynamic HUD Data */}
        <div className="absolute top-8 left-12 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sealify Intelligence Core</span>
          </div>
          <p className="text-[8px] text-slate-500 font-mono">STREAMING LOCAL PROTOCOL: OGB-72</p>
        </div>

        <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
          <div className="space-y-2 max-w-xs">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-2xl">
              <p className="text-[10px] font-bold text-white leading-relaxed">
                {isPlaying 
                  ? "Analyzing marketplace patterns... Ensuring 100% secure peer-to-peer verification in Ogbomosoland."
                  : "Ready to launch Sealify explainer module. Click play to visualize the ecosystem."}
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-col gap-2">
             <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-400 uppercase">Secure Exchange</span>
             </div>
             <div className="bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                <Globe className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase">Verified Nodes</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/20">
        {!isPlaying ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
              <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                <Play className="w-8 h-8 text-emerald-400 fill-emerald-400 ml-1" />
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Platform Explainer</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Powered by AI Vision</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
             {/* This represents the "Video Content" */}
             <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/30 animate-pulse">
                <Sparkles className="w-12 h-12 text-emerald-400" />
             </div>
             <div className="space-y-2 max-w-sm">
                <h4 className="text-2xl font-black text-white">The Future of Local Trade</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Sealify uses advanced identity verification and safe-zone mapping to make selling in Ogbomoso effortless.</p>
             </div>
          </div>
        )}
      </div>

      {/* Video Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-slate-800 rounded-lg text-white transition-colors">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden">
             <div className={`h-full bg-emerald-500 transition-all duration-300 ${isPlaying ? 'w-1/3' : 'w-0'}`}></div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">01:42 / 03:00</span>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-slate-800 rounded-lg text-white transition-colors">
             {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
           </button>
           <button className="p-2 hover:bg-slate-800 rounded-lg text-white transition-colors">
             <Maximize className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Interactive Play/Pause Area */}
      <button 
        onClick={() => setIsPlaying(!isPlaying)} 
        className="absolute inset-0 z-0 cursor-pointer w-full h-full"
      />
    </div>
  );
};

export default TutorialVideo;