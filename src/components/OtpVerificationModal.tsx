import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerified: () => void;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  onVerified
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);

  // Simulated OTP for demo: 123456
  const DEMO_OTP = "123456";

  useEffect(() => {
    let interval: any;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setIsVerifying(true);
    
    // Simulate network delay
    setTimeout(() => {
      if (enteredOtp === DEMO_OTP) {
        toast.success('Phone number verified successfully!');
        onVerified();
      } else {
        toast.error('Invalid OTP. For demo use: 123456');
        setIsVerifying(false);
      }
    }, 1500);
  };

  const resendOtp = () => {
    setTimer(60);
    toast.info('A new OTP has been sent to ' + phoneNumber);
    console.log("SIMULATED SMS: Your Sealify code is 123456");
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative text-slate-100">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Smartphone className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Verify Your Number</h2>
            <p className="text-xs text-slate-400">
              We've sent a 6-digit code to <strong className="text-emerald-400">{phoneNumber}</strong>
            </p>
          </div>

          <div className="flex justify-between gap-2 py-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="number"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-black text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Resend code in <span className="text-emerald-400">{timer}s</span>
              </p>
            ) : (
              <button onClick={resendOtp} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 mx-auto hover:underline">
                <RefreshCw className="w-3 h-3" /> Resend OTP Code
              </button>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isVerifying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            <span>{isVerifying ? 'Verifying Code...' : 'Confirm & Complete Signup'}</span>
          </button>

          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
            * For testing/demo purposes, please enter 123456
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;