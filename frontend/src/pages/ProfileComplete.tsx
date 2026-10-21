import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSealify } from '@/context/SealifyContext';
import { laravelAuth } from '@/lib/laravel-api';
import { uploadFileWithToken } from '@/lib/upload';
import { User, Smartphone, Loader2, ShieldCheck, Camera } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const ProfileComplete: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSealify();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFullName(user.fullName || '');
    setPhoneNumber(user.phoneNumber || '');
    setAvatarUrl(user.avatarUrl || '');
    setCoverUrl(user.storeBannerUrl || '');
    setBusinessName(user.businessName || '');
  }, [user, navigate]);

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    if (file.size > 5 * 1024 * 1024) throw new Error('Avatar must be less than 5MB');

    const avatarPath = `profile-media/${user.id}/${Date.now()}-avatar.${file.name.split('.').pop()}`;
    return uploadFileWithToken(file, avatarPath);
  };

  const uploadCover = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    if (file.size > 10 * 1024 * 1024) throw new Error('Cover photo must be less than 10MB');

    const coverPath = `profile-media/${user.id}/${Date.now()}-cover.${file.name.split('.').pop()}`;
    return uploadFileWithToken(file, coverPath);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const publicUrl = await uploadAvatar(file);
      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded successfully');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast.error(`Failed to upload avatar: ${err.message}`);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const publicUrl = await uploadCover(file);
      setCoverUrl(publicUrl);
      toast.success('Cover photo uploaded successfully');
    } catch (err: any) {
      console.error('Cover upload error:', err);
      toast.error(`Failed to upload cover photo: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error('Please fill in your full name and phone number');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = laravelAuth.getToken();
      if (!token) throw new Error('No active session');

      let referralCode: string | undefined;
      try {
        referralCode = sessionStorage.getItem('sealify_ref') || undefined;
      } catch {
        // sessionStorage unavailable.
      }

      const response = await fetch('/api/auth/profile-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          avatarUrl: avatarUrl.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          businessName: businessName.trim() || undefined,
          referralCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete profile');
      }

      toast.success('Profile completed successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4">
      <SEO title="Complete Profile — Sealify" />
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl relative text-slate-900 font-sans overflow-hidden">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Complete Your Profile</h1>
          <p className="text-xs text-slate-600">
            To secure your Sealify account, please provide a few additional details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adebayo Ogunlesi"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Phone Number *
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+234 812 345 6789"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Profile Photo
            </label>
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-16 h-16 rounded-xl object-cover border border-slate-200" alt="Profile" />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-600">
                  <Camera className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-200 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
                >
                  Upload Photo
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Cover Photo
            </label>
            <div className="relative">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[9px] text-slate-600 mt-1">Enter a direct image URL (JPG, PNG, WebP)</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Business / Shop Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Adebayo's Electronics"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>

        <p className="mt-6 pt-4 border-t border-slate-200 text-center text-[9px] text-slate-600 flex items-center justify-center gap-1.5 uppercase font-black tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
          Sealify Security Protocol
        </p>
      </section>
    </main>
  );
};

export default ProfileComplete;

