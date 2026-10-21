"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSealify } from "@/context/SealifyContext";
import { GoogleIcon, AppleIcon } from "@/components/Icons";

const LoginForm = ({ onSwitchToSignup }: { onSwitchToSignup?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const { login, sendPhoneOtp, verifyPhoneOtp, signInWithOAuth } = useSealify();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      try {
        const res: any = await sendPhoneOtp(email);
        setOtpSent(true);
        setOtpId(res.data?.otp_id || res.data?.id || null);
        setGeneratedOtp(res.data?.otp || null);
        toast.success('OTP sent to your phone');
      } catch (err: any) {
        toast.error(err.message || 'Failed to send OTP');
      }
    } else {
      if (!otpId) {
        toast.error('No OTP session found. Please request a new code.');
        return;
      }
      try {
        await verifyPhoneOtp(otpId, otp);
        toast.success('Verified successfully');
      } catch (err: any) {
        toast.error(err.message || 'Invalid OTP code');
      }
    }
  };

  return (
    <>
      <Tabs defaultValue="email" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-500 flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="w-3 h-3" /> Remember me
              </label>
              <a href="/auth/reset-password" className="text-[10px] text-emerald-600 font-bold hover:underline">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">Sign In</Button>
            <div className="border-t border-slate-200 pt-4 text-center relative">
              <span className="absolute -top-1.5 bg-white px-2 text-[10px] text-slate-400">Or continue with</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" onClick={() => signInWithOAuth('google')}>
                <GoogleIcon className="w-4 h-4 mr-2" /> Google
              </Button>
              <Button variant="outline" className="w-full" onClick={() => signInWithOAuth('apple')}>
                <AppleIcon className="w-4 h-4 mr-2" /> Apple
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="phone" className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-phone">Phone Number</Label>
                <Input id="login-phone" type="tel" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="+234 812 345 6789" />
              </div>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">Send OTP Code</Button>
            </form>
          ) : (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-otp">Verification Code</Label>
                <Input id="login-otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required placeholder="Enter 6-digit code" />
              </div>
              <div className="bg-white border border-emerald-500/40 rounded-xl p-4 text-center mb-2">
                <span className="text-xl font-black tracking-[0.5em] text-emerald-300">{generatedOtp}</span>
                <p className="text-[10px] text-slate-600 mt-1">In-App Verification Code</p>
              </div>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">Verify &amp; Login</Button>
              <Button type="button" variant="ghost" className="w-full text-slate-600" onClick={() => {
                setOtpSent(false);
                setOtpId(null);
                setGeneratedOtp(null);
                setOtp('');
              }}>
                Resend Code
              </Button>
            </form>
          )}
        </TabsContent>
      </Tabs>

      {onSwitchToSignup && (
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">Don't have an account?</p>
          <button
            onClick={onSwitchToSignup}
            className="text-emerald-600 font-bold text-xs hover:underline"
          >
            Sign Up
          </button>
        </div>
      )}
    </>
  );
};

export default LoginForm;
