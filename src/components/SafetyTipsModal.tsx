import React from 'react';
import { X, ShieldCheck, MapPin, AlertTriangle, CheckCircle, CreditCard, Lock } from 'lucide-react';

interface SafetyTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyTipsModal: React.FC<SafetyTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[85vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Sealify Safe Trading Guidelines</h2>
            <p className="text-xs text-slate-400">Essential rules to keep every transaction 100% secure</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs text-slate-300 pr-1">
          {/* Section 1: Meeting in Person */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-400">
              <MapPin className="w-4 h-4" />
              <span>1. Choose Safe Exchange Locations</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <li>Always meet in well-lit, public spaces like coffee shops, mall lobbies, or official police station exchange zones.</li>
              <li>Avoid secluded areas or private residences when meeting a seller or buyer for the first time.</li>
              <li>Bring a friend or family member with you whenever possible.</li>
            </ul>
          </div>

          {/* Section 2: Product Inspection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>2. Thorough Product Inspection</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <li>Test electronics thoroughly (power on, check battery health, test Wi-Fi, SIM card slot, and camera).</li>
              <li>For vehicles, check the VIN number, clean title status, and perform a test drive in a safe area.</li>
              <li>Verify brand authenticity and receipts before handing over payment.</li>
            </ul>
          </div>

          {/* Section 3: Safe Payments */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-400">
              <CreditCard className="w-4 h-4" />
              <span>3. Payment Security & Red Flags</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <li><strong>NEVER</strong> send advance deposits, hold fees, or wire payments before seeing the item in person.</li>
              <li>Beware of buyers or sellers offering fake payment confirmation screenshots or cashier's checks.</li>
              <li>Only complete payment after inspecting and accepting the product in person.</li>
            </ul>
          </div>

          {/* Section 4: Scam Alert Warnings */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Common Scam Red Flags</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Be cautious if a seller refuses to meet in person, claims to be overseas, insists on shipping through an unknown escrow agent, or pressures you to complete an urgent wire transfer.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Verified Sealify Security Protocol
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyTipsModal;