import React, { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, User, Mail, Phone, MapPin, Save, Camera, Building2, FileText, CreditCard, Layout, Award, KeyRound, Lock, Unlock, Users, Heart, Tag, DollarSign, Truck, Smartphone, Laptop, Home, Car, Shirt, Sparkles, Wrench, Briefcase, GraduationCap, Building, Zap, ShieldCheck as ShieldCheckIcon, CheckCircle, XCircle, Loader2, FileText as FileTextIcon, Image, Video, Music, Film, Code, Database, Server, Cloud, Globe, Wifi, Bluetooth, Usb, Monitor, Printer, Headphones, Mic, Speaker, Keyboard, Mouse, Cpu, HardDrive, MemoryStick, Battery, Power, Wifi as WifiIcon, Bluetooth as BluetoothIcon, Usb as UsbIcon, Monitor as MonitorIcon, Printer as PrinterIcon, Headphones as HeadphonesIcon, Mic as MicIcon, Speaker as SpeakerIcon, Keyboard as KeyboardIcon, Mouse as MouseIcon, Cpu as CpuIcon, HardDrive as HardDriveIcon, MemoryStick as MemoryStickIcon, Battery as BatteryIcon, Power as PowerIcon, TrendingDown, Info, Terminal, AlertTriangle, Siren, Radio, MapPin as MapPinIcon, Shield, Lock as LockIcon, Unlock as UnlockIcon,  Heart as HeartIcon, Tag as TagIcon, DollarSign as DollarSignIcon, Truck as TruckIcon, Smartphone as SmartphoneIcon, Laptop as LaptopIcon, Home as HomeIcon, Car as CarIcon, Shirt as ShirtIcon, Sparkles as SparklesIcon, Wrench as WrenchIcon, Briefcase as BriefcaseIcon, GraduationCap as GraduationCapIcon, Building as BuildingIcon, Zap as ZapIcon, ShieldCheck as ShieldCheckIcon2, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Loader2 as Loader2Icon, FileText as FileTextIcon2, Image as ImageIcon, Video as VideoIcon, Music as MusicIcon, Film as FilmIcon, Code as CodeIcon, Database as DatabaseIcon, Server as ServerIcon, Cloud as CloudIcon, Globe as GlobeIcon, Wifi as WifiIcon2, Bluetooth as BluetoothIcon2, Usb as UsbIcon2, Monitor as MonitorIcon2, Printer as PrinterIcon2, Headphones as HeadphonesIcon2, Mic as MicIcon2, Speaker as SpeakerIcon2, Keyboard as KeyboardIcon2, Mouse as MouseIcon2, Cpu as CpuIcon2, HardDrive as HardDriveIcon2, MemoryStick as MemoryStickIcon2, Battery as BatteryIcon2, Power as PowerIcon2,  Info } from 'lucide-react';
import { useSealify } from '@/context/SealifyContext';
import { toast } from 'sonner';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, updateAdminCredentials, adminEmail, adminPassword, adminPin } = useSealify();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState(adminEmail);
  const [newAdminPass, setNewAdminPassword] = useState(adminPassword);
  const [newAdminPin, setNewAdminPin] = useState(adminPin);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'credentials' | 'security'>('profile');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setBusinessName(user.businessName || '');
      setBusinessCategory(user.businessCategory || '');
      setBusinessAddress(user.businessAddress || '');
      setAvatarUrl(user.avatarUrl || '');
      setCoverUrl(user.storeBannerUrl || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

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

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverUrl(event.target.result as string);
        toast.success('Cover photo preview updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(user.id, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
        businessName: businessName.trim() || undefined,
        businessCategory: businessCategory.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
        avatarUrl: avatarUrl.trim() || user.avatarUrl,
        storeBannerUrl: coverUrl.trim(),
      });
      setIsSaving(false);
      toast.success('Admin profile updated successfully!');
    } catch (err) {
      setIsSaving(false);
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPass.trim() || !newAdminPin.trim()) {
      toast.error('All credential fields are required');
      return;
    }
    if (newAdminPin.length !== 6) {
      toast.error('PIN must be exactly 6 digits');
      return;
    }

    setIsSaving(true);
    try {
      await updateAdminCredentials(newAdminEmail.trim(), newAdminPass.trim(), newAdminPin.trim());
      setIsSaving(false);
      toast.success('Admin credentials updated successfully!');
    } catch (err) {
      setIsSaving(false);
      toast.error('Failed to update credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'credentials' ? 'bg-rose-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'security' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Security
          </button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="text-center space-y-1 mb-4">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Admin Profile Settings</h2>
              <p className="text-xs text-slate-400">Manage your administrative profile and storefront</p>
            </div>

            <div className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Image className="w-4 h-4 text-emerald-400" />
                <span>Profile Media</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profile Avatar</label>
                  <div className="relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-500">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black hover:scale-105 transition-transform"
                      title="Change Avatar"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cover / Banner Photo</label>
                  <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <span className="text-xs font-bold uppercase">No Cover Photo</span>
                      </div>
                    )}
                    <input type="file" ref={bannerInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black hover:scale-105 transition-transform"
                      title="Change Cover Photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sealify Official"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 813 120 8468"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sealify.ng"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  disabled
                />
                <p className="text-[10px] text-slate-500">Admin email is managed in Credentials tab</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bio / Description</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Admin bio or official description..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Official Business Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Business / Store Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Sealify National Hub"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Business Category</label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Marketplace Platform">Marketplace Platform</option>
                    <option value="Technology & Software">Technology & Software</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Address</span>
                </label>
                <textarea
                  rows={2}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Official registered address"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving Changes...' : 'Save Admin Profile'}</span>
            </button>
          </form>
        )}

        {activeTab === 'credentials' && (
          <form onSubmit={handleUpdateCredentials} className="space-y-6">
            <div className="text-center space-y-1 mb-4">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Master Credentials</h2>
              <p className="text-xs text-slate-400">Update root access credentials for the Admin Terminal</p>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-widest">
                <Siren className="w-4 h-4" />
                <span>SECURITY WARNING</span>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">
                Changing these credentials will immediately invalidate all active admin sessions. 
                Ensure you store the new credentials securely. The 6-digit Master PIN is required for all administrative actions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Admin Login Email *</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@sealify.ng"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Admin Access Password *</label>
                <input
                  type="text"
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new master password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono tracking-wider"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">6-Digit Master Security PIN *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newAdminPin}
                  onChange={(e) => setNewAdminPin(e.target.value)}
                  placeholder="6-Digit PIN"
                  className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-4 py-3 text-rose-400 font-black focus:outline-none font-mono tracking-widest text-center text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Updating Credentials...' : 'Save Master Credentials'}</span>
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="text-center space-y-1 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Security Settings</h2>
              <p className="text-xs text-slate-400">Configure platform security policies</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-slate-400">Require 2FA for all admin logins</p>
                  </div>
                  <button className="w-11 h-6 rounded-full bg-emerald-500 relative p-0.5">
                    <div className="w-5 h-5 rounded-full bg-slate-950 translate-x-5 transition-transform"></div>
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">Currently: Enforced for all admin accounts</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Session Timeout</p>
                    <p className="text-[10px] text-slate-400">Auto-logout after inactivity</p>
                  </div>
                  <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="15">15 minutes</option>
                    <option value="30" selected>30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Failed Login Lockout</p>
                    <p className="text-[10px] text-slate-400">Lock account after failed attempts</p>
                  </div>
                  <button className="w-11 h-6 rounded-full bg-emerald-500 relative p-0.5">
                    <div className="w-5 h-5 rounded-full bg-slate-950 translate-x-5 transition-transform"></div>
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">Currently: 3 attempts → 15 min lockout</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Audit Logging</p>
                    <p className="text-[10px] text-slate-400">Log all administrative actions</p>
                  </div>
                  <button className="w-11 h-6 rounded-full bg-emerald-500 relative p-0.5">
                    <div className="w-5 h-5 rounded-full bg-slate-950 translate-x-5 transition-transform"></div>
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">All admin actions are logged to audit trail</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsModal;
