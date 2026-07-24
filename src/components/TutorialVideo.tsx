"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, ShieldCheck, 
  Zap, Globe, Camera, MapPin, Subtitles, Download, Sparkles,
  CheckCircle2, RefreshCw, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface Scene {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  spokenNarration: string;
  badge: string;
  color: string;
  hudText: string;
}

const SCENES: Scene[] = [
  {
    id: 1,
    title: "1. Welcome to Sealify Nigeria",
    subtitle: "Ogbomoso & Oyo State Hyperlocal Marketplace",
    description: "Connect directly with verified local buyers and merchants in Ogbomosoland, LAUTECH campus, Takie Square, and across Oyo State.",
    spokenNarration: "E kaabo! Welcome to Sealify, Nigeria's most trusted local marketplace. Whether you are at LAUTECH Under G, Takie Square, Sabo Market, or anywhere in Oyo State, Sealify connects you directly with verified buyers and sellers right in your area.",
    badge: "Ogbomoso Marketplace Overview",
    color: "from-emerald-950 via-slate-900 to-slate-950",
    hudText: "AI PRESENTER: AMINA (OGBOMOSO NODE)"
  },
  {
    id: 2,
    title: "2. Post Ads & Instant Valuation",
    subtitle: "Smart Price Estimator & AI Copywriter",
    description: "Snap product photos, use our Smart Valuation Calculator to set prices in Naira (NGN), and let AI generate attractive ad descriptions.",
    spokenNarration: "Posting your ad is very simple. Snap clear photos of your phone, car, or item, check the fair resale price with our smart Naira estimator, and let our AI copywriter write a catchy description for you automatically.",
    badge: "Smart Listing Engine",
    color: "from-purple-950 via-slate-900 to-slate-950",
    hudText: "AI SPEECH & VISION CORE: ACTIVE"
  },
  {
    id: 3,
    title: "3. Get Verified with NIN or CAC",
    subtitle: "Official Trust Badges for Merchants",
    description: "Submit your National ID (NIN) or CAC document to earn verified badges and receive 5x more direct buyer calls.",
    spokenNarration: "To make buyers trust you 100%, submit your NIN card or CAC business registration. You will get an official verified badge on your storefront, which gives you five times more buyer calls and messages.",
    badge: "Identity Trust Protocol",
    color: "from-amber-950 via-slate-900 to-slate-950",
    hudText: "NIN / CAC CREDENTIAL ENCRYPTED"
  },
  {
    id: 4,
    title: "4. Safe Exchange Spots & Receipts",
    subtitle: "Police HQ CCTV Zones & Digital Invoices",
    description: "Meet up at mapped safe exchange spots (Ogbomoso Police HQ or Malls), run item physical tests, and issue digital invoices.",
    spokenNarration: "Always trade safely! Choose any of our verified safe meetup spots like the Ogbomoso Divisional Police HQ or CCTV-monitored centers. Test the item thoroughly, then generate an official digital transaction receipt right inside the chat.",
    badge: "Safe Trade Protocol",
    color: "from-teal-950 via-slate-900 to-slate-950",
    hudText: "SAFE EXCHANGE SPOTS: MAPPED"
  }
];

