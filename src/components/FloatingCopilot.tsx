"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { AiShoppingAssistantModal } from '@/components/AiShoppingAssistantModal';

const STORAGE_KEY = 'sealify-copilot-side';

type Side = 'left' | 'right';

const getSavedSide = (): Side => {
  if (typeof window === 'undefined') return 'right';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'left' || stored === 'right') return stored;
  } catch {
    // ignore
  }
  return 'right';
};

const saveSide = (side: Side) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, side);
  } catch {
    // ignore
  }
};

export const FloatingCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<Side>(getSavedSide);

  const handleClick = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Toggle side on long press (500ms)
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const handleMouseDown = () => {
    pressTimer.current = setTimeout(() => {
      const newSide = side === 'left' ? 'right' : 'left';
      setSide(newSide);
      saveSide(newSide);
    }, 500);
  };
  const handleMouseUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };
  const handleMouseLeave = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  // Initial position at middle of screen on the chosen side
  const positionStyle = side === 'left'
    ? { left: 0, top: '50%', transform: 'translateY(-50%)' }
    : { right: 0, top: '50%', transform: 'translateY(-50%)' };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed z-50 cursor-pointer"
        style={positionStyle}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 bg-slate-950/5 backdrop-blur-xl border border-slate-500/30 rounded-full px-2 py-1.5 shadow-sm"
        >
          <Bot className="w-3 h-3 text-cyan-400/80" />
          <span className="text-xs font-medium text-cyan-400/70 tracking-wider">Copilot</span>
        </motion.div>
      </motion.div>

      <AiShoppingAssistantModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export const FloatingCopilotWrapper: React.FC = () => {
  return <FloatingCopilot />;
};

export default FloatingCopilot;