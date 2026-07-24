"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSealify } from "@/context/SealifyContext";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useSealify();

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
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">Login</Button>
    </form>
  );
};

export default LoginForm;