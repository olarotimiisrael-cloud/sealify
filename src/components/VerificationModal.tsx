import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, Smartphone, Building2, User, Lock, Crown } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { toast } from 'sonner';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  sellerName,
}) => {
  const { user, submitVerificationRequest } = useSealify();
  const [applicantType, setApplicantType] = useState<'individual' | 'business' | 'premium'>('individual');
  const [docType, setDocType] = useState<string>('Government Issued ID / Passport');
  const [docNumber, setDocNumber] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdDoc(event.target?.result as string);
        toast.success('Document uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDoc) {
      toast.error('Please upload your identification document');
      return;
    }

    submitVerificationRequest({
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      type: applicantType,
      docType: applicantType === 'business' ? 'CAC Certificate / Tax Registration' : docType,
      docNumber,
      docUrl: idDoc,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setStep(1);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Apply for Verified Badge</h2>
              <p className="text-xs text-slate-400">
                Gain up to <strong className="text-emerald-400">5x more buyer trust</strong> with an admin-reviewed badge
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Badge Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setApplicantType('individual')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start gap-1 ${
                    applicantType === 'individual'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <p className="font-bold text-xs text-white">Individual</p>
                </button>

                <button
                  type="button"
                  onClick={() => setApplicantType('business')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start gap-1 ${
                    applicantType === 'business'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <p className="font-bold text-xs text-white">Business</p>
                </button>

                <button
                  type="button"
                  onClick={() => setApplicantType('premium')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start gap-1 ${
                    applicantType === 'premium'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300 ring-2 ring-purple-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <p className="font-bold text-xs text-white">Premium</p>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Document ID Number *</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. NIN-9840219482"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Upload ID Document (JPG/PNG) *</label>
                <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" id="ver-file-input" />
                <label
                  htmlFor="ver-file-input"
                  className={`w-full py-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    idDoc ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950 hover:border-emerald-500/50'
                  }`}
                >
                  {idDoc ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Document Attached</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Click to upload identity document</span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
              >
                Submit Verification Request
              </button>
            </div>
          </form>
        ) : (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Verification Sent to Admin</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Sealify administrators will review your documents within 24-48 hours. You will receive an email once your badge is issued.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;