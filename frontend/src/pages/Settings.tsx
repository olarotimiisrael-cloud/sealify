import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { User, Lock, Mail, Phone, MapPin, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useSealify();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Settings — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <User className="w-3 h-3" />
            <span>Profile Settings</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Profile Settings</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Manage your personal information and account preferences.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100"
                />
                <button
                  className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 text-xs">+234</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="8012345678"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Ogbomoso, Oyo State"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="Tell buyers about yourself..."
                />
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
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

