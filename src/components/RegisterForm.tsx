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
  const { signup } = useSealify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    try {
      await signup({ 
        email, 
        password, 
        fullName: email.split('@')[0] 
      });
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="register-password">Password</Label>
        <Input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">Register</Button>
    </form>
  );
};

export default RegisterForm;