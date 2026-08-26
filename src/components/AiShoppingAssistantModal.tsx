import React, { useMemo, useState } from 'react';
import {
  X, Sparkles, Send, Bot, User, ArrowRight, RefreshCcw, Copy,
  Search, ShieldCheck, MessageSquare, Newspaper, Loader2, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AiShoppingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  citations?: Array<{ title: string; url: string; source?: string }>;
  actionUrl?: string;
  actionLabel?: string;
}

const PRESET_PROMPTS = [
  'How does Sealify work?',
  'Help me create a listing.',
  'How can I stay safe when meeting a seller?',
  'Search the web for the latest information about solar energy.',
  'Explain artificial intelligence simply.',
];

const defaultWelcome = {
  id: 'msg_init',
  sender: 'ai' as const,
  text: '👋 I’m Sealify Copilot. I can help with Sealify marketplace guidance, safe trading tips, general questions, and web-grounded research when needed.',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const AiShoppingAssistantModal: React.FC<AiShoppingAssistantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcome]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const canAsk = useMemo(() => !isThinking && inputQuery.trim().length > 0, [inputQuery, isThinking]);

  if (!isOpen) return null;

  const handleExecuteAction = (url?: string) => {
    if (!url) return;
    onClose();
    navigate(url);
  };

  const safeMessage = (text: string) => {
    const clean = text || 'Sealify Copilot is temporarily unavailable. Please try again.';
    return clean.replace(/\*\*/g, '').replace(/\n+/g, '\n');
  };

  const handleSendPrompt = async (textToSubmit: string) => {
    const trimmed = textToSubmit.trim();
    if (!trimmed || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextConversation: Array<{ role: 'user' | 'assistant'; content: string }> = [...conversation, { role: 'user', content: trimmed }];
    setMessages((prev) => [...prev, userMsg]);
    setConversation(nextConversation);
    setInputQuery('');
    setIsThinking(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ message: trimmed, conversation: nextConversation }),
      });

      const payload: { message?: string; citations?: Array<{ title: string; url: string; source?: string }>; provider?: string; usedWebSearch?: boolean } = await response.json();
      const aiText = payload.message || 'Sealify Copilot is temporarily unavailable. Please try again later.';
      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: safeMessage(aiText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: payload.citations || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
      setConversation((prev) => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setMessages((prev) => [...prev, {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: 'Sealify Copilot is temporarily unavailable. Please try again later.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      toast.error('Sealify Copilot is temporarily unavailable. Please try again later.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void handleSendPrompt(inputQuery);
  };

  const handleClear = () => {
    setMessages([defaultWelcome]);
    setConversation([]);
    setIsClearing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl relative text-slate-100 h-[640px] max-h-[92vh] flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 rounded-2xl shadow-lg">
              <Bot className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-white">Sealify Copilot</h3>
                <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Marketplace help, general advice, and web research</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsClearing(true)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="New conversation"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[84%] p-3.5 rounded-2xl text-xs space-y-2 ${m.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-semibold rounded-br-none shadow' : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'}`}>
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                {m.citations && m.citations.length > 0 && (
                  <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">
                      <Newspaper className="w-3.5 h-3.5" />
                      Sources
                    </div>
                    <ul className="space-y-1.5 text-[10px] text-slate-300">
                      {m.citations.map((citation) => (
                        <li key={`${citation.url}-${citation.title}`}>
                          <a href={citation.url} target="_blank" rel="noreferrer" className="underline decoration-emerald-500/60 text-emerald-300 hover:text-emerald-200">
                            {citation.title || citation.source || citation.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.actionUrl && (
                  <button onClick={() => handleExecuteAction(m.actionUrl)} className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 mt-2">
                    <span>{m.actionLabel || 'Take Action'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className={`block text-[9px] ${m.sender === 'user' ? 'text-slate-900/70 font-bold' : 'text-slate-500'}`}>{m.time}</span>
                  {m.sender === 'ai' && (
                    <button type="button" className="p-1.5 rounded-md bg-slate-800/70 text-slate-300 hover:text-white" onClick={() => navigator.clipboard.writeText(m.text).catch(() => undefined)} aria-label="Copy response">
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Generating a helpful answer...</span>
              </div>
            </div>
          )}

          {isClearing && (
            <div className="flex justify-center">
              <div className="bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-[10px] font-bold text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Clear conversation?
                <button type="button" onClick={handleClear} className="px-2 py-1 rounded-full bg-emerald-500 text-slate-950 font-black">Yes</button>
                <button type="button" onClick={() => setIsClearing(false)} className="px-2 py-1 rounded-full bg-slate-700 text-white">No</button>
              </div>
            </div>
          )}
        </div>

        <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 self-center" />
          {PRESET_PROMPTS.map((prompt) => (
            <button key={prompt} type="button" onClick={() => void handleSendPrompt(prompt)} className="text-[10px] font-bold text-slate-300 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-full shrink-0 border border-slate-800 transition-colors whitespace-nowrap">
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleFormSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Sealify Copilot anything..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" disabled={!canAsk} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95">
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiShoppingAssistantModal;
