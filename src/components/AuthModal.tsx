import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_USER } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setCurrentUser } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'both'>('both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      ...MOCK_USER,
      id: `usr_${Date.now()}`,
      full_name: fullName || 'Verified User',
      email: email || 'user@sealify.com',
      phone_number: phone || '+234 800 123 9999',
      role,
    };

    setCurrentUser(newUser);
    toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-slate-900">
            {isSignUp ? 'Join Sealify Marketplace' : 'Log into your Sealify Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {isSignUp && (
            <div>
              <Label className="text-xs font-semibold text-slate-600">Full Name</Label>
              <Input
                type="text"
                required
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold text-slate-600">Email Address</Label>
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600">Phone Number</Label>
            <Input
              type="tel"
              placeholder="+234 803 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 rounded-xl"
            />
          </div>

          {isSignUp && (
            <div>
              <Label className="text-xs font-semibold text-slate-600">Account Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['buyer', 'seller', 'both'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-xs rounded-xl font-semibold border capitalize ${
                      role === r
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold mt-4">
            {isSignUp ? 'Create Account' : 'Login Now'}
          </Button>

          <div className="text-center text-xs text-slate-500 pt-2">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-emerald-600 font-bold hover:underline"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}