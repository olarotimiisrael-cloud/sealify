import React, { useState, useRef } from 'react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { PasswordChangeModal } from '../components/PasswordChangeModal';
import SEO from '../components/SEO';
import { 
  ShieldCheck, Calendar, Edit3, Trash2, Mail, Camera, Image, Check, Upload, 
  KeyRound, Lock, UserCheck, ShoppingBag, Store, Zap, Building2, MapPin, Sparkles,
  Phone, AlertTriangle, Layout
} from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
];

const SAMPLE_BANNERS = [
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
];

const Settings: React.FC = () => {
  const { user, updateUser, isAdmin } = useSealify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || '');
  const [location, setLocation] = useState(user?.location || 'Ogbomoso, Oyo State');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || SAMPLE_AVATARS[0]);
  const [selectedBanner, setSelectedBanner] = useState(user?.storeBannerUrl || SAMPLE_BANNERS[0]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <SEO 
          title="Account Settings — Sealify Nigeria"
          description="Manage your profile settings, profile picture, password reset requests, and preferences on Sealify."
        />
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-white">Login Required</h2>
          <p className="text-slate-400 text-xs">Please log in to access account settings and storefront branding.</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar image size is too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedAvatar(event.target.result as string);
        toast.success('Avatar photo loaded! Click "Save Profile & Branding" to confirm.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Storefront cover photo is too large (max 8MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedBanner(event.target.result as string);
        toast.success('Storefront cover banner loaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateUser(user.id, {
      fullName,
      email: newEmail,
      phoneNumber: newPhone,
      location,
      businessName: businessName.trim() || undefined,
      avatarUrl: selectedAvatar,
      storeBannerUrl: selectedBanner,
    });
    setEditingProfile(false);
    toast.success('🎉 Profile photo, storefront cover banner, and location updated successfully!');
  };

  const handleStatusUpdate = (role: 'buyer' | 'seller' | 'admin') => {
    updateUser(user.id, { role });
    toast.success(`Trading status updated to: ${role === 'admin' ? 'Administrator' : role.toUpperCase()}`);
  };

  const handleConfirmDelete = () => {
    toast.success('Account deletion requested. Our team will contact you shortly.');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Account & Store Settings — Sealify Nigeria"
        description="Manage your profile settings, storefront branding, profile picture, password reset requests, and preferences on Sealify."
      />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        
        {/* Storefront Cover Preview Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="h-44 sm:h-52 w-full bg-slate-950 relative overflow-hidden">
            <img
              src={selectedBanner || user.storeBannerUrl || SAMPLE_BANNERS[0]}
              alt="Store Cover Banner"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            
            <button
              onClick={() => {
                setEditingProfile(true);
                setTimeout(() => bannerInputRef.current?.click(), 100);
              }}
              className="absolute top-4 right-4 p-2 bg-slate-950/80 backdrop-blur-md text-emerald-400 hover:text-white rounded-xl border border-slate-800 text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Change Cover Photo</span>
            </button>
          </div>

          <div className="p-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={selectedAvatar || user.avatarUrl}
                  alt={user.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-950"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  }}
                />
                <button
                  onClick={() => setEditingProfile(true)}
                  className="absolute bottom-1 right-1 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow font-black hover:scale-110 transition-transform"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col mb-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{user.fullName}</h1>
                  {user.verified && (
                    <VerifiedBadge type={user.verificationType || 'individual'} showText />
                  )}
                  {isAdmin && (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                      ADMINISTRATOR
                    </span>
                  )}
                </div>
                {user.businessName && (
                  <p className="text-xs font-extrabold text-emerald-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{user.businessName}</span>
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-0.5">{user.email} • {user.phoneNumber || 'No phone set'}</p>
              </div>
            </div>

            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 shadow"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>{editingProfile ? 'Cancel Editing' : 'Edit Profile & Cover'}</span>
            </button>
          </div>
        </div>

        {/* Trading Visibility & Intent Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
           <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs tracking-widest">
              <Zap className="w-4 h-4" />
              <span>Trading Visibility & Intent</span>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleStatusUpdate('buyer')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  user.role === 'buyer' ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/40'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-xs">Currently Buying</span>
              </button>

              <button
                onClick={() => handleStatusUpdate('seller')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  user.role === 'seller' ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/40'
                }`}
              >
                <Store className="w-5 h-5" />
                <span className="text-xs">Currently Selling</span>
              </button>

              <button
                onClick={() => handleStatusUpdate('admin')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  user.role === 'admin' ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/40'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs">Seamless (Both)</span>
              </button>
           </div>
        </div>

        {/* Profile Editing Form Box */}
        {editingProfile && (
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-3xl space-y-6 text-xs shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-wider text-sm">
              <Camera className="w-5 h-5" />
              <span>Storefront Branding & Profile Photos</span>
            </div>

            {/* Avatar & Cover Banner Choice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Profile Avatar Options */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="font-bold text-slate-200 block">Profile Avatar Photo</label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SAMPLE_AVATARS.map((avUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedAvatar(avUrl)}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform shrink-0 ${
                        selectedAvatar === avUrl ? 'border-emerald-500 scale-110 ring-2 ring-emerald-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avUrl} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Custom Profile Photo</span>
                </button>
              </div>

              {/* Cover Banner Options */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="font-bold text-slate-200 block">Storefront Cover Banner (Optional)</label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SAMPLE_BANNERS.map((bannerUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedBanner(bannerUrl)}
                      className={`w-16 h-10 rounded-xl overflow-hidden border-2 transition-transform shrink-0 ${
                        selectedBanner === bannerUrl ? 'border-emerald-500 scale-110 ring-2 ring-emerald-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={bannerUrl} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-teal-400 border border-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span>Upload Cover Banner Photo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Business / Storefront Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Ogunleye Tech Store"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Primary Location Area</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ogbomoso, Oyo State"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile & Storefront Branding</span>
            </button>
          </div>
        )}

        {/* Security & Password Reset Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Security & Credentials</h3>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Password Security
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Request NIN-verified password update</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Request Reset</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Two-Factor Security</h4>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">Active protection via SMS & Email</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account & Erase Personal Data</span>
              </button>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full text-center space-y-4">
              <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete your account? All active listings and messages will be permanently removed.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <MobileNav />
    </div>
  );
};

export default Settings;