export const TutorialVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentScene = SCENES[currentSceneIndex] || SCENES[0];

  // African Lady Presenter Image / Video Motion Simulation Loop
  const presenterAvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80";

  // Speech Synthesis Narration Engine tuned for African / Nigerian English
  const speakNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    // Priority targeting Nigerian/African English speech accent
    utterance.lang = 'en-NG'; 
    utterance.rate = 0.95; // Steady, natural African speech pace
    utterance.pitch = 1.05; // Friendly female presenter pitch

    const voices = window.speechSynthesis.getVoices();
    const africanVoice = voices.find(v => v.lang === 'en-NG' || v.lang === 'en_NG' || v.lang.includes('NG')) || 
                         voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English'))) ||
                         voices.find(v => v.lang.startsWith('en'));

    if (africanVoice) {
      utterance.voice = africanVoice;
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
      }, 260);
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
      speakNarration(currentScene.spokenNarration);
    }
  };

  const handleDownloadVideo = () => {
    const videoSummaryText = `SEALIFY NIGERIA — PLATFORM VIDEO BRIEFING (AFRICAN ENGLISH)
Presenter: Amina (AI Official Spokesperson)
Region: Ogbomoso, Oyo State Hub

------------------------------------------------
1. OVERVIEW:
${SCENES[0].spokenNarration}

2. LISTING & AI ESTIMATOR:
${SCENES[1].spokenNarration}

3. IDENTITY VERIFICATION:
${SCENES[2].spokenNarration}

4. SAFE MEETUP & RECEIPTS:
${SCENES[3].spokenNarration}
------------------------------------------------
Official Video Briefing generated by Sealify Nigeria Trust Protocol.`;

    const blob = new Blob([videoSummaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sealify_Video_Guide_Amina_Ogbomoso_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('📹 Video Transcript & Offline Briefing downloaded to your device!');
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
    <div className="relative w-full aspect-[16/9] sm:aspect-[16/9] min-h-[380px] bg-slate-950 rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/40 shadow-2xl group font-sans select-none flex flex-col justify-between">
      
      {/* HUD Scanner Border Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {isPlaying && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,1)] animate-pulse"></div>
        )}

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-xl"></div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-xl"></div>
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-xl"></div>
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-xl"></div>

        {/* HUD Scanner Header Text */}
        <div className="absolute top-4 left-10 sm:top-6 sm:left-12 flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></div>
          <span className="text-[9px] sm:text-xs font-mono font-black text-emerald-400 uppercase tracking-widest bg-slate-950/90 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-lg">
            {currentScene.hudText}
          </span>
        </div>
      </div>

      {/* Main Visual Stage: AI African Presenter Video Canvas */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentScene.color} flex flex-col md:flex-row items-center justify-between p-6 sm:p-12 gap-6 z-0 transition-all duration-700`}>
        
        {/* Left Side: Animated AI African Lady Presenter Card */}
        <div className="relative w-36 h-36 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden border-4 border-emerald-500/60 shadow-2xl shrink-0 group/presenter">
          <img 
            src={presenterAvatarUrl} 
            alt="Amina — AI African Presenter" 
            className={`w-full h-full object-cover transition-transform duration-500 ${isSpeaking ? 'scale-105' : 'scale-100'}`}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>

          {/* Lip-Sync Sound Wave & Motion Animation Overlay */}
          {isSpeaking && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center justify-between shadow-lg animate-in fade-in">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                AMINA SPEAKING
              </span>

              {/* Dynamic Animated Speech Wavebars */}
              <div className="flex items-center gap-0.5">
                {[12, 20, 8, 18, 14, 24, 10].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: isSpeaking ? `${Math.floor(Math.random() * 16) + 6}px` : '4px' }}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-100 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  ></span>
                ))}
              </div>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-800 text-[9px] font-black text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>AI PRESENTATION HOST</span>
          </div>
        </div>

        {/* Right Side: Scene Presentation Content */}
        <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left z-20 min-w-0">
          {!isPlaying && progress === 0 ? (
            <div className="space-y-4">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">
                AFRICAN ENGLISH NARRATION BY AMINA
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                How Sealify Works in Ogbomoso
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed font-medium">
                Watch Amina explain ad posting, NIN verification, and safe meetup spots in clear African English.
              </p>
              
              <button
                onClick={handleTogglePlay}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-500/20 inline-flex items-center gap-2 transition-transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Live Video Presentation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                {currentScene.badge}
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {currentScene.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-xl">
                {currentScene.description}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Live Synchronized Subtitles / Captions Bar */}
      {showCaptions && (isPlaying || progress > 0) && (
        <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 sm:left-8 sm:right-8 z-30 text-center pointer-events-none">
          <div className="inline-block bg-slate-950/95 border-2 border-emerald-500/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl max-w-2xl text-xs sm:text-sm font-bold text-emerald-300 shadow-2xl leading-snug">
            <span className="text-amber-300 font-black mr-1.5">Amina:</span>
            "{currentScene.spokenNarration}"
          </div>
        </div>
      )}

      {/* Video Player Controls Footer Bar */}
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
            className="h-2 w-24 sm:w-64 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
            title="Click to jump scene"
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
          {/* Download Video Offline Summary Button */}
          <button
            onClick={handleDownloadVideo}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs border border-slate-800 flex items-center gap-1.5 transition-colors shadow"
            title="Download Video Briefing & Script"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Video</span>
          </button>

          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2 rounded-xl transition-colors border ${
              showCaptions
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
            }`}
            title="Toggle Subtitles"
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
            title={isMuted ? 'Unmute Speech' : 'Mute Voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialVideo;