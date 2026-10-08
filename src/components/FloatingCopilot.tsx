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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 hover:scale-110 transition-transform duration-150 bg-slate-900/10 backdrop-blur-md border border-slate-700/20 rounded-xl p-2"
      title="Open Sealify AI Copilot"
    >
      <Bot className="w-5 h-5 text-sky-400/60 hover:text-sky-300/80 transition-colors" />
      <span className="text-xs font-medium text-sky-400/70 tracking-wider">AI Copilot</span>
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