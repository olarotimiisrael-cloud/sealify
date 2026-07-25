import React, { useState, useRef } from 'react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { PasswordChangeModal } from '../components/PasswordChangeModal';
import SEO from '../components/SEO';
import { 
  ShieldCheck, Calendar, Edit3, Trash2, Mail, Camera, Image as ImageIcon, Check, Upload, 
  KeyRound, Lock, UserCheck, ShoppingBag, Store, Zap, Building2, MapPin, Sparkles,
  Phone, AlertTriangle, Layout, Shield, ArrowRight, User, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, updateUser, isAdmin } = useSealify();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || '');
  const [location, setLocation] = useState(user?.location || 'Ogbomoso, Oyo State');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || '');
  const [selectedBanner, setSelectedBanner] = useState(user?.storeBannerUrl || '');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
        <SEO title="Account Settings — Sealify Nigeria" />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto border border-slate-800">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Login Required</h2>
            <p className="text-slate-400 text-xs">Please log in to access account settings and storefront branding.</p>
            <Link to="/" className="w-full inline-block px-5 py-3 bg-emerald-500 text-slate-950 rounded-xl font-black text-xs transition-colors shadow-lg">Return Home</Link>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAvatarUrl = event.target.result as string;
        setSelectedAvatar(newAvatarUrl);
        updateUser(user.id, { avatarUrl: newAvatarUrl });
        toast.success('🎉 Profile photo updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newBannerUrl = event.target.result as string;
        setSelectedBanner(newBannerUrl);
        updateUser(user.id, { storeBannerUrl: newBannerUrl });
        toast.success('🎨 Storefront cover photo updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, {
      fullName,
      email: newEmail,
      phoneNumber: newPhone,
      location,
      businessName: businessName.trim() || undefined,
      avatarUrl: selectedAvatar,
      storeBannerUrl: selectedBanner,
    });
    toast.success('🎉 Account and storefront profile details saved!');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 md:pb-0 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO title="Account & Store Settings — Sealify Nigeria" />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        
        {/* Profile & Store Banner Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          
          {/* Banner Image */}
          <div className="h-48 sm:h-64 w-full bg-slate-950 relative overflow-hidden group flex items-center justify-center">
            {selectedBanner || user.storeBannerUrl ? (
              <img
                src={selectedBanner || user.storeBannerUrl}
                alt="Store Cover Banner"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
                <Layout className="w-10 h-10" />
                <span className="text-xs font-bold uppercase tracking-wider">No Cover Banner Uploaded</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            
            <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-4 right-4 px-4 py-2 bg-slate-950/80 backdrop-blur-md text-emerald-400 hover:text-white rounded-2xl border border-slate-800 text-xs font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
              <Camera className="w-4 h-4" />
              <span>{selectedBanner || user.storeBannerUrl ? 'Change Cover Photo' : 'Upload Cover Banner'}</span>
            </button>
          </div>

          {/* User Info Bar */}
          <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              
              {/* Avatar with Camera Icon Overlay */}
              <div className="relative group shrink-0">
                {selectedAvatar || user.avatarUrl ? (
                  <img
                    src={selectedAvatar || user.avatarUrl}
                    alt={user.fullName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] object-cover border-4 border-slate-900 shadow-2xl bg-slate-950"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] border-4 border-slate-900 bg-slate-950 flex flex-col items-center justify-center text-slate-500 shadow-2xl">
                    <User className="w-12 h-12" />
                    <span className="text-[9px] font-extrabold uppercase mt-1">No Photo</span>
                  </div>
                )}
                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl shadow-xl font-black transition-transform active:scale-95"
                  title="Upload New Profile Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{user.fullName}</h1>
                  {user.verified && <VerifiedBadge type={user.verificationType || 'individual'} showText />}
                  {isAdmin && (
                    <span className="text-[10px] font-mono font-black bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full uppercase">
                      Administrator
                    </span>
                  )}
                </div>
                {user.businessName && (
                  <p className="text-xs font-black text-emerald-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{user.businessName}</span>
                  </p>
                )}
                <p className="text-slate-400 text-xs font-mono">{user.email} • {user.phoneNumber || 'No phone'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
              <Link
                to={`/seller/${user.id}`}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-2xl text-xs flex items-center gap-2 border border-slate-700 shadow"
              >
                <span>View My Public Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </Link>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-xl transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveAll} className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
          <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-wider text-xs pb-2 border-b border-slate-800">
            <Edit3 className="w-4 h-4" />
            <span>Storefront & Personal Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Full Display Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Store / Business Brand Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Ogbomoso Tech Hub & Accessories"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider">Contact Phone (WhatsApp) *</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-300 uppercase tracking-wider">Store / Primary Neighborhood Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Under G Area, Ogbomoso, Oyo State"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition-transform active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Details</span>
          </button>
        </form>

        {/* Security & Password Reset Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Security & Authentication</h3>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Password Reset Protocol
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Request secure password reset via National Identity (NIN) verification</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Global Protection Badge */}
        <div className="pt-4 flex justify-center opacity-40">
          <div className="inline-flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sealify Secure Protocol Active</span>
          </div>
        </div>
      </main>

      <PasswordChangeModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default Settings;