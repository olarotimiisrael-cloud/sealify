import React, { useState, useRef } from 'react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { PasswordChangeModal } from '../components/PasswordChangeModal';
import { ShieldCheck, Calendar, Edit3, Trash2, Mail, Camera, Image, Check, Upload, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
];

const Settings: React.FC = () => {
  const { user, updateUser } = useSealify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || SAMPLE_AVATARS[0]);

  const [emailNewListings, setEmailNewListings] = useState(true);
  const [emailFavoriteAlerts, setEmailFavoriteAlerts] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-400">Please log in to access settings</p>
          <Link
            to="/"
            className="mt-3 inline-block px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl font-bold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size is too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setSelectedAvatar(dataUrl);
        setCustomAvatarUrl('');
        toast.success('Photo loaded successfully! Click "Save Profile Photo & Changes" to complete.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const avatarToSave = customAvatarUrl.trim() || selectedAvatar;
    updateUser(user.id, {
      fullName,
      email: newEmail,
      phoneNumber: newPhone,
      avatarUrl: avatarToSave,
    });
    setEditingProfile(false);
    toast.success('🎉 Profile photo and account settings updated!');
  };

  const handleConfirmDelete = () => {
    toast.success('Account deletion requested');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={selectedAvatar || user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  }}
                />
                <button
                  onClick={() => setEditingProfile(true)}
                  className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow font-black hover:scale-110 transition-transform"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{user.fullName}</h1>
                  {user.verified && (
                    <VerifiedBadge type={user.verificationType || 'individual'} showText />
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{user.email} • {user.phoneNumber}</p>
                <span className="text-[10px] text-emerald-400 font-extrabold capitalize mt-1">
                  Role: {user.role} {user.role === 'admin' ? '(Administrator)' : ''}
                </span>
              </div>
            </div>

            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>{editingProfile ? 'Cancel Editing' : 'Edit Photo & Details'}</span>
            </button>
          </div>

          {editingProfile && (
            <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-4 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                <Camera className="w-4 h-4" />
                <span>Upload & Update Profile Photo</span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">Select Photo from Device Gallery</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Image File from Computer / Mobile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Photo & Changes</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Information & Security</h3>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" /> Account Password
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Control your authentication security</p>
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

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Account Status</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Active & Verified since {user.memberSince || '2023'}</p>
                </div>
                <Calendar className="w-5 h-5 text-slate-500" />
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