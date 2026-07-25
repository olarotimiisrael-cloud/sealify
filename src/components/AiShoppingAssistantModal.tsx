import React, { useState } from 'react';
import { 
  X, Sparkles, Send, Bot, User, ArrowRight, Search, 
  MapPin, Tag, ShieldCheck, Home, Building2, HelpCircle, RefreshCcw 
} from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AiShoppingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  actionUrl?: string;
  actionLabel?: string;
}

const PRESET_PROMPTS = [
  'Find student hostels in Under G near LAUTECH',
  'What is the average price of an iPhone 13 in Ogbomoso?',
  'How do I use Sealify Escrow protection?',
  'Where are the verified safe meetup spots in Takie?',
  'Show me CAC verified merchants',
];

export const AiShoppingAssistantModal: React.FC<AiShoppingAssistantModalProps> = ({ isOpen, onClose }) => {
  const { listings, marketStats, setFilters, safeSpots, allUsers } = useSealify();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: "👋 Hi! I'm **Sealify Copilot**, your AI shopping guide for Ogbomosoland. Ask me to find deals, compare prices in Under G or Takie, or guide you through safe trading!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const generateAiReply = (query: string): { text: string; actionUrl?: string; actionLabel?: string } => {
    const q = query.toLowerCase();

    if (q.includes('hostel') || q.includes('apartment') || q.includes('under g') || q.includes('lautech')) {
      const realEstateCount = listings.filter(l => l.category === 'Real Estate').length;
      return {
        text: `🏡 I found **${realEstateCount} housing listings** in Ogbomoso! Popular student zones include Under G (3 mins to LAUTECH gate) and Adenike Area. Tiled self-contains average ₦250,000 - ₦350,000 per year.`,
        actionUrl: '/?category=Real Estate&location=Under G',
        actionLabel: 'Explore Student Hostels in Under G',
      };
    }

    if (q.includes('iphone') || q.includes('phone') || q.includes('laptop') || q.includes('electronics')) {
      const elecStats = marketStats.find(s => s.category === 'Electronics');
      const avg = elecStats ? `₦${elecStats.avgPrice.toLocaleString()}` : '₦180,000';
      return {
        text: `📱 Electronics in Ogbomoso average **${avg}**. All laptops and phones on Sealify come with verified physical inspection checklists so you can test battery, screen, and iCloud before paying!`,
        actionUrl: '/?category=Electronics',
        actionLabel: 'Browse Verified Electronics',
      };
    }

    if (q.includes('escrow') || q.includes('safe') || q.includes('security') || q.includes('scam')) {
      return {
        text: `🔒 Sealify protects every transaction with 3 layers:\n1. Direct NIN & CAC Identity Verification\n2. 50+ CCTV-monitored Safe Meetup Spots (e.g. Police HQ, LAUTECH Gate)\n3. Reversible Neutral Escrow Vaults.`,
        actionUrl: '/safety',
        actionLabel: 'Open Trust & Safety Guide',
      };
    }

    if (q.includes('spot') || q.includes('meetup') || q.includes('takie') || q.includes('police')) {
      const spotNames = safeSpots.slice(0, 3).map(s => `• ${s.name} (${s.zone})`).join('\n');
      return {
        text: `📍 Verified Safe Meetup Spots in Ogbomoso:\n${spotNames}\n\nAlways meet during daylight hours and test items in person!`,
        actionUrl: '/escrow-verify',
        actionLabel: 'Verify Escrow Code',
      };
    }

    if (q.includes('vendor') || q.includes('merchant') || q.includes('cac') || q.includes('seller')) {
      const verifiedCount = allUsers.filter(u => u.verified).length;
      return {
        text: `🏬 We have **${verifiedCount} CAC & ID Verified Merchants** operating storefronts in Ogbomoso and Oyo State. Look for the green or golden badge on listing cards!`,
        actionUrl: '/vendors',
        actionLabel: 'View Merchant Directory',
      };
    }

    // Default matching
    const matchingAds = listings.filter(l => l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q));
    if (matchingAds.length > 0) {
      const topAd = matchingAds[0];
      return {
        text: `🔍 I matched **${matchingAds.length} items** for "${query}"! Top result: **"${topAd.title}"** priced at ₦${topAd.price.toLocaleString()} in ${topAd.location}.`,
        actionUrl: `/?q=${encodeURIComponent(query)}`,
        actionLabel: `View All ${matchingAds.length} Matches`,
      };
    }

    return {
      text: `🤖 I'm searching the Ogbomoso node for "${query}". You can also post a request on our **Buyer Want Board** so local vendors reach out directly with offers!`,
      actionUrl: '/requests',
      actionLabel: 'Post Request on Want Board',
    };
  };

  const handleSendPrompt = (textToSubmit: string) => {
    if (!textToSubmit.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: textToSubmit.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const reply = generateAiReply(textToSubmit);
      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: reply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl: reply.actionUrl,
        actionLabel: reply.actionLabel,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 800);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(inputQuery);
  };

  const handleExecuteAction = (url: string) => {
    onClose();
    navigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl relative text-slate-100 h-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 rounded-2xl shadow-lg">
              <Bot className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-white">Sealify AI Copilot</h3>
                <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                  OGBOMOSO AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Local market concierge & deal matchmaker</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-semibold rounded-br-none shadow'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                {m.actionUrl && (
                  <button
                    onClick={() => handleExecuteAction(m.actionUrl!)}
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 mt-2"
                  >
                    <span>{m.actionLabel || 'Take Action'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <span className={`block text-[9px] text-right ${m.sender === 'user' ? 'text-slate-900/70 font-bold' : 'text-slate-500'}`}>
                  {m.time}
                </span>
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
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Searching local Ogbomoso database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 self-center" />
          {PRESET_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSendPrompt(prompt)}
              className="text-[10px] font-bold text-slate-300 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-full shrink-0 border border-slate-800 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Sealify AI Copilot anything..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiShoppingAssistantModal;