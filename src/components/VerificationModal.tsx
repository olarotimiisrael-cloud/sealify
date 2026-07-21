import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, Smartphone, FileText, Lock, Sparkles } from 'lucide-react';
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
  const [step, setStep] = useState<number>(1);
  const [idType, setIdType] = useState<string>('Government Issued ID / Passport');
  const [idNumber, setIdNumber] = useState<string>('');
  const [phoneOtp, setPhoneOtp] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast.success('🎉 Identity verification request submitted!');
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
              <h2 className="text-2xl font-black text-white">Get Verified Seller Badge</h2>
              <p className="text-xs text-slate-400">
                Gain up to <strong className="text-emerald-400">3x more buyer inquiries</strong> with a verified trust badge
              </p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <span className={step >= 1 ? 'text-emerald-400 flex items-center gap-1' : ''}>
                <CheckCircle2 className="w-3.5 h-3.5" /> 1. Document ID
              </span>
              <span className="text-slate-700">•</span>
              <span className={step >= 2 ? 'text-emerald-400 flex items-center gap-1' : ''}>
                <Smartphone className="w-3.5 h-3.5" /> 2. Phone OTP
              </span>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Document Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Government Issued ID / Passport">Government Issued ID / Passport</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="Business Registration / Tax Certificate">Business Registration / Tax Certificate</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Document Identification Number</label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. ID-9840219482"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2 bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
                  <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-200">Upload Front Photo of ID Document</p>
                  <p className="text-[10px] text-slate-500">Supports JPG, PNG or PDF (Max 10MB)</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!idNumber) {
                      toast.error('Please enter document identification number');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
                >
                  Continue to Phone Verification
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1">
                  <p className="text-slate-400">SMS Verification code sent to your registered phone number</p>
                  <p className="font-extrabold text-emerald-400">+1 (555) ***-2831</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-black text-white tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
                  >
                    Submit Verification Request
                  </button>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted with 256-bit SSL Security Protection</span>
            </div>
          </form>
        ) : (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Verification Under Review</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Our Trust & Safety moderators will verify your uploaded document within 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;