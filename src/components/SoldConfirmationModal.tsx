import React from 'react';
import { X, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';

interface SoldConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listingTitle: string;
}

export const SoldConfirmationModal: React.FC<SoldConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  listingTitle,
}) => {
  const { t } = useSealify();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">{t('sold_confirm')}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('sold_confirm_desc')} <br />
              <strong className="text-emerald-400">"{listingTitle}"</strong>
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400">
              Users who added this to their favorites will be notified instantly. If you reject this prompt, the item will remain available for sale.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition-colors"
            >
              Keep Available
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Yes, Item Sold</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoldConfirmationModal;