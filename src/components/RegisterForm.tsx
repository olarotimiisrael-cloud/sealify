"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSealify } from "@/context/SealifyContext";

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { signup } = useSealify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await signup({ 
        email, 
        password, 
        fullName, 
        phoneNumber 
      });
      setEmail('');
      setPassword('');
      setFullName('');
      setPhoneNumber('');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="register-name">Full Name</Label>
        <Input id="register-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. Adebayo Ogunlesi" />
      </div>
      <div>
        <Label htmlFor="register-phone">Phone Number</Label>
        <Input id="register-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required placeholder="+234 812 345 6789" />
      </div>
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="register-password">Password</Label>
        <Input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </div>
      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">Create Account</Button>
    </form>
  );
};

export default RegisterForm;