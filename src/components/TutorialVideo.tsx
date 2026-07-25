"use client";

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, ShieldCheck, 
  Zap, Camera, MapPin, Download, Sparkles,
  CheckCircle2, Search, Calculator, FileText, QrCode,
  Smartphone, Layers, ShieldAlert, Subtitles, ChevronRight, Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface PresentationScene {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  narration: string;
  renderVisual: () => React.ReactNode;
}

const PRESENTATION_SCENES: PresentationScene[] = [
  {
    id: 1,
    title: "Hyperlocal Market Discovery",
    subtitle: "Ogbomoso & Oyo State Trading Nodes",
    badge: "MODULE 01 • DISCOVERY",
    color: "from-emerald-950 via-slate-900 to-slate-950",
    narration: "Welcome to Sealify, Nigeria's local classifieds platform. Browse verified items around LAUTECH campus, Takie Square, and Sabo Market with instant location filtering.",
    renderVisual: () => (
      <div className="w-full max-w-sm bg-slate-950 border border-emerald-500/30 rounded-3xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-emerald-400 font-extrabold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            GPS NODE: OGBOMOSO
          </span>
          <span className="text-[10px] text-slate-500 uppercase">Live Map Feed</span>
        </div>

        {/* Animated Search Bar Mockup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2 text-xs">
          <Search className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-200 font-medium">Searching "iPhone 15 in Under G"...</span>
        </div>

        {/* Radar Map Location Pulse Mockup */}
        <div className="relative h-28 bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30"></div>
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full animate-ping absolute"></div>
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full border border-emerald-500 flex items-center justify-center z-10">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="absolute bottom-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
            Takie Center • 1.2km
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Smart Listing & Price Estimator",
    subtitle: "AI Copywriting & Fair Resale Value",
    badge: "MODULE 02 • LISTING",
    color: "from-purple-950 via-slate-900 to-slate-950",
    narration: "Posting an advert is effortless. Snap clear product photos, check recommended resale prices in Nigerian Naira, and let artificial intelligence write compelling product descriptions.",
    renderVisual: () => (
      <div className="w-full max-w-sm bg-slate-950 border border-purple-500/30 rounded-3xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-purple-400 font-extrabold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            NAIRA PRICE ENGINE
          </span>
          <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">AI AUTO-COPY</span>
        </div>

        <div className="bg-slate-900 border border-purple-500/20 p-3 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Market Fair Value:</span>
            <span className="text-lg font-black text-emerald-400 font-mono">₦ 450,000</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-4/5 animate-pulse"></div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 italic leading-snug">
          "✨ Factory unlocked device in like-new condition. Tested with 100% battery health. Ready for safe inspection..."
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Official Merchant Verification",
    subtitle: "NIN & CAC Security Badges",
    badge: "MODULE 03 • TRUST TIER",
    color: "from-amber-950 via-slate-900 to-slate-950",
    narration: "Build buyer confidence. Upload your National Identity Number or Corporate Affairs Commission document to unlock official verified badges and gain up to five times more customer inquiries.",
    renderVisual: () => (
      <div className="w-full max-w-sm bg-slate-950 border border-amber-500/30 rounded-3xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-amber-400 font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            VERIFICATION BADGE
          </span>
          <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-mono">CAC & NIN</span>
        </div>

        <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="font-black text-white text-xs">Ogbomoso Auto Hub</h4>
            <p className="text-[10px] text-amber-400 font-bold">✓ Verified Business (CAC)</p>
            <p className="text-[9px] text-slate-500 font-mono">Status: ACTIVE TRUST TIER</p>
          </div>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-xl text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          +500% Higher Buyer Engagement
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Safe Exchange Spots & Digital Receipts",
    subtitle: "Police HQ CCTV Zones & Invoices",
    badge: "MODULE 04 • SAFE TRADING",
    color: "from-teal-950 via-slate-900 to-slate-950",
    narration: "Always trade safely. Choose any of our mapped safe exchange spots, complete the physical item inspection checklist, and generate official digital transaction receipts.",
    renderVisual: () => (
      <div className="w-full max-w-sm bg-slate-950 border border-teal-500/30 rounded-3xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-teal-400 font-extrabold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            SAFE EXCHANGE SPOT
          </span>
          <span className="text-[10px] text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded">CCTV PROTECTED</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Ogbomoso Police HQ Zone</span>
            <span className="text-[10px] text-teal-400 font-mono">100% SECURE</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inspection Checklist Completed</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900 rounded-xl border border-teal-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-400" />
            <span className="text-[10px] font-mono text-white">RCP-2024-8840</span>
          </div>
          <span className="text-[9px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">RECEIPT ISSUED</span>
        </div>
      </div>
    )
  }
];

export const TutorialVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentScene = PRESENTATION_SCENES[currentSceneIndex] || PRESENTATION_SCENES[0];

  const speakNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    // UK English for clear, standard pronunciation
    utterance.lang = 'en-GB';
    // Measured 0.85x speed: comfortable and clear pace for African listeners
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === 'en-GB' || v.lang.startsWith('en-GB')) ||
                         voices.find(v => v.lang.startsWith('en'));

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
      speakNarration(currentScene.narration);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            window.speechSynthesis?.cancel();
            setIsSpeaking(false);
            return 0;
          }
          const next = prev + 1;
          const newScene = Math.floor((next / 100) * PRESENTATION_SCENES.length);
          if (newScene < PRESENTATION_SCENES.length && newScene !== currentSceneIndex) {
            setCurrentSceneIndex(newScene);
          }
          return next;
        });
      }, 280);
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
  }, [isPlaying, currentSceneIndex, isMuted]);

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
      speakNarration(currentScene.narration);
    }
  };

  const handleDownloadTranscript = () => {
    const transcriptText = `SEALIFY NIGERIA — PLATFORM PRESENTATION TRANSCRIPT (UK ENGLISH)
Node Hub: Ogbomoso & Oyo State
Voice Audio Tempo: Standard Clear (0.85x Pace)

================================================
MODULE 1: HYPERLOCAL MARKET DISCOVERY
${PRESENTATION_SCENES[0].narration}

MODULE 2: SMART LISTING & PRICE ESTIMATOR
${PRESENTATION_SCENES[1].narration}

MODULE 3: OFFICIAL MERCHANT VERIFICATION
${PRESENTATION_SCENES[2].narration}

MODULE 4: SAFE EXCHANGE SPOTS & RECEIPTS
${PRESENTATION_SCENES[3].narration}
================================================
Official Presentation Summary produced for Sealify Nigeria.`;

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sealify_Platform_Presentation_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('📄 Platform presentation script downloaded!');
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.round((clickX / rect.width) * 100);
    setProgress(newProgress);
    const newScene = Math.min(PRESENTATION_SCENES.length - 1, Math.floor((newProgress / 100) * PRESENTATION_SCENES.length));
    setCurrentSceneIndex(newScene);

    if (isPlaying) {
      speakNarration(PRESENTATION_SCENES[newScene].narration);
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] min-h-[420px] bg-slate-950 rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/40 shadow-2xl group font-sans select-none flex flex-col justify-between">
      
      {/* Top Status Header */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] sm:text-xs font-mono font-black text-emerald-400 uppercase tracking-widest bg-slate-950/90 px-3.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-lg">
            DYNAMIC UI SHOWCASE
          </span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-slate-300 backdrop-blur-md pointer-events-auto">
          UK ENGLISH NARRATION (0.85x PACE)
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentScene.color} flex flex-col md:flex-row items-center justify-between p-6 sm:p-12 gap-8 z-0 transition-all duration-700`}>
        
        {/* Left Side: Animated UI Mockup Render */}
        <div className="w-full md:w-1/2 flex justify-center items-center shrink-0 pt-8 md:pt-0">
          {currentScene.renderVisual()}
        </div>

        {/* Right Side: Scene Explainer Text */}
        <div className="w-full md:w-1/2 space-y-3 sm:space-y-4 text-center md:text-left z-10 min-w-0">
          {!isPlaying && progress === 0 ? (
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
                INTERACTIVE DEMO
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                Sealify Platform Tour
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Watch an animated walkthrough of ad posting, NIN verification, and safe meetup spots with steady UK English audio.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleTogglePlay}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-500/20 inline-flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Presentation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                {currentScene.badge}
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {currentScene.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {currentScene.subtitle}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Subtitle Caption Overlay */}
      {(isPlaying || progress > 0) && (
        <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 sm:left-8 sm:right-8 z-20 text-center pointer-events-none">
          <div className="inline-block bg-slate-950/95 border-2 border-emerald-500/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl max-w-2xl text-xs sm:text-sm font-bold text-emerald-300 shadow-2xl leading-snug">
            "{currentScene.narration}"
          </div>
        </div>
      )}

      {/* Bottom Player Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all font-black shadow-lg"
          >
            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
          </button>

          <div
            onClick={handleSeek}
            className="h-2 w-28 sm:w-56 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
            title="Jump scene"
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
            Scene {currentSceneIndex + 1} of {PRESENTATION_SCENES.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTranscript}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs border border-slate-800 flex items-center gap-1.5 transition-colors shadow"
            title="Download Transcript"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Script</span>
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl transition-colors border ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-900 text-emerald-400 border-slate-800 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialVideo;