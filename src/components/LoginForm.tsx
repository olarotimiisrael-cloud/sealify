"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSealify } from "@/context/SealifyContext";
import { GoogleIcon, AppleIcon } from "@/components/Icons";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const { login, signInWithOAuth, sendPhoneOtp, verifyPhoneOtp } = useSealify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    try {
      const success = await login(email, password);
      if (success) {
        setEmail('');
        setPassword('');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple' | 'samsung') => {
    try {
      await signInWithOAuth(provider);
    } catch {
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }
    try {
      const id = await sendPhoneOtp(phone.trim());
      setOtpId(id);
      setOtpSent(true);
      toast.success('OTP sent to your phone');
    } catch {
      toast.error('Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the verification code');
      return;
    }
    try {
      const success = await verifyPhoneOtp(phone.trim(), otp.trim(), otpId);
      if (success) {
        toast.success('Phone verified successfully');
        setPhone('');
        setOtp('');
        setOtpSent(false);
      }
    } catch {
      toast.error('OTP verification failed');
    }
  };

  return (
    <Tabs defaultValue="email" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="phone">Phone</TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
          >
            Login
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => handleOAuth('google')}
          >
            <GoogleIcon className="h-4 w-4 mr-2" />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => handleOAuth('apple')}
          >
            <AppleIcon className="h-4 w-4 mr-2" />
            Apple
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="phone" className="space-y-4">
        {!otpSent ? (
          <>
            <div>
              <Label htmlFor="login-phone">Phone Number</Label>
              <Input
                id="login-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button
              type="button"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="login-otp">Verification Code</Label>
              <Input
                id="login-otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              Verify & Login
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-slate-400"
              onClick={() => {
                setOtpSent(false);
                setOtpId(null);
                setOtp('');
              }}
            >
              Resend Code
            </Button>
          </form>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default LoginForm;