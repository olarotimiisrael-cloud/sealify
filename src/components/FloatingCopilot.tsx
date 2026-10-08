"use client";

import React, { useState } from 'react';
import { X, Bot, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AiShoppingAssistantModal } from '@/components/AiShoppingAssistantModal';

interface FloatingCopilotProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export const FloatingCopilot: React.FC<FloatingCopilotProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    onToggle(true);
  };

  const handleClose = () => {
    onToggle(false);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 hover:scale-110 transition-transform duration-150 bg-slate-950/5 backdrop-blur-xl border border-slate-500/30 rounded-full px-3 py-2"
      title="Open Sealify AI Copilot"
    >
      <Bot className="w-4 h-4 text-cyan-400/80 hover:text-cyan-300 transition-colors" />
      <span className="text-xs font-medium text-cyan-400/70 tracking-wider">Copilot</span>
    </div>
  );
};

export const FloatingCopilotWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FloatingCopilot isOpen={isOpen} onToggle={setIsOpen} />
      <AiShoppingAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};