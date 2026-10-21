import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Lock, Eye, EyeOff, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const { changePassword } = useSealify();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
        password_confirmation: formData.confirm_password,
      });
      toast.success('Password changed successfully');
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Change Password — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-md mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Change Password</h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Keep your account secure with a strong password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={(e) => handleChange('current_password', e.target.value)}
                  className="w-full pr-10 pl-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => handleChange('new_password', e.target.value)}
                  className="w-full pr-10 pl-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                  className="w-full pr-10 pl-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-xs font-black transition-all ${
                loading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-95'
              }`}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

