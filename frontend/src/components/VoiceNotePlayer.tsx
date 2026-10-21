'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VoiceNotePlayerProps {
  url: string;
  durationSeconds?: number;
  className?: string;
}

export default function VoiceNotePlayer({
  url,
  durationSeconds,
  className,
}: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(url);
    const audio = audioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.pause();
      audio.src = '';
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [url]);

  const total = durationSeconds || 0;
  const progress = total ? (currentTime / total) * 100 : 0;

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button onClick={toggle} className="text-slate-500 hover:text-emerald-600">
        {isPlaying ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.121-4.416a.5.5 0 00-.832-.182l-4 2.8c-.562.397-.562 1.39 0 1.788l4 2.8c.27.192.562.192.832 0l3.121-4.416c.27-.382.27-1.272 0-1.654z" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(Math.max(0, total - currentTime))}</span>
        </div>
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-emerald-500 transition-all duration-100`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] font-mono text-slate-500 shrink-0">
        {formatTime(total)}
      </span>
    </div>
  );
}
