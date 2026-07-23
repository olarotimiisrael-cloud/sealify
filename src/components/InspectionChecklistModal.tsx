import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckSquare, Square, Send, RotateCcw, AlertCircle } from 'lucide-react';
import { Category } from '../types/sealify';
import { toast } from 'sonner';

interface InspectionChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | string;
  itemTitle?: string;
  onSendChecklistToChat?: (reportMsg: string) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  critical?: boolean;
}

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  Electronics: [
    'Power on device and verify battery charges smoothly',
    'Verify screen responsiveness and check for dead pixels',
    'Test front/back cameras and all audio speakers',
    'Verify SIM card detection and Wi-Fi signal strength',
    'Ensure all iCloud / Google accounts are signed out',
    'Check physical casing for hidden cracks or water damage',
  ],
  Vehicles: [
    'Inspect engine sound for knocking or abnormal vibration',
    'Verify vehicle VIN / Chassis number matches registration',
    'Test brakes, suspension, and all lighting systems',
    'Check transmission shifts smoothly during driving',
    'Inspect tire tread wear and spare wheel availability',
    'Verify AC cooling and internal electric systems',
  ],
  'Real Estate': [
    'Verify structural integrity (walls, roof leaks, plumbing)',
    'Check electricity meter and wiring quality',
    'Inspect neighborhood security and road access',
    'Verify landlord title documents and allocation papers',
  ],
  Fashion: [
    'Check fabric condition for tears or discoloration',
    'Verify zipper and button functionality',
    'Confirm size tag accuracy and authenticity markings',
  ],
  General: [
    'Inspect physical appearance against ad photos',
    'Test primary mechanisms and power functions',
    'Verify inclusion of all chargers and accessories',
    'Ensure seller identity matches verified account details',
  ],
};

export const InspectionChecklistModal: React.FC<InspectionChecklistModalProps> = ({
  isOpen,
  onClose,
  category = 'Electronics',
  itemTitle = 'Item',
  onSendChecklistToChat,
}) => {
  const getInitialItems = (): ChecklistItem[] => {
    const listKey = DEFAULT_CHECKLISTS[category] ? category : 'General';
    const rawList = DEFAULT_CHECKLISTS[listKey] || DEFAULT_CHECKLISTS['General'];
    return rawList.map((text, idx) => ({
      id: `chk_${idx}`,
      text,
      checked: false,
      critical: idx < 2, // First two items are usually critical
    }));
  };

  const [items, setItems] = useState<ChecklistItem[]>(getInitialItems);

  useEffect(() => {
    setItems(getInitialItems());
  }, [category, isOpen]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const resetAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((checkedCount / items.length) * 100);

  const handleShareReport = () => {
    const reportMsg = `📋 IN-PERSON INSPECTION REPORT:\nItem: ${itemTitle}\nPassed Tests: ${checkedCount} of ${items.length} checks (${progressPercent}% verified)\nStatus: ${progressPercent === 100 ? '✅ All checks passed! Ready to seal deal.' : '⚠️ Inspection in progress.'}`;
    
    if (onSendChecklistToChat) {
      onSendChecklistToChat(reportMsg);
    }
    
    toast.success('Inspection report shared to chat!');
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
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Physical Inspection Checklist</h2>
          <p className="text-xs text-slate-400">
            Category Guide for <strong className="text-emerald-400">"{itemTitle}"</strong> ({category})
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Verification Score</span>
            <span className="font-black text-emerald-400">{checkedCount} of {items.length} Checked ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Essential Test Points</span>
            <button
              onClick={resetAll}
              className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  item.checked
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.checked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className={`text-xs font-semibold leading-relaxed ${item.checked ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {item.text}
                  </p>
                  {item.critical && !item.checked && (
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Critical check
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleShareReport}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Send Inspection Report to Chat</span>
        </button>
      </div>
    </div>
  );
};

export default InspectionChecklistModal;