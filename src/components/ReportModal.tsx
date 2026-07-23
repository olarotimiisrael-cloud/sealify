import React, { useState } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
  listingId?: string;
}

const REASONS = [
  'Fraud, Scam or Counterfeit Product',
  'Inappropriate or Illegal Content',
  'Incorrect Price or Misleading Information',
  'Item Duplicate or Already Sold',
  'Spam or Commercial Vendor Violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, listingTitle, listingId = 'lst_unknown' }) => {
  const { submitReport } = useSealify();
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      listingId,
      listingTitle,
      reason: selectedReason,
      details: details.trim() || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-lg">
              <ShieldAlert className="w-6 h-6" />
              <span>Report Listing</span>
            </div>

            <p className="text-xs text-slate-400">
              Help us keep Sealify safe. You are reporting: <strong className="text-slate-200">{listingTitle}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Reason</label>
              <div className="space-y-1.5">
                {REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                      selectedReason === reason
                        ? 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide details about why you are reporting this ad..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
            >
              Submit Safety Report
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">Report Received</h3>
            <p className="text-xs text-slate-400">Our moderators will review this listing shortly. Thank you!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;