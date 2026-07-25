"use client";

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, ShieldCheck, 
  Zap, Camera, MapPin, Download, Sparkles,
  CheckCircle2, Search, Calculator, FileText, QrCode,
  Smartphone, Layers, ShieldAlert, Subtitles, ChevronRight, Lock,
  Scale, Tag, Truck, HelpCircle, Gavel, Crown, Building2, Eye,
  BarChart2, Radio, MessageSquare, ArrowRight, CheckSquare, Wand2
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
    subtitle: "Campus Zones & Ogbomoso District Hubs",
    badge: "MODULE 01 • DISCOVERY ENGINE",
    color: "from-emerald-950 via-slate-900 to-slate-950",
    narration: "Welcome to Sealify, Nigeria's premier local marketplace. Sealify connects buyers and verified sellers across Ogbomoso and Oyo State. Filter listings instantly by specific neighborhood zones, including Under G, LAUTECH Main Gate, Takie Square, Sabo Market, Adenike, and Akala Way.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-3xl p-5 space-y-3.5 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-emerald-400 font-extrabold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            NODE HUB: OGBOMOSO
          </span>
          <span className="text-[10px] text-slate-500 font-mono">GPS RADIUS: 15KM</span>
        </div>

        {/* Animated Search Bar Mockup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2 text-xs">
          <Search className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-200 font-medium">Searching "Hostel Apartments in Under G"...</span>
        </div>

        {/* Neighborhood Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {['Under G', 'LAUTECH Gate', 'Takie Square', 'Sabo Market', 'Adenike'].map((zone, i) => (
            <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${i === 0 ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
              {zone}
            </span>
          ))}
        </div>

        {/* Location Radar Mockup */}
        <div className="relative h-24 bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.2rem_1.2rem] opacity-30"></div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full animate-ping absolute"></div>
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full border border-emerald-500 flex items-center justify-center z-10 shadow-lg">
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="absolute bottom-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
            LAUTECH Gate • 45 Verified Ads
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Magic Search & Item Comparison",
    subtitle: "Instant Discovery & Side-by-Side Analysis",
    badge: "MODULE 02 • SEARCH & COMPARE",
    color: "from-blue-950 via-slate-900 to-slate-950",
    narration: "Need to find something specific or compare prices? Open Magic Search instantly using Command K. Save custom search alerts to receive notifications when matching items are listed, and place up to three products side by side to compare condition, price, and merchant ratings.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-blue-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-blue-400 font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            MAGIC SEARCH (CMD + K)
          </span>
          <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">3 SLOTS ACTIVE</span>
        </div>

        {/* Side by Side Comparison Preview */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl space-y-1">
            <div className="w-full h-14 bg-slate-950 rounded-xl overflow-hidden mb-1 flex items-center justify-center text-[10px] text-slate-500 font-bold">iPhone 15 Pro</div>
            <p className="font-bold text-white text-[11px] truncate">iPhone 15 Pro Max</p>
            <p className="font-black text-emerald-400 text-xs">₦ 1,350,000</p>
            <span className="text-[9px] text-slate-400 block">Brand New • 100% Health</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl space-y-1">
            <div className="w-full h-14 bg-slate-950 rounded-xl overflow-hidden mb-1 flex items-center justify-center text-[10px] text-slate-500 font-bold">Galaxy S24</div>
            <p className="font-bold text-white text-[11px] truncate">Galaxy S24 Ultra</p>
            <p className="font-black text-emerald-400 text-xs">₦ 1,280,000</p>
            <span className="text-[9px] text-slate-400 block">Brand New • 512GB</span>
          </div>
        </div>

        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center text-[10px] text-blue-300 font-bold">
          ✓ Side-by-Side Spec & Price Analysis Active
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Smart Free Ad Posting & Dynamic Specs",
    subtitle: "Category-Specific Technical Specifications",
    badge: "MODULE 03 • FREE LISTINGS",
    color: "from-purple-950 via-slate-900 to-slate-950",
    narration: "Posting a classified advert on Sealify is completely free for everyone. Simply upload your product photos or short demonstration videos, select your item condition, and fill out category-specific specifications like vehicle transmission, device storage, or property furnishings.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-purple-400 font-extrabold flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            FREE AD CREATOR
          </span>
          <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">MULTIMEDIA SUPPORT</span>
        </div>

        {/* Dynamic Spec Card Preview */}
        <div className="bg-slate-900 border border-purple-500/20 p-3 rounded-2xl space-y-2 text-xs">
          <p className="font-extrabold text-purple-300 text-[10px] uppercase tracking-wider">Dynamic Vehicle Specs:</p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="bg-slate-950 p-1.5 rounded-lg text-center"><span className="text-slate-500 block">Trans.</span><strong className="text-white">Auto</strong></div>
            <div className="bg-slate-950 p-1.5 rounded-lg text-center"><span className="text-slate-500 block">Fuel</span><strong className="text-white">Petrol</strong></div>
            <div className="bg-slate-950 p-1.5 rounded-lg text-center"><span className="text-slate-500 block">Mileage</span><strong className="text-white">45k km</strong></div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[10px]">
          <span className="text-slate-300 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Free Photo & Video Attachments</span>
          <span className="text-emerald-400 font-mono font-bold">100% FREE</span>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "NGN Price Estimator & AI Assistant",
    subtitle: "Automated Valuation & Copywriter",
    badge: "MODULE 04 • AI INTELLIGENCE",
    color: "from-indigo-950 via-slate-900 to-slate-950",
    narration: "Unsure of how much to charge? Our Naira Price Estimator calculates fair resale values based on condition, age, and local market demand in Ogbomoso. Tap the AI Copywriting Assistant to instantly generate professional, buyer-trusted item descriptions.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-indigo-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-indigo-400 font-extrabold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            NAIRA VALUATION ENGINE
          </span>
          <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">AI ASSISTANT</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-1.5 text-xs">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Recommended Resale Rate:</span>
            <span className="text-base font-black text-emerald-400 font-mono">₦ 380,000</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Fast Sale: ₦ 340,000</span>
            <span>Est. Time: ~3 Days</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/30 text-[11px] text-slate-300 leading-snug space-y-1">
          <p className="font-bold text-indigo-400 flex items-center gap-1 text-[10px]"><Wand2 className="w-3 h-3" /> AI GENERATED CAPTION PREVIEW</p>
          <p className="italic font-medium">"✨ Pristine L-Shaped Leather Sofa. Sectional dark grey finish, high-density foam cushions..."</p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Trust Tiers & Merchant Verification",
    subtitle: "NIN ID & CAC Business Badges",
    badge: "MODULE 05 • SECURITY & TRUST",
    color: "from-amber-950 via-slate-900 to-slate-950",
    narration: "Safety is our highest priority. Sellers can apply for official verified badges by submitting their National Identity Number or Corporate Affairs Commission business registration. Verified merchants receive five times higher buyer engagement and access to Top Ad spotlight boosts.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-amber-400 font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            VERIFIED BADGE TIERS
          </span>
          <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-mono">CAC / NIN</span>
        </div>

        <div className="space-y-2">
          <div className="p-2.5 bg-slate-900 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Verified ID</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">NIN / Driver License</span>
          </div>

          <div className="p-2.5 bg-slate-900 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Verified Business</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">CAC RC Document</span>
          </div>

          <div className="p-2.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-300" />
              <span className="font-bold text-purple-200">Premium Verified</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold">Top 1% Merchant</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "Safe Exchange Spots & Physical Checklist",
    subtitle: "50+ CCTV Mapped Spots & Testing Rules",
    badge: "MODULE 06 • SAFE MEETUPS",
    color: "from-teal-950 via-slate-900 to-slate-950",
    narration: "Never pay in advance. Sealify maps over fifty verified safe exchange locations, such as Divisional Police Headquarters, public libraries, and CCTV-monitored shopping malls. Run our in-app physical inspection checklist before releasing funds to the seller.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-teal-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-teal-400 font-extrabold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            SAFE EXCHANGE SPOTS
          </span>
          <span className="text-[10px] text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded">CCTV MONITORED</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Ogbomoso Police HQ Zone</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">Takie Square District • Open Mon-Sat 8:00 AM - 6:00 PM</p>
        </div>

        <div className="p-2.5 bg-slate-900 rounded-xl border border-teal-500/30 space-y-1 text-xs">
          <span className="font-bold text-teal-300 flex items-center gap-1 text-[10px]"><CheckSquare className="w-3.5 h-3.5" /> PHYSICAL CHECKLIST</span>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-300">Device Power & Audio Tests</span>
            <span className="text-emerald-400 font-black">6 / 6 Passed</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: "Direct Messaging, Offers & Digital Receipts",
    subtitle: "In-App Negotiation & Proof of Purchase",
    badge: "MODULE 07 • IN-APP CHAT",
    color: "from-emerald-950 via-slate-900 to-slate-950",
    narration: "Communicate securely through live chat. Send formal price counter-offers, calculate bike dispatch rates across Ogbomoso, and generate official digital transaction receipts with QR verification codes when a deal is sealed.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-emerald-400 font-extrabold flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            ENCRYPTED LIVE INBOX
          </span>
          <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">OFFICIAL RECEIPT</span>
        </div>

        {/* Offer & Dispatch chips */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 space-y-0.5">
            <span className="text-[9px] font-bold block uppercase">Price Proposal</span>
            <strong className="text-xs font-black">Offer: ₦ 400,000</strong>
          </div>

          <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 space-y-0.5">
            <span className="text-[9px] font-bold block uppercase">Rider Dispatch</span>
            <strong className="text-xs font-black">Fee: ₦ 1,000</strong>
          </div>
        </div>

        {/* Receipt Mockup */}
        <div className="p-3 bg-white text-slate-950 rounded-2xl space-y-2 shadow-lg border-2 border-emerald-500">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="font-black text-[11px] tracking-tight">SEALIFY RECEIPT</span>
            <span className="font-mono text-[9px] font-bold text-emerald-700">RCP-2024-9801</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span>Amount Transacted:</span>
            <strong className="text-xs text-emerald-800 font-black">₦ 400,000</strong>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: "Buyer Want Board & Dispute Resolution",
    subtitle: "Community Requests & Neutral Arbitration",
    badge: "MODULE 08 • COMMUNITY & SAFETY",
    color: "from-rose-950 via-slate-900 to-slate-950",
    narration: "Can't find what you need? Post an item request on the Buyer Want Board to let verified merchants bring offers to you. Should any trade disagreement occur, submit evidence to our Trade Arbitration Portal for neutral investigation within twenty-four hours.",
    renderVisual: () => (
      <div className="w-full max-w-md bg-slate-950 border border-rose-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-mono text-rose-400 font-extrabold flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" />
            ARBITRATION & REQUESTS
          </span>
          <span className="text-[10px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded">24/7 MODERATION</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Buyer Request Board</span>
            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">34 PITCHES</span>
          </div>
          <p className="text-[10px] text-slate-400">"Looking for clean Elepaq Silent Generator 3.5kVA in Takie..."</p>
        </div>

        <div className="p-2.5 bg-rose-950/80 border border-rose-500/30 rounded-xl text-[10px] text-rose-200 flex items-center justify-between">
          <span className="font-bold flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Formal Trade Dispute Portal</span>
          <span className="font-mono font-bold text-rose-300">MODERATOR ACTIVE</span>
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
    // Steady, comfortable 0.85x speed for effortless listening
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

      // Smooth step interval scaled to speech length
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
      }, 350);
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

  const handleSelectScene = (index: number) => {
    setCurrentSceneIndex(index);
    const newProg = Math.round((index / PRESENTATION_SCENES.length) * 100);
    setProgress(newProg);
    if (isPlaying) {
      speakNarration(PRESENTATION_SCENES[index].narration);
    }
  };

  const handleDownloadTranscript = () => {
    const transcriptText = `================================================
SEALIFY NIGERIA — COMPREHENSIVE PLATFORM PRESENTATION TRANSCRIPT
Audio Language: UK English (en-GB) • Pace: Measured Standard (0.85x Speed)
Zone Node: Ogbomoso District & Oyo State Hub
================================================

${PRESENTATION_SCENES.map((scene) => `[MODULE ${scene.id}]: ${scene.title.toUpperCase()}\n${scene.subtitle}\n\n${scene.narration}\n\n----------------------------------------\n`).join('')}
Official Presentation Transcript compiled for Sealify Nigeria.`;

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sealify_Full_Presentation_Transcript_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('📄 Complete 8-Module presentation script downloaded!');
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
    <div className="relative w-full aspect-[16/9] min-h-[460px] bg-slate-950 rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/40 shadow-2xl group font-sans select-none flex flex-col justify-between">
      
      {/* Top Status Header */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] sm:text-xs font-mono font-black text-emerald-400 uppercase tracking-widest bg-slate-950/90 px-3.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-lg">
            DYNAMIC UI SHOWCASE
          </span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-slate-300 backdrop-blur-md pointer-events-auto">
          UK ENGLISH NARRATION (0.85x TEMPO)
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
                FULL PLATFORM TOUR (8 MODULES)
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                Complete Sealify System Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                An exhaustive animated presentation detailing ad posting, NIN verification, safe meetup spots, in-chat receipts, and trade arbitration.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleTogglePlay}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-500/20 inline-flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Full Presentation</span>
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

      {/* Module Quick Selector Bar */}
      <div className="absolute top-16 left-4 right-4 sm:left-6 sm:right-6 z-20 flex gap-1 overflow-x-auto no-scrollbar pointer-events-auto">
        {PRESENTATION_SCENES.map((sc, idx) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScene(idx)}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold whitespace-nowrap transition-all border ${
              currentSceneIndex === idx 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow' 
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Mod 0{sc.id}
          </button>
        ))}
      </div>

      {/* Subtitle Caption Overlay */}
      {(isPlaying || progress > 0) && (
        <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 sm:left-8 sm:right-8 z-20 text-center pointer-events-none">
          <div className="inline-block bg-slate-950/95 border-2 border-emerald-500/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl max-w-2xl text-xs sm:text-sm font-bold text-emerald-300 shadow-2xl leading-snug">
            "{currentScene.narration}"
          </div>
        </div>
      )}

      {/* Bottom Player Controls */}
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
            title="Jump timeline"
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
            Module {currentSceneIndex + 1} of {PRESENTATION_SCENES.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTranscript}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs border border-slate-800 flex items-center gap-1.5 transition-colors shadow"
            title="Download Transcript"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Full Script</span>
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl transition-colors border ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-900 text-emerald-400 border-slate-800 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Speech' : 'Mute Speech'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialVideo;