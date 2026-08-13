"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, User, Mail, Phone, MapPin, Save, Camera, Building2, FileText, CreditCard, Layout, Award, KeyRound, Lock, Unlock, Users, Heart, Tag, DollarSign, Truck, Smartphone, Laptop, Home, Car, Shirt, Sparkles, Wrench, Briefcase, GraduationCap, Building, Zap, ShieldCheck as ShieldCheckIcon, CheckCircle, XCircle, Loader2, FileText as FileTextIcon, Image, Video, Music, Film, Code, Database, Server, Cloud, Globe, Wifi, Bluetooth, Usb, Monitor, Printer, Headphones, Mic, Speaker, Keyboard, Mouse, Cpu, HardDrive, MemoryStick, Battery, Power, Wifi as WifiIcon, Bluetooth as BluetoothIcon, Usb as UsbIcon, Monitor as MonitorIcon, Printer as PrinterIcon, Headphones as HeadphonesIcon, Mic as MicIcon, Speaker as SpeakerIcon, Keyboard as KeyboardIcon, Mouse as MouseIcon, Cpu as CpuIcon, HardDrive as HardDriveIcon, MemoryStick as MemoryStickIcon, Battery as BatteryIcon, Power as PowerIcon, TrendingDown, Info, Terminal, AlertTriangle, Siren, Radio, MapPin as MapPinIcon, Shield, Lock as LockIcon, Unlock as UnlockIcon,  Heart as HeartIcon, Tag as TagIcon, DollarSign as DollarSignIcon, Truck as TruckIcon, Smartphone as SmartphoneIcon, Laptop as LaptopIcon, Home as HomeIcon, Car as CarIcon, Shirt as ShirtIcon, Sparkles as SparklesIcon, Wrench as WrenchIcon, Briefcase as BriefcaseIcon, GraduationCap as GraduationCapIcon, Building as BuildingIcon, Zap as ZapIcon, ShieldCheck as ShieldCheckIcon2, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Loader2 as Loader2Icon, FileText as FileTextIcon2, Image as ImageIcon, Video as VideoIcon, Music as MusicIcon, Film as FilmIcon, Code as CodeIcon, Database as DatabaseIcon, Server as ServerIcon, Cloud as CloudIcon, Globe as GlobeIcon, Wifi as WifiIcon2, Bluetooth as BluetoothIcon2, Usb as UsbIcon2, Monitor as MonitorIcon2, Printer as PrinterIcon2, Headphones as HeadphonesIcon2, Mic as MicIcon2, Speaker as SpeakerIcon2, Keyboard as KeyboardIcon2, Mouse as MouseIcon2, Cpu as CpuIcon2, HardDrive as HardDriveIcon2, MemoryStick as MemoryStickIcon2, Battery as BatteryIcon2, Power as PowerIcon2 } from 'lucide-react';
import { UserProfile, UserStatus, VerificationBadgeType } from '@/types/sealify';
import { toast } from 'sonner';

interface AdminEditUserModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onSave: (id: string, updated: Partial<UserProfile>) => void;
}

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [status, setStatus] = useState<UserStatus>('active');
  const [verified, setVerified] = useState(false);
  const [verificationType, setVerificationType] = useState<VerificationBadgeType>('none');
  const [businessName, setBusinessName] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [storeBannerUrl, setStoreBannerUrl] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setLocation(user.location || 'Ogbomoso, Oyo State');
      setRole(user.role || 'buyer');
      setStatus(user.status || 'active');
      setVerified(user.verified || false);
      setVerificationType(user.verificationType || 'none');
      setBusinessName(user.businessName || '');
      setCacNumber(user.cacNumber || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setStoreBannerUrl(user.storeBannerUrl || '');
      setBankName(user.bankName || '');
      setAccountNumber(user.accountNumber || '');
      setAccountName(user.accountName || '');
    }
  }, [user]);

  if (!user) return null;

  const isNewUser = !user.id;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
        toast.success('Avatar preview updated');
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
        setStoreBannerUrl(event.target.result as string);
        toast.success('Store cover photo preview updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      location: location.trim(),
      role,
      status,
      verified,
      verificationType: verified ? (verificationType === 'none' ? 'individual' : verificationType) : 'none',
      businessName: businessName.trim() || undefined,
      cacNumber: cacNumber.trim() || undefined,
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
      storeBannerUrl: storeBannerUrl.trim(),
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      accountName: accountName.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-4">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">
            {isNewUser ? 'Add New User' : 'Edit User Record'}
          </h2>
          <p className="text-xs text-slate-400">
            {isNewUser ? 'Create a new profile in the Sealify network' : `Modifying profile & metadata for ${user.fullName}`}
          </p>
        </div>

        {/* Cover Photo Preview & Manager */}
        <div className="relative h-28 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 mb-4 flex items-center justify-center group">
          {storeBannerUrl ? (
            <img src={storeBannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[10px]">
              <Layout className="w-4 h-4" />
              <span>No Cover Banner Set</span>
            </div>
          )}
          <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-2 right-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md text-emerald-400 rounded-xl text-[10px] font-bold border border-slate-800 flex items-center gap-1 shadow"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload Cover Banner</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Avatar URL & Upload */}
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-emerald-500 shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                <User className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Profile Picture (Avatar)</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Image URL or upload below"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-black hover:scale-105 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Adebayo Ogunlesi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location Hub</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ogbomoso, Oyo State"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* User Bio / Store Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bio / Store Description</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe user profile or business bio..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>

          {/* Verification Badge Management */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Verified Identity Badge</span>
                </p>
                <p className="text-[10px] text-slate-500">Grant official verification badge status</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !verified;
                  setVerified(nextVal);
                  if (nextVal && verificationType === 'none') {
                    setVerificationType('individual');
                  }
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${verified ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${verified ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {verified && (
              <div className="space-y-1 pt-1 border-t border-slate-900">
                <label className="text-[10px] font-black text-slate-500 uppercase">Verification Badge Tier</label>
                <select
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value as VerificationBadgeType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none"
                >
                  <option value="individual">Verified Individual (NIN)</option>
                  <option value="business">Verified Business (CAC)</option>
                  <option value="premium">Premium Merchant</option>
                  <option value="student">Verified Student</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Store Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Ogunlesi Tech Store"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CAC Registration No.</label>
              <input
                type="text"
                value={cacNumber}
                onChange={(e) => setCacNumber(e.target.value)}
                placeholder="e.g. RC-1849204"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          {/* Bank Settlement Info */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>Settlement Bank Account</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank Name"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none"
              />
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account No."
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none font-mono"
              />
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account Name"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-colors shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isNewUser ? 'Create User Profile' : 'Save & Sync Profile to Supabase'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUserModal;