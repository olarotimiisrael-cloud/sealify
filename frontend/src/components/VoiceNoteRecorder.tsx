'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSendVoiceNote } from '@/lib/api-client';
import { useSealify } from '@/context/SealifyContext';
import {
  Mic,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import VoiceNotePlayer from './VoiceNotePlayer';

interface VoiceNoteRecorderProps {
  conversationId: string;
  className?: string;
}

const MAX_DURATION_SECONDS = 300;

export default function VoiceNoteRecorder({
  conversationId,
  className,
}: VoiceNoteRecorderProps) {
  const { user } = useSealify();
  const sendVoiceNote = useSendVoiceNote();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    if (url) {
      URL.revokeObjectURL(url);
      setUrl(null);
    }
    setBlob(null);
    setAudioChunks([]);
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    setError(null);
  }, [url]);

  useEffect(() => {
    return () => {
      cleanup();
      if (mediaRecorder?.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [cleanup, mediaRecorder]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setAudioChunks((prev) => [...prev, e.data]);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setBlob(recordedBlob);
        setUrl(URL.createObjectURL(recordedBlob));
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      };

      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      timerRef.current = window.setInterval(() => {
        if (!startTimeRef.current) return;
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000,
        );
        setDuration(elapsed);
        if (elapsed >= MAX_DURATION_SECONDS) {
          recorder.stop();
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Microphone access denied');
      toast.error('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    } else {
      cleanup();
    }
  };

  const togglePause = () => {
    if (!mediaRecorder) return;
    if (isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
    } else {
      mediaRecorder.pause();
      setIsPaused(true);
      pausedTimeRef.current = Date.now() - (startTimeRef.current || 0);
      pausedTimeRef.current = Math.floor(pausedTimeRef.current / 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!blob || !url) return;
    setSending(true);
    try {
      const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
      await sendVoiceNote.mutateAsync({
        conversationId,
        file,
        durationSeconds: Math.max(duration, 1),
      });
      cleanup();
      toast.success('Voice note sent');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send voice note');
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    );
  }

  const recording = isRecording && !isPaused;

  return (
    <div className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      {/* Recording state */}
      {isRecording ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-rose-700">
            Recording… {formatTime(duration)}
          </span>
          <button
            onClick={togglePause}
            className="text-[10px] text-rose-600 font-bold hover:underline ml-auto"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={stopRecording}
            className="text-[10px] text-slate-600 font-bold hover:underline"
          >
            Stop
          </button>
        </div>
      ) : null}

      {/* Playback + send (after recording) */}
      {blob && url && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
          <VoiceNotePlayer url={url} durationSeconds={duration} />
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {sending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Send'
            )}
          </button>
          <button onClick={cleanup} className="text-slate-400 hover:text-rose-500">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {!blob && !url && !user && (
        <div className="px-3 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
          Sign in to send voice notes
        </div>
      )}

      {!blob && !url && user && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50"
        >
          <Mic className="w-4 h-4" />
          <span>Voice Note</span>
        </button>
      )}
    </div>
  );
}

