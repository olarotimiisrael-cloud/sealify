"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { Bot } from 'lucide-react';
import { AiShoppingAssistantModal } from '@/components/AiShoppingAssistantModal';

const STORAGE_KEY = 'sealify-copilot-position';

interface SavedPosition {
  x: number;
  y: number;
}

const defaultPosition: SavedPosition = { x: 0, y: 0 };

const getSavedPosition = (): SavedPosition => {
  if (typeof window === 'undefined') return defaultPosition;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return defaultPosition;
};

const savePosition = (pos: SavedPosition) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // ignore
  }
};

export const FloatingCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<SavedPosition>(getSavedPosition);
  const controls = useDragControls();
  const hasMoved = useRef(false);

  const handleDragStart = (event: MouseEvent | TouchEvent) => {
    hasMoved.current = false;
    event.preventDefault();
  };

  const handleDrag = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    hasMoved.current = true;
    setPosition({ x: info.point.x, y: info.point.y });
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    const newPos = { x: info.point.x, y: info.point.y };
    setPosition(newPos);
    savePosition(newPos);
  };

  const handleClick = () => {
    if (!hasMoved.current) {
      setIsOpen(true);
    }
    hasMoved.current = false;
  };

  const handleClose = () => setIsOpen(false);

  // Convert screen position to translate values
  const translateX = position.x - 70;
  const translateY = position.y - 40;

  // Constrain drag area to window bounds
  const constraints = useRef<{ top: number; left: number; right: number; bottom: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateConstraints = () => {
      const { innerWidth: width, innerHeight: height } = window;
      constraints.current = {
        top: 80,
        left: 80,
        right: Math.max(80, width - 180),
        bottom: Math.max(80, height - 120),
      };
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  // Adjust position if window was resized and position is now off-screen
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkBounds = () => {
      const { innerWidth: width, innerHeight: height } = window;
      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (prev.x < 100) newX = 100;
        if (prev.x > width - 100) newX = width - 100;
        if (prev.y < 100) newY = 100;
        if (prev.y > height - 100) newY = height - 100;

        if (newX !== prev.x || newY !== prev.y) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    };

    checkBounds();
  }, []);

  return (
    <>
      <motion.div
        drag
        dragControls={controls}
        dragConstraints={constraints.current}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          translateX: `${translateX}px`,
          translateY: `${translateY}px`,
        }}
        className="fixed z-50 cursor-grab active:cursor-grabbing"
        onClick={handleClick}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="relative flex items-center gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl px-5 py-3 shadow-2xl shadow-cyan-500/10 overflow-hidden"
        >
          <motion.div
            className="relative p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
            animate={{
              boxShadow: [
                "0 0 20px rgba(6, 182, 212, 0.3)",
                "0 0 40px rgba(6, 182, 212, 0.5)",
                "0 0 20px rgba(6, 182, 212, 0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 blur-md"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <div className="relative">
            <span className="text-sm font-semibold text-white tracking-wide bg-gradient-to-r from-cyan-300 via-white to-blue-300 bg-clip-text text-transparent">
              Copilot
            </span>
            <motion.div
              className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            />
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
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
