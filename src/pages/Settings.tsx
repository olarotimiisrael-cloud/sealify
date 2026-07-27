import React, { useState, useRef, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PwaInstallButton from '../components/PwaInstallButton';
import VerificationModal from '../components/VerificationModal';
import PasswordChangeModal from '../components/PasswordChangeModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { 
  ShieldCheck, 
  Bell, 
  Fingerprint, 
  Camera, 
  Share2, 
  User, 
  Save, 
  Building2, 
  MapPin, 
  Award, 
  KeyRound, 
  Store, 
  CreditCard, 
  Globe, 
  Instagram, 
  Twitter, 
  Clock, 
  Database, 
  RefreshCw, 
  Download,
  Layout,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const NIGERIAN_BANKS = [
  'Access Bank',
  'First Bank of Nigeria',
  'Guaranty Trust Bank (GTB)',
  'OPay',
  'PalmPay',
  'Kuda Bank',
  'Moniepoint Microfinance Bank',
  'United Bank for Africa (UBA)',
  'Zenith Bank',
  'Wema Bank / ALAT',
  'Stanbic IBTC Bank',
  'Fidelity Bank',
];

const Settings: React.FC = () => {
  const { user, updateUser, isSyncing, lastSyncTime, syncDatabase, exportDatabaseBackup, listings } = useSealify();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [cacNumber, setCacNumber] = useState(user?.cacNumber || '');
  const [businessHours, setBusinessHours] = useState(user?.businessHours || 'Mon - Sat: 8:00 AM - 7:00 PM');
  const [location, setLocation] = useState(user?.location || 'Under G, Ogbomoso');
  const [bio, setBio] = useState(user?.bio || '');
  const [role, setRole] = useState<'buyer' | 'seller'>(user?.role === 'admin' ? 'seller' : (user?.role || 'buyer'));
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [storeBannerUrl, setStoreBannerUrl] = useState(user?.storeBannerUrl || '');

  // Bank Settlement Details
  const [bankName, setBankName] = useState(user?.bankName || 'OPay');
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || '');
  const [accountName, setAccountName] = useState(user?.accountName || '');

  // Social & Web Links
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');
  const [instagramHandle, setInstagramHandle] = useState(user?.instagramHandle || '');
  const [twitterHandle, setTwitterHandle] = useState(user?.twitterHandle || '');

  // Communication & Privacy Preferences
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(user?.whatsappNotifications ?? true);
  const [hidePhonePublicly, setHidePhonePublicly] = useState(user?.hidePhonePublicly ?? false);
  const [hideLocationPublicly, setHideLocationPublicly] = useState(user?.hideLocationPublicly ?? false);

  const [isVerificationModalOpen, setIsVerificationOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('sealify_biometric') === 'true'
  );

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setBusinessName(user.businessName || '');
      setCacNumber(user.cacNumber || '');
      setBusinessHours(user.businessHours || 'Mon - Sat: 8:00 AM - 7:00 PM');
      setLocation(user.location || 'Under G, Ogbomoso');
      setBio(user.bio || '');
      if (user.role !== 'admin') {
        setRole(user.role || 'buyer');
      }
      setAvatarUrl(user.avatarUrl || '');
      setStoreBannerUrl(user.storeBannerUrl || '');

      setBankName(user.bankName || 'OPay');
      setAccountNumber(user.accountNumber || '');
      setAccountName(user.accountName || '');

      setWebsiteUrl(user.websiteUrl || '');
      setInstagramHandle(user.instagramHandle || '');
      setTwitterHandle(user.twitterHandle || '');

      setEmailNotifications(user.emailNotifications ?? true);
      setWhatsappNotifications(user.whatsappNotifications ?? true);
      setHidePhonePublicly(user.hidePhonePublicly ?? false);
      setHideLocationPublicly(user.hideLocationPublicly ?? false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <SEO title="System Settings — Sealify" />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-emerald-400">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Login Required</h2>
          <p className="text-xs text-slate-400 max-w-xs">Please log in to manage your profile settings, store banner, and device preferences.</p>
          <Link to="/" className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">
            Return to Home
          </Link>
        </div>
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
        const newAvatar = event.target.result as string;
        setAvatarUrl(newAvatar);
        updateUser(user.id, { avatarUrl: newAvatar });
        toast.success('🎉 Profile picture updated and saved!');
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
        const newBanner = event.target.result as string;
        setStoreBannerUrl(newBanner);
        updateUser(user.id, { storeBannerUrl: newBanner });
        toast.success('🎨 Store cover photo updated and saved!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full Name cannot be empty');
      return;
    }

    setIsSaving(true);

    try {
      await updateUser(user.id, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        businessName: businessName.trim() || undefined,
        cacNumber: cacNumber.trim() || undefined,
        businessHours: businessHours.trim() || undefined,
        location: location.trim(),
        bio: bio.trim() || undefined,
        role: user.role === 'admin' ? 'admin' : role,
        avatarUrl: avatarUrl.trim() || user.avatarUrl,
        storeBannerUrl: storeBannerUrl.trim(),

        bankName,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),

        websiteUrl: websiteUrl.trim(),
        instagramHandle: instagramHandle.trim(),
        twitterHandle: twitterHandle.trim(),

        emailNotifications,
        whatsappNotifications,
        hidePhonePublicly,
        hideLocationPublicly
      });

      setIsSaving(false);
      toast.success('🎉 Profile & preferences synchronized instantly to Supabase!');
    } catch (e: any) {
      setIsSaving(false);
      toast.error('Failed to save profile changes. Please try again.');
    }
  };

  const toggleBiometric = () => {
    const nextState = !biometricEnabled;
    setBiometricEnabled(nextState);
    localStorage.setItem('sealify_biometric', nextState.toString());
    toast.success(nextState ? 'Biometric App Lock Enabled' : 'Biometric Lock Disabled');
  };

  const myAdsCount = listings.filter(l => l.sellerId === user.id).length;
  const storefrontUrl = `${window.location.origin}/seller/${user.id}`;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO title="Profile & Store Settings — Sealify Nigeria" description="Edit your profile details, cover photo, business information, bank payout details, and app security settings on Sealify." />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Profile & Store Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your identity, cover photo, bio, bank payout account, and storefront branding</p>
          </div>

          <Link
            to={`/seller/${user.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-2xl text-xs border border-slate-800 transition-colors shadow-lg"
          >
            <Store className="w-4 h-4" />
            <span>View My Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Database Synchronization Status Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-xl flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <Database className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">Supabase Live Connection</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Synced: {lastSyncTime} • UID: {user.id.slice(0, 12)}...</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => syncDatabase()}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync DB Now'}</span>
            </button>
            <button
              type="button"
              onClick={exportDatabaseBackup}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>
          </div>
        </div>

        {/* PROFILE & COVER PHOTO EDIT FORM */}
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl space-y-6">
          
          {/* Cover Photo Header Manager */}
          <div className="relative h-44 sm:h-56 bg-slate-950 overflow-hidden flex items-center justify-center group">
            {storeBannerUrl ? (
              <img
                src={storeBannerUrl}
                alt="Store Cover Banner"
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600 font-bold uppercase text-xs">
                <Layout className="w-8 h-8" />
                <span>Upload Storefront Cover Photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-4 right-4 px-4 py-2.5 bg-slate-950/80 backdrop-blur-md text-emerald-400 hover:text-white rounded-2xl text-xs font-bold border border-slate-800 flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{storeBannerUrl ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
            </button>
          </div>

          {/* Avatar & Profile Information Fields */}
          <div className="px-6 sm:px-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
            
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-950"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-slate-900 bg-slate-950 flex flex-col items-center justify-center text-slate-500 shadow-2xl">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black hover:scale-110 transition-transform"
                  title="Upload Profile Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h3 className="text-xl font-black text-white">{fullName || 'Your Name'}</h3>
                  {user.verified ? (
                    <VerifiedBadge type={user.verificationType || 'individual'} showText />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Unverified Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                <p className="text-[10px] text-slate-500">Total Active Inventory: <strong className="text-emerald-400">{myAdsCount} Ads</strong></p>
              </div>
            </div>

            {/* Profile Input Fields */}
            <div className="space-y-6 pt-4 border-t border-slate-800">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Personal Identity Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adebayo Ogunlesi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+234 813 000 0000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bio / Description *</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief bio or description for your profile and store..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-medium"
                  />
                </div>
              </div>

              {/* Business / Storefront Metadata */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Storefront & Merchant Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Business / Store Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Ogunlesi Tech Store"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">CAC Registration Number (Optional)</label>
                    <input
                      type="text"
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value)}
                      placeholder="e.g. RC-1849204"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Operating Hours</span>
                    </label>
                    <input
                      type="text"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      placeholder="Mon - Sat: 8:00 AM - 7:00 PM"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Primary Location Hub *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Under G, Ogbomoso"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Communication & Privacy Preferences */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>Communication & Privacy Controls</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Email Digest & Alerts</p>
                      <p className="text-[10px] text-slate-500">Receive weekly marketplace deals</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${emailNotifications ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">WhatsApp Direct Messages</p>
                      <p className="text-[10px] text-slate-500">Allow buyers to chat via WhatsApp</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWhatsappNotifications(!whatsappNotifications)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${whatsappNotifications ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${whatsappNotifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Mask Phone Number</p>
                      <p className="text-[10px] text-slate-500">Hide phone from non-logged users</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHidePhonePublicly(!hidePhonePublicly)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${hidePhonePublicly ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${hidePhonePublicly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Hide Street Location</p>
                      <p className="text-[10px] text-slate-500">Display only city (Ogbomoso)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHideLocationPublicly(!hideLocationPublicly)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${hideLocationPublicly ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${hideLocationPublicly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bank Settlement Account for Payouts */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Bank Settlement Account (For Wallet Withdrawals)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bank Name</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="10-Digit Account No."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Match official bank name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media & External Links */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Social Media & Web Storefront Links</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <span>Instagram Handle</span>
                    </label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@yourstore"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5 text-blue-400" />
                      <span>X / Twitter Handle</span>
                    </label>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@yourstore"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Website / Portfolio</span>
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourstore.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {user.role !== 'admin' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`py-3 rounded-xl text-xs font-black transition-all border ${
                        role === 'buyer'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Casual Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`py-3 rounded-xl text-xs font-black transition-all border ${
                        role === 'seller'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Merchant / Seller
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Synchronizing to Supabase...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </div>
        </form>

        {/* IDENTITY VERIFICATION & SECURITY */}
        <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Trust, Verification & Password</h2>
                <p className="text-xs text-slate-400">Increase buyer trust with an official Sealify Badge</p>
              </div>
            </div>

            {user.verified ? (
              <VerifiedBadge type={user.verificationType || 'individual'} showText />
            ) : (
              <button
                type="button"
                onClick={() => setIsVerificationOpen(true)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow hover:bg-emerald-400 transition-colors"
              >
                Apply for Badge
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Verification Level</span>
              <p className="font-extrabold text-sm text-white capitalize">{user.verificationType || 'None (Unverified)'}</p>
              <p className="text-[11px] text-slate-400">Verified badges increase buyer inquiry rate by up to 500%.</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Account Security</span>
                <p className="font-extrabold text-sm text-white">NIN-Verified Password Reset</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 hover:underline pt-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Request Password Reset</span>
              </button>
            </div>
          </div>
        </section>

        {/* PWA DIRECT INSTALLATION */}
        <section>
          <PwaInstallButton variant="card" />
        </section>

        {/* PERMISSIONS & DEVICE CONTROLS */}
        <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-6 shadow-xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> 
            <span>Device Permissions & Security</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Push Notifications</p>
                  <p className="text-[10px] text-slate-400">Real-time price drop and buyer inquiry alerts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission().then(p => {
                      if (p === 'granted') toast.success('Notifications active');
                    });
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold rounded-xl text-xs transition-colors border border-slate-700"
              >
                ENABLE
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Biometric App Lock</p>
                  <p className="text-[10px] text-slate-400">Require fingerprint or FaceID on launch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleBiometric}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  biometricEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {biometricEnabled ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* STOREFRONT DISTRIBUTION URL */}
        <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Storefront Share Link</h2>
              <p className="text-xs text-slate-400">Share your store profile on WhatsApp Status or social media</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              readOnly
              value={storefrontUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-emerald-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(storefrontUrl);
                toast.success('Storefront URL copied to clipboard!');
              }}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-xs shadow-lg transition-transform active:scale-95 shrink-0"
            >
              COPY
            </button>
          </div>
        </section>
      </main>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Settings;