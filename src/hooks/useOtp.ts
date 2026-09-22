import { useState, useCallback } from 'react';
import { apiUrl } from '@/lib/env';
import { adminFetch } from '@/lib/admin-api';
import { toast } from 'sonner';

export interface OtpRequestResult {
  success: boolean;
  otpId: string;
  channel: 'email' | 'phone';
  message: string;
}

export interface OtpVerifyResult {
  success: boolean;
  userId: string | null;
  message: string;
}

export function useOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = useCallback(async (identifier: string, channel: 'email' | 'phone' = 'email'): Promise<OtpRequestResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to request OTP');
      toast.success(data.message || 'OTP requested');
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to request OTP');
      toast.error(err?.message || 'Failed to request OTP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (identifier: string, otp: string, channel: 'email' | 'phone' = 'email'): Promise<OtpVerifyResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, channel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid OTP');
      toast.success(data.message || 'OTP verified');
      return data;
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed');
      toast.error(err?.message || 'OTP verification failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendOtp = useCallback(async (identifier: string, channel: 'email' | 'phone' = 'email'): Promise<OtpRequestResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch('/api/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
      toast.success(data.message || 'OTP resent');
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP');
      toast.error(err?.message || 'Failed to resend OTP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, requestOtp, verifyOtp, resendOtp };
}