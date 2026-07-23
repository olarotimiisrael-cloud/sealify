import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { 
  ShieldAlert, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Gavel, 
  Send, 
  Scale, 
  MessageSquare,
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface DisputeCase {
  id: string;
  receiptRef: string;
  itemTitle: string;
  counterparty: string;
  category: string;
  reason: string;
  status: 'pending' | 'in_review' | 'resolved';
  createdAt: string;
}

const DISPUTE_REASONS = [
  'Item Condition Misrepresentation (Undisclosed Faults)',
  'Payment Sent but Item Not Delivered',
  'Suspected Counterfeit or Stolen Goods',
  'Unresponsive Counterparty after Handover',
  'Wrong Specification / Different Item Provided',
];

export const DisputeResolution: React.FC = () => {
  const { user, isAuthenticated } = useSealify();
  const [receiptRef, setReceiptRef] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [details, setDetails] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  const [activeCases, setActiveCases] = useState<DisputeCase[]>([
    {
      id: 'DISP-2024-8841',
      receiptRef: 'RCP-2024-100293',
      itemTitle: 'iPhone 13 Pro 256GB',
      counterparty: 'Adebowale Ogunleye',
      category: 'Electronics',
      reason: 'Item Condition Misrepresentation (Undisclosed Faults)',
      status: 'in_review',
      createdAt: '2 days ago',
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEvidenceUrl(event.target?.result as string);
        toast.success('Evidence photo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemTitle.trim() || !counterparty.trim() || !details.trim()) {
      toast.error('Please fill out all mandatory dispute fields');
      return;
    }

    const newCase: DisputeCase = {
      id: `DISP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptRef: receiptRef.trim() || 'N/A (Pre-sale Issue)',
      itemTitle: itemTitle.trim(),
      counterparty: counterparty.trim(),
      category: 'General Trade',
      reason,
      status: 'pending',
      createdAt: 'Just now',
    };

    setActiveCases((prev) => [newCase, ...prev]);
    toast.success(`Dispute Case #${newCase.id} filed! A Sealify moderator has been assigned.`);

    // Reset form
    setReceiptRef('');
    setItemTitle('');
    setCounterparty('');
    setDetails('');
    setEvidenceUrl(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Trade Dispute Resolution & Mediation Portal — Sealify Nigeria"
        description="File formal trade disputes, request transaction review, and resolve marketplace grievances with neutral Sealify moderators."
      />
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border border-rose-500/30 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                <Gavel className="w-4 h-4" />
                <span>Formal Trade Arbitration & Escrow Protection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Dispute Resolution Portal
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                Encountered a problem during a transaction? Submit proof and our dedicated Trust & Safety moderators will intervene, conduct neutral evidence review, and help resolve your claim.
              </p>
            </div>

            <div className="bg-slate-950/90 border border-rose-500/20 p-5 rounded-3xl space-y-1 shrink-0 text-center w-full sm:w-auto shadow-xl">
              <p className="text-3xl font-black text-rose-400">100%</p>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Fair Mediation Guarantee</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Dispute Filing Form (8 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">File New Dispute Claim</h2>
                  <p className="text-xs text-slate-400">Provide accurate details to speed up admin investigation</p>
                </div>
              </div>

              <form onSubmit={handleSubmitDispute} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase tracking-wider">
                      Receipt Ref Number (If Available)
                    </label>
                    <input
                      type="text"
                      value={receiptRef}
                      onChange={(e) => setReceiptRef(e.target.value)}
                      placeholder="e.g. RCP-2024-100293"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase tracking-wider">
                      Item Title / Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      placeholder="e.g. Toyota Camry 2018 or iPhone 13"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase tracking-wider">
                      Other Party's Name / Seller Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={counterparty}
                      onChange={(e) => setCounterparty(e.target.value)}
                      placeholder="e.g. Adebowale Ogunleye"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase tracking-wider">
                      Primary Nature of Issue *
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                    >
                      {DISPUTE_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">
                    Full Description of Event & Claims *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Detail what was agreed upon versus what actually happened during the exchange..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">
                    Attach Evidence Photo (Bank Transfer Receipt / Chat Screenshot)
                  </label>
                  <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" id="evidence-upload" />
                  <label
                    htmlFor="evidence-upload"
                    className={`w-full py-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      evidenceUrl ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-slate-800 bg-slate-950 hover:border-rose-500/50 text-slate-400'
                    }`}
                  >
                    {evidenceUrl ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase">Evidence File Attached</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-600" />
                        <span className="text-[10px] font-bold uppercase">Click to upload payment screenshot or defect photo</span>
                      </>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs shadow-lg shadow-rose-900/40 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Formal Dispute for Admin Arbitration</span>
                </button>
              </form>
            </div>
          </div>

          {/* Active Cases Sidebar (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Your Dispute Cases</span>
                </h3>
                <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {activeCases.length} Total
                </span>
              </div>

              <div className="space-y-3">
                {activeCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] text-emerald-400 font-bold block">{c.id}</span>
                        <h4 className="font-bold text-xs text-white mt-0.5">{c.itemTitle}</h4>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        c.status === 'in_review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {c.status === 'in_review' ? 'Under Review' : 'Resolved'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      Claim against: <strong className="text-slate-200">{c.counterparty}</strong>
                    </p>

                    <p className="text-[10px] text-slate-500 italic">
                      Reason: "{c.reason}"
                    </p>

                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Submitted {c.createdAt}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        Moderator Assigned <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arbitration Policy Guidelines */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3 text-xs text-slate-400">
              <h4 className="font-extrabold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Sealify Arbitration Guidelines</span>
              </h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-[11px]">
                <li>Moderators hold chat logs and bank transfer receipts as binding primary evidence.</li>
                <li>Investigations typically take 24–48 hours to cross-examine both parties.</li>
                <li>Vendors found engaging in fraud will have their verified badges permanently revoked and accounts banned.</li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default DisputeResolution;