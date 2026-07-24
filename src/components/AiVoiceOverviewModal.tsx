"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Volume2, VolumeX, Play, Pause, ShieldCheck, 
  Sparkles, MapPin, Tag, User, Gauge, Subtitles 
} from 'lucide-react';
import { Listing } from '../types/sealify';

interface AiVoiceOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
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
    role: 'Sealify AI Product Specialist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    voiceGender: 'female',
  },
  {
    id: 'david',
    name: 'David',
    role: 'Trust & Safety Audio Guide',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    voiceGender: 'male',
  }
];

export const AiVoiceOverviewModal: React.FC<AiVoiceOverviewModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [currentPresenter, setCurrentPresenter] = useState<Presenter>(PRESENTERS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen || !listing) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formattedPrice = formatNGN(listing.price);

  const narrationScript = `Here is your official audio briefing for ${listing.title}. This item is listed in the ${listing.category} category for ${formattedPrice}, located in ${listing.location}. Condition is rated as ${listing.condition}. ${listing.sellerVerified ? `The seller, ${listing.sellerName}, holds an official verified badge on Sealify.` : `Seller is ${listing.sellerName}.`} Remember to inspect this item physically at a verified safe meetup spot before making any payment!`;

  const speakNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Reset speech queue

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(narrationScript);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = currentPresenter.voiceGender === 'female' ? 1.08 : 0.88;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (currentPresenter.voiceGender === 'female' ? v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English') : v.name.includes('Male') || v.name.includes('David'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isOpen && isPlaying) {
      speakNarration();
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, isPlaying, currentPresenter, rate, isMuted]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsSpeaking(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI Voice Product Overview</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Audio Product Briefing</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Listen to an AI human voice overview of <strong className="text-emerald-400">"{listing.title}"</strong>
          </p>
        </div>

        {/* Presenter Selection Card */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0">
              <img src={currentPresenter.avatar} alt={currentPresenter.name} className="w-full h-full object-cover" />
              {isSpeaking && (
                <div className="absolute inset-0 bg-emerald-500/20 animate-pulse flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">{currentPresenter.name}</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 uppercase">
                  ENGLISH VOICE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{currentPresenter.role}</p>
            </div>
          </div>

          {/* Presenter Switch */}
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            {PRESENTERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setCurrentPresenter(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  currentPresenter.id === p.id 
                    ? 'bg-emerald-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Waveform & Speech Play Button */}
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl text-center space-y-4 shadow-inner">
          <div className="flex items-center justify-center gap-1 h-12">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
              <span
                key={i}
                style={{ height: isSpeaking ? `${Math.floor(Math.random() * 32) + 8}px` : '6px' }}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isSpeaking ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-800'
                }`}
              ></span>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleTogglePlay}
              className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-transform active:scale-95 font-black"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>

          {/* Speed Rate selector */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Speech Speed:</span>
            {[1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setRate(s)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  rate === s ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Subtitle Transcript Card */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Subtitles className="w-4 h-4 text-emerald-400" />
            <span>Spoken English Script</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 leading-relaxed font-medium shadow-inner italic">
            "{narrationScript}"
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs transition-colors"
        >
          Close Audio Tour
        </button>
      </div>
    </div>
  );
};

export default AiVoiceOverviewModal;