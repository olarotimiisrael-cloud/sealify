import React, { useState, useRef } from 'react';
import { useSealify } from '../context/SealifyContext';
import { X, ShieldCheck, Lock, Upload, KeyRound, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  'Account security concerns',
  'Forgotten current password',
  'Compromised account detected',
  'Routine security maintenance',
  'Legal name or identity change',
];

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const { user, submitPasswordRequest } = useSealify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nin, setNin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdDoc(event.target?.result as string);
        toast.success('ID document uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nin || nin.length < 10) {
      toast.error('Please enter a valid NIN number');
      return;
    }

    if (!idDoc) {
      toast.error('Please upload a photo of your identity document');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    submitPasswordRequest({
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      nin,
      newPassword,
      reason,
      id_document_url: idDoc,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Request Password Change</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                For security, password resets require NIN verification and manual Sealify official approval.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>National Identity Number (NIN) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter 11-digit NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Reason for Password Change *</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Proposed New Password *</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Upload ID Document (JPG/PNG) *</label>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                    idDoc ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950 hover:border-emerald-500/50'
                  }`}
                >
                  {idDoc ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400">Identity document attached</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Click to upload photo of NIN card / Passport</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Submit Secure Reset Request</span>
            </button>
          </form>
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Request Received</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Sealify security team will verify your documents. You will receive an email confirmation once processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};