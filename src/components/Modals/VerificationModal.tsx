import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, Building2, User, GraduationCap } from 'lucide-react';
import { useSealify } from '../../context/SealifyContext';
import { toast } from 'sonner';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, submitVerificationRequest } = useSealify();
  const [applicantType, setApplicantType] = useState<'individual' | 'business' | 'student'>('individual');
  const [docNumber, setDocNumber] = useState('');
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      docType: applicantType === 'business' ? 'CAC Certificate' : applicantType === 'student' ? 'School ID Card' : 'Government Issued ID',
      docNumber,
      docUrl: idDoc,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2500);
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
                Verified sellers receive <strong className="text-emerald-400">5x more buyer inquiries</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Application Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setApplicantType('individual')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    applicantType === 'individual'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <p className="font-bold text-[10px]">Individual ID</p>
                  <p className="text-[8px] opacity-60">NIN, Voter's Card</p>
                </button>

                <button
                  type="button"
                  onClick={() => setApplicantType('student')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    applicantType === 'student'
                      ? 'border-blue-500 bg-blue-500/10 text-white ring-2 ring-blue-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <p className="font-bold text-[10px]">Student ID</p>
                  <p className="text-[8px] opacity-60">Campus Community</p>
                </button>

                <button
                  type="button"
                  onClick={() => setApplicantType('business')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    applicantType === 'business'
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <p className="font-bold text-[10px]">Business (CAC)</p>
                  <p className="text-[8px] opacity-60">Store Registration</p>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">ID / RC / Matric Number *</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Enter identification number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upload Verification Document (Photo) *</label>
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
                      <span className="text-[10px] font-bold text-emerald-400">ID Photo Attached</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Click to upload document</span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
              >
                Submit for Admin Review
              </button>
            </div>
          </form>
        ) : (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Verification Request Logged</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Sealify administrators will review your credentials within 24-48 hours. You will be notified once your badge is active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;