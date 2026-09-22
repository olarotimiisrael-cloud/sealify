import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOtp } from '@/hooks/useOtp';
import { X, ShieldCheck, Smartphone, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifier: string;
  channel?: 'email' | 'phone';
  onVerified?: (result: { userId: string | null }) => void;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  identifier,
  channel = 'email',
  onVerified,
}) => {
  const { loading, requestOtp, verifyOtp, resendOtp } = useOtp();
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && !otpSent) {
      const timer = setTimeout(async () => {
        const result = await requestOtp(identifier, channel);
        if (result?.success) {
          setOtpSent(true);
          setOtpId(result.otpId);
          setCountdown(60);
          intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, identifier, channel, otpSent]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (value.length === 6) {
      setVerifying(true);
      setTimeout(async () => {
        const result = await verifyOtp(identifier, value, otpId || undefined, channel);
        setVerifying(false);
        if (result?.success) {
          setResultMessage(result.message);
          onVerified?.(result);
          toast.success(result.message);
        } else {
          setResultMessage(result?.message || 'Invalid OTP');
          toast.error(result?.message || 'Invalid OTP');
        }
      }, 300);
    }
  }, [identifier, otpId, channel, verifyOtp, onVerified]);

  const handleResend = useCallback(async () => {
    setCountdown(60);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    await resendOtp(identifier, channel);
  }, [identifier, channel, resendOtp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 font-sans overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" />
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Verify Your Identity</h2>
          <p className="text-xs text-slate-400">
            {channel === 'email' ? (
              <>Enter the 6-digit code sent to <strong className="text-slate-300">{identifier}</strong></>
            ) : (
              <>Enter the 6-digit code sent to <strong className="text-slate-300">{identifier}</strong></>
            )}
          </p>
        </div>

        {otpSent && (
          <div className="mb-4">
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={handleOtpChange}
                  className="w-full aspect-square bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {resultMessage && (
              <p className={`mt-2 text-xs text-center ${resultMessage.includes('Invalid') || resultMessage.includes('expired') ? 'text-red-400' : 'text-emerald-400'}`}>
                {resultMessage}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
          </button>
        </div>

        {!otpSent && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
            {channel === 'email' ? (
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
              Sending verification code to {identifier}...
            </p>
            {loading && <span className="ml-auto text-xs text-slate-400 animate-pulse">Loading</span>}
          </div>
        )}

        <p className="mt-4 text-[9px] text-slate-500 text-center leading-relaxed">
          For security, this code expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
