import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, Smartphone, Building2, User, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  onSubmitRequest?: (req: {
    applicantType: 'individual' | 'business';
    docType: string;
    docNumber: string;
    businessName?: string;
  }) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  sellerName,
  onSubmitRequest,
}) => {
  const [applicantType, setApplicantType] = useState<'individual' | 'business'>('individual');
  const [docType, setDocType] = useState<string>('Government Issued ID / Passport');
  const [docNumber, setDocNumber] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [phoneOtp, setPhoneOtp] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (onSubmitRequest) {
      onSubmitRequest({
        applicantType,
        docType: applicantType === 'business' ? 'CAC Certificate / Tax Registration' : docType,
        docNumber,
        businessName,
      });
    }

    toast.success(`🎉 ${applicantType === 'business' ? 'Registered Business' : 'Individual ID'} verification request submitted to Admin!`);
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

            {/* Selection of Applicant Type: Individual vs Business */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Verification Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setApplicantType('individual');
                    setDocType('Government Issued ID / Passport');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start gap-1.5 ${
                    applicantType === 'individual'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <div>
                    <p className="font-bold text-xs text-white">Individual Seller</p>
                    <p className="text-[10px] text-slate-400">NIN, Voter ID, Driver's License</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApplicantType('business');
                    setDocType('CAC Business Certificate');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start gap-1.5 ${
                    applicantType === 'business'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <div>
                    <p className="font-bold text-xs text-white">Registered Business</p>
                    <p className="text-[10px] text-slate-400">CAC Certificate / Business Name</p>
                  </div>
                </button>
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                {applicantType === 'business' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Business Name *</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Ogbomoso Tech & Solar Hub Ltd"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Government Issued ID / Passport">Government Issued ID / Passport</option>
                      <option value="National Identification Number (NIN)">National Identification Number (NIN)</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Voter's Card">Voter's Card</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {applicantType === 'business' ? 'CAC Registration Number (RC/BN)' : 'Document ID Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder={applicantType === 'business' ? 'e.g. RC-88492019' : 'e.g. NIN-9840219482'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-5 text-center space-y-2 bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
                  <Upload className="w-7 h-7 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-200">
                    Upload {applicantType === 'business' ? 'CAC Certificate / Business Doc' : 'Front Photo of Government ID'}
                  </p>
                  <p className="text-[10px] text-slate-500">JPG, PNG or PDF (Max 10MB)</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!docNumber) {
                      toast.error('Please enter registration or document identification number');
                      return;
                    }
                    if (applicantType === 'business' && !businessName) {
                      toast.error('Please enter your business name');
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
                  <p className="font-extrabold text-emerald-400">+234 803 *** 1234</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">6-Digit SMS Code</label>
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
                    Submit Request to Admin
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
            <h3 className="text-xl font-black text-white">Verification Sent to Admin</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Sealify administrators will review your document and assign your{' '}
              <strong className="text-emerald-400">
                {applicantType === 'business' ? 'Verified Business Badge' : 'Verified Individual Badge'}
              </strong>{' '}
              shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;