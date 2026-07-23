import React, { useState } from 'react';
import { X, Sparkles, Check, Copy, Wand2, FileText } from 'lucide-react';
import { Category, Condition } from '../types/sealify';
import { toast } from 'sonner';

interface AiAdAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: Category;
  condition: Condition;
  price: string;
  location: string;
  onApplyDescription: (generatedText: string) => void;
}

export const AiAdAssistantModal: React.FC<AiAdAssistantModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  condition,
  price,
  location,
  onApplyDescription,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<'detailed' | 'punchy' | 'commercial'>('detailed');

  if (!isOpen) return null;

  const formattedPrice = price ? `₦${Number(price).toLocaleString()}` : 'Negotiable Price';
  const itemTitle = title.trim() || 'This Item';
  const itemLoc = location.trim() || 'Ogbomoso, Oyo State';

  const templates = {
    detailed: `✨ ${itemTitle.toUpperCase()} — EXCELLENT DEAL ✨

📌 Product Details:
• Category: ${category}
• Condition: ${condition}
• Asking Price: ${formattedPrice}
• Location: ${itemLoc}

🔍 Description & Highlights:
This ${itemTitle} is in ${condition.toLowerCase()} working condition, carefully tested and ready for immediate pickup or dispatch delivery. 100% authentic and well-maintained.

🛡️ Inspection & Guarantee:
• Physical inspection available at verified Safe Meetup Spots in Ogbomoso.
• Test thoroughly before payment.
• Direct phone call or instant live chat available.`,

    punchy: `🚀 QUICK SALE: ${itemTitle} (${formattedPrice})

Condition: ${condition}
Location: ${itemLoc}

Clean, fully functional, and ready to go! No hidden faults. Serious buyers only.

📍 Meetup in public safe zone or doorstep dispatch rider available. Message or call now!`,

    commercial: `🏪 SEALIFY VERIFIED MERCHANT LISTING
Product Name: ${itemTitle}
Condition: ${condition}
Price: ${formattedPrice}
Location / Store: ${itemLoc}

Description:
Professional grade ${category.toLowerCase()} listing offered with full seller verification. Guaranteed working condition. Comes with original accessories if applicable.

📞 Contact seller today for fast response and safe meetup arrangement!`,
  };

  const handleApply = () => {
    onApplyDescription(templates[selectedStyle]);
    toast.success('AI description applied to your ad form!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">AI Ad Content Generator</h2>
          <p className="text-xs text-slate-400">
            Auto-generate professional, buyer-trusted description copy in 1 tap
          </p>
        </div>

        {/* Style selection chips */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedStyle('detailed')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedStyle === 'detailed'
                ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-bold ring-2 ring-purple-500/30'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <p className="text-xs font-bold text-white">Detailed</p>
            <p className="text-[9px] text-slate-400">Specs & Trust</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStyle('punchy')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedStyle === 'punchy'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold ring-2 ring-emerald-500/30'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <p className="text-xs font-bold text-white">Quick & Punchy</p>
            <p className="text-[9px] text-slate-400">Fast Sale</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStyle('commercial')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedStyle === 'commercial'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold ring-2 ring-amber-500/30'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <p className="text-xs font-bold text-white">Merchant</p>
            <p className="text-[9px] text-slate-400">Business Style</p>
          </button>
        </div>

        {/* Preview box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Generated Text Preview</span>
            <span className="text-purple-400 text-[10px] lowercase font-mono">100% formatted</span>
          </label>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
            {templates[selectedStyle]}
          </div>
        </div>

        <button
          onClick={handleApply}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Apply to Ad Description</span>
        </button>
      </div>
    </div>
  );
};

export default AiAdAssistantModal;