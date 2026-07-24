"use client";

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, ShieldCheck, 
  Zap, Globe, Camera, MapPin, Subtitles, User, RefreshCw 
} from 'lucide-react';

interface Scene {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  spokenNarration: string;
  badge: string;
  color: string;
  icon: React.FC<{ className?: string }>;
  hudText: string;
}

interface Presenter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  voiceGender: 'female' | 'male';
}

const PRESENTERS: Presenter[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Sealify Lead AI Presenter',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    voiceGender: 'female',
  },
  {
    id: 'david',
    name: 'David',
    role: 'Trust & Safety Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    voiceGender: 'male',
  }
];

const SCENES: Scene[] = [
  {
    id: 1,
    title: "1. Welcome to Sealify Nigeria",
    subtitle: "Ogbomoso & Oyo State Hyperlocal Marketplace",
    description: "Sealify connects local buyers and verified merchants seamlessly. Discover electronics, vehicles, real estate, and services with zero friction.",
    spokenNarration: "Welcome to Sealify, Nigeria's most trusted local marketplace. Whether you are in Ogbomoso, Oyo State, or anywhere in Nigeria, Sealify connects you directly with verified buyers and sellers in your immediate neighborhood.",
    badge: "Ecosystem Overview",
    color: "from-emerald-900/70 via-slate-900 to-slate-950",
    icon: Globe,
    hudText: "SCANNING LOCAL NODE: OGBOMOSO DISTRICT"
  },
  {
    id: 2,
    title: "2. List Items in 60 Seconds",
    subtitle: "AI Assistant & Price Valuation",
    description: "Snap photos, set your price with our Smart Valuation Calculator, and let AI generate compelling descriptions for high buyer conversion.",
    spokenNarration: "Posting an ad is effortless. Snap your product photos, calculate fair resale prices with our Smart Estimator, and let our AI copywriter generate high-converting product descriptions for you automatically.",
    badge: "Smart Listing Engine",
    color: "from-purple-900/70 via-slate-900 to-slate-950",
    icon: Camera,
    hudText: "AI VISION & COPYWRITER CORE ACTIVE"
  },
  {
    id: 3,
    title: "3. Identity & CAC Verification",
    subtitle: "Verified Badges for Sellers",
    description: "Submit government ID or CAC documents to earn trusted verification badges. Verified merchants get up to 5x more direct buyer calls.",
    spokenNarration: "To build trust, submit your National Identity Number or Corporate Affairs Commission documents to earn official verification badges on your storefront.",
    badge: "Forensic Trust Protocol",
    color: "from-amber-900/70 via-slate-900 to-slate-950",
    icon: ShieldCheck,
    hudText: "NIN / CAC CREDENTIAL VALIDATION ENCRYPTED"
  },
  {
    id: 4,
    title: "4. Safe Meetup & Settlement",
    subtitle: "CCTV Spots & Digital Receipts",
    description: "Coordinate meetups at 50+ mapped Safe Spots (Police HQs & Malls), run physical checklist tests, and generate official sales receipts.",
    spokenNarration: "For safety, choose any of our fifty plus mapped safe exchange locations across Ogbomoso, perform item checklist verification, and generate an official transaction receipt.",
    badge: "Safe Trade Protocol",
    color: "from-teal-900/70 via-slate-900 to-slate-950",
    icon: MapPin,
    hudText: "GEO-MAPPED SAFE EXCHANGE SPOTS ENABLED"
  }
];

export const TutorialVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentPresenter, setCurrentPresenter] = useState<Presenter>(PRESENTERS[0]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentScene = SCENES[currentSceneIndex] || SCENES[0];
  const SceneIcon = currentScene.icon;

  // Speech Synthesis Narration Engine
  const speakNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Reset active speech queue

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.98;
    utterance.pitch = currentPresenter.voiceGender === 'female' ? 1.08 : 0.88;

    // Attempt to pick matching gender voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (currentPresenter.voiceGender === 'female' ? v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English') : v.name.includes('Male') || v.name.includes('David'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      speakNarration(currentScene.spokenNarration);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            window.speechSynthesis?.cancel();
            setIsSpeaking(false);
            return 0;
          }
          const next = prev + 1;
          const newScene = Math.floor((next / 100) * SCENES.length);
          if (newScene < SCENES.length && newScene !== currentSceneIndex) {
            setCurrentSceneIndex(newScene);
          }
          return next;
        });
      }, 250);
    } else {
      clearInterval(interval);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, currentSceneIndex, isMuted, currentPresenter]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else if (isPlaying) {
      speakNarration(currentScene.spokenNarration);
    }
  };

  const handleSwitchPresenter = (p: Presenter) => {
    setCurrentPresenter(p);
    if (isPlaying) {
      speakNarration(currentScene.spokenNarration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.round((clickX / rect.width) * 100);
    setProgress(newProgress);
    const newScene = Math.min(SCENES.length - 1, Math.floor((newProgress / 100) * SCENES.length));
    setCurrentSceneIndex(newScene);

    if (isPlaying) {
      speakNarration(SCENES[newScene].spokenNarration);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-slate-950 rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/30 shadow-2xl group font-sans select-none">
      
      {/* Laser HUD Frame */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {isPlaying && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></div>
        )}

        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-xl"></div>
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-xl"></div>
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 border-emerald-500/40 rounded-bl-xl"></div>
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-emerald-500/40 rounded-br-xl"></div>

        {/* HUD Scanner Status */}
        <div className="absolute top-4 sm:top-6 left-10 sm:left-12 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></div>
          <span className="text-[8px] sm:text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {currentScene.hudText}
          </span>
        </div>
      </div>

      {/* AI Human Presenter Avatar Selection Card (Top Right) */}
      <div className="absolute top-4 sm:top-6 right-10 sm:right-12 z-30 flex items-center gap-3 bg-slate-900/90 border border-emerald-500/40 p-2 sm:p-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
        
        {/* Presenter Selector Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {PRESENTERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSwitchPresenter(p)}
              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                currentPresenter.id === p.id 
                  ? 'bg-emerald-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-emerald-500 shrink-0">
          <img src={currentPresenter.avatar} alt={currentPresenter.name} className="w-full h-full object-cover" />
          {isSpeaking && (
            <div className="absolute inset-0 bg-emerald-500/20 animate-pulse flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
          )}
        </div>

        <div className="text-left space-y-0.5 hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">{currentPresenter.name}</span>
            <span className="text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 uppercase">
              REAL HUMAN VOICE
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold">{currentPresenter.role}</p>
          
          {/* Animated Audio Waveform */}
          <div className="flex items-center gap-0.5 pt-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{ height: isSpeaking ? `${Math.floor(Math.random() * 10) + 4}px` : '3px' }}
                className={`w-1 rounded-full transition-all duration-150 ${isSpeaking ? 'bg-emerald-400' : 'bg-slate-700'}`}
              ></span>
            ))}
            <span className="text-[8px] font-mono text-emerald-400 font-bold ml-1 uppercase">
              {isSpeaking ? 'SPEAKING' : 'ENGLISH VOICE'}
            </span>
          </div>
        </div>
      </div>

      {/* Video Presentation Canvas */}
      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${currentScene.color} transition-all duration-700`}>
        {!isPlaying && progress === 0 ? (
          <div className="text-center space-y-4 sm:space-y-6 px-4 z-20">
            <button
              onClick={handleTogglePlay}
              className="relative group/play inline-block focus:outline-none"
            >
              <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full group-hover/play:bg-emerald-500/50 transition-colors"></div>
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-900 border-2 border-emerald-500/50 rounded-full flex items-center justify-center relative z-10 shadow-2xl transform group-hover/play:scale-110 transition-transform">
                <Play className="w-6 h-6 sm:w-10 sm:h-10 text-emerald-400 fill-emerald-400 ml-1" />
              </div>
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                AI Presenter Real Human English Narration
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase mt-2">
                How Sealify Works
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Click play to listen to {currentPresenter.name} present Sealify in clear English
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl p-6 sm:p-12 text-center space-y-4 sm:space-y-6 z-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-14 h-14 sm:w-18 sm:h-18 bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl flex items-center justify-center mx-auto shadow-2xl text-emerald-400">
              <SceneIcon className="w-7 h-7 sm:w-9 sm:h-9 animate-bounce" />
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

      {/* Synchronized Real-time Subtitle / Closed Caption Bar Overlay */}
      {showCaptions && (isPlaying || progress > 0) && (
        <div className="absolute bottom-16 sm:bottom-20 left-6 right-6 z-30 text-center pointer-events-none">
          <div className="inline-block bg-slate-950/90 border border-slate-800/90 backdrop-blur-md px-4 py-2 rounded-2xl max-w-2xl text-xs sm:text-sm font-bold text-emerald-300 shadow-2xl leading-snug">
            "{currentScene.spokenNarration}"
          </div>
        </div>
      )}

      {/* Video Player Controls Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md p-3 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all font-black shadow-lg"
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
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2 rounded-xl transition-colors border ${
              showCaptions
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
            }`}
            title="Toggle Subtitles / Closed Captions"
          >
            <Subtitles className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl transition-colors border ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-900 text-emerald-400 border-slate-800 hover:text-white'
            }`}
            title={isMuted ? 'Unmute AI Voice' : 'Mute Voice'}
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