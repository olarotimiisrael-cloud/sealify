"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles, ShieldCheck, Zap, Globe, Camera, MapPin, Tag, CheckCircle2, ArrowRight } from 'lucide-react';

const SCENES = [
  {
    id: 1,
    title: "1. Welcome to Sealify Nigeria",
    subtitle: "Ogbomoso & Oyo State Hyperlocal Marketplace",
    description: "Sealify connects local buyers and verified merchants seamlessly. Discover electronics, vehicles, real estate, and services with zero friction.",
    badge: "Ecosystem Overview",
    color: "from-emerald-500/20 to-teal-500/10",
    icon: Globe,
    hudText: "SCANNING LOCAL NODE: OGBOMOSO DISTRICT"
  },
  {
    id: 2,
    title: "2. List Items in 60 Seconds",
    subtitle: "AI Assistant & Price Valuation",
    description: "Snap photos, set your price with our Smart Valuation Calculator, and let AI generate compelling descriptions for high buyer conversion.",
    badge: "Smart Listing Engine",
    color: "from-purple-500/20 to-indigo-500/10",
    icon: Camera,
    hudText: "AI VISION & COPYWRITER CORE ACTIVE"
  },
  {
    id: 3,
    title: "3. Identity & CAC Verification",
    subtitle: "Verified Badges for Sellers",
    description: "Submit government ID or CAC documents to earn trusted verification badges. Verified merchants get up to 5x more direct buyer calls.",
    badge: "Forensic Trust Protocol",
    color: "from-amber-500/20 to-orange-500/10",
    icon: ShieldCheck,
    hudText: "NIN / CAC CREDENTIAL VALIDATION ENCRYPTED"
  },
  {
    id: 4,
    title: "4. Safe Meetup & Settlement",
    subtitle: "CCTV Spots & Digital Receipts",
    description: "Coordinate meetups at 50+ mapped Safe Spots (Police HQs & Malls), run physical checklist tests, and generate official sales receipts.",
    badge: "Safe Trade Protocol",
    color: "from-teal-500/20 to-emerald-500/10",
    icon: MapPin,
    hudText: "GEO-MAPPED SAFE EXCHANGE SPOTS ENABLED"
  }
];

export const TutorialVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          const newScene = Math.floor((next / 100) * SCENES.length);
          if (newScene < SCENES.length && newScene !== currentSceneIndex) {
            setCurrentSceneIndex(newScene);
          }
          return next;
        });
      }, 300); // 30 second simulated video length
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIndex]);

  const currentScene = SCENES[currentSceneIndex] || SCENES[0];
  const SceneIcon = currentScene.icon;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.round((clickX / rect.width) * 100);
    setProgress(newProgress);
    const newScene = Math.min(SCENES.length - 1, Math.floor((newProgress / 100) * SCENES.length));
    setCurrentSceneIndex(newScene);
  };

  return (
    <div className="relative w-full aspect-video bg-slate-950 rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/30 shadow-2xl group font-sans">
      
      {/* HUD Scanner Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {isPlaying && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></div>
        )}

        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-xl"></div>
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-xl"></div>
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 border-emerald-500/40 rounded-bl-xl"></div>
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-emerald-500/40 rounded-br-xl"></div>

        {/* HUD Header Status */}
        <div className="absolute top-6 left-10 sm:left-12 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></div>
          <span className="text-[9px] sm:text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {currentScene.hudText}
          </span>
        </div>
      </div>

      {/* Video Canvas Presentation Layer */}
      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${currentScene.color} transition-all duration-700`}>
        {!isPlaying && progress === 0 ? (
          <div className="text-center space-y-4 sm:space-y-6 px-4 z-20">
            <button
              onClick={() => setIsPlaying(true)}
              className="relative group/play inline-block focus:outline-none"
            >
              <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full group-hover/play:bg-emerald-500/50 transition-colors"></div>
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-900 border-2 border-emerald-500/50 rounded-full flex items-center justify-center relative z-10 shadow-2xl transform group-hover/play:scale-110 transition-transform">
                <Play className="w-6 h-6 sm:w-10 sm:h-10 text-emerald-400 fill-emerald-400 ml-1" />
              </div>
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Official AI Video Walkthrough
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase mt-2">
                How Sealify Works
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Click play to watch the step-by-step interactive marketplace guide
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl p-6 sm:p-12 text-center space-y-4 sm:space-y-6 z-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl flex items-center justify-center mx-auto shadow-2xl text-emerald-400">
              <SceneIcon className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                {currentScene.badge}
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {currentScene.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto font-medium">
                {currentScene.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Controls Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md p-3 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all font-black"
          >
            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
          </button>

          <div
            onClick={handleSeek}
            className="h-2 w-28 sm:w-64 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
            title="Click to seek"
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
            Scene {currentSceneIndex + 1} of {SCENES.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialVideo;