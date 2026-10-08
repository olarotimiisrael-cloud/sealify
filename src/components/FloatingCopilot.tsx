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
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 bg-slate-950/5 backdrop-blur-xl border border-slate-500/30 rounded-full px-3 py-2 shadow-lg"
        >
          <Bot className="w-4 h-4 text-cyan-400/80" />
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
