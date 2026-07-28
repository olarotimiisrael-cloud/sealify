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
  ExternalLink,
  Package,
  MessageSquare,
  TrendingUp,
  Settings as SettingsIcon,
  Wallet as WalletIcon,
  HelpCircle,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  Crown,
  Star,
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit3,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  History,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Shield,
  Lock,
  Unlock,
  Users,
  Heart,
  Tag,
  DollarSign,
  Truck,
  Smartphone,
  Laptop,
  Home,
  Car,
  Shirt,
  Sparkles,
  Wrench,
  Briefcase,
  GraduationCap,
  Building,
  Zap as ZapIcon,
  ShieldCheck as ShieldCheckIcon,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Image,
  Video,
  Music,
  Film,
  Code,
  Database as DatabaseIcon,
  Server,
  Cloud,
  Globe as GlobeIcon,
  Wifi,
  Bluetooth,
  Usb,
  Hdd,
  Monitor,
  Printer,
  Scanner,
  Fax,
  Landline,
  Mobile,
  Tablet,
  Watch,
  Headphones,
  Mic,
  Speaker,
  Keyboard,
  Mouse,
  Cpu,
  HardDrive,
  MemoryStick,
  Battery,
  Power,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Usb as UsbIcon,
  Hdd as HddIcon,
  Monitor as MonitorIcon,
  Printer as PrinterIcon,
  Scanner as ScannerIcon,
  Fax as FaxIcon,
  Landline as LandlineIcon,
  Mobile as MobileIcon,
  Tablet as TabletIcon,
  Watch as WatchIcon,
  Headphones as HeadphonesIcon,
  Mic as MicIcon,
  Speaker as SpeakerIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  MemoryStick as MemoryStickIcon,
  Battery as BatteryIcon,
  Power as PowerIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

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
  const { 
    user, 
    updateUser, 
    isSyncing, 
    lastSyncTime, 
    syncDatabase, 
    exportDatabaseBackup, 
    listings, 
    wallet,
    transactions,
    requestPayout,
    conversations,
    savedListingIds,
    reviews,
    buyerRequests,
    notifications,
    addNotification,
    logout,
    isAdmin
  } = useSealify();
  
  const navigate = useNavigate();
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
  const [activeSection, setActiveSection] = useState<'profile' | 'storefront' | 'wallet' | 'security' | 'notifications' | 'pwa'>('profile');
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('sealify_biometric') === 'true'
  );

  const myAdsCount = listings.filter(l => l.sellerId === user?.id).length;
  const activeAdsCount = listings.filter(l => l.sellerId === user?.id && l.status === 'active').length;
  const soldAdsCount = listings.filter(l => l.sellerId === user?.id && l.status === 'sold').length;
  const totalViews = listings.filter(l => l.sellerId === user?.id).reduce((acc, l) => acc + (l.viewsCount || 0), 0);
  const totalInventoryValue = listings.filter(l => l.sellerId === user?.id && l.status === 'active').reduce((acc, l) => acc + l.price, 0);
  const storefrontUrl = `${window.location.origin}/seller/${user?.id}`;

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setBusinessName(user.businessName || '');
      setCacNumber(user.cacNumber || '');
      setBusinessHours(user.businessHours || 'Mon - Sat: 8:00 AM - 7:00 PM');
      setLocation(user.location || 'Under G, Ogbomoso');
      setBio(user.bio || '');
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

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sectionConfig = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Personal info, bio, contact details' },
    { id: 'storefront', label: 'Storefront', icon: Store, desc: 'Business details, cover photo, social links' },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon, desc: 'Balance, transactions, payouts' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Password, biometric, 2FA, sessions' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email, push, WhatsApp preferences' },
    { id: 'pwa', label: 'Mobile App', icon: Smartphone, desc: 'Install PWA, offline access' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO title="Profile & Store Settings — Sealify Nigeria" description="Edit your profile details, cover photo, business information, bank payout details, and app security settings on Sealify." />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        
        {/* Header Title */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Profile & Store Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your identity, cover photo, bio, bank payout account, and storefront branding</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/seller/${user.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-2xl text-xs border border-slate-800 transition-colors shadow-lg"
            >
              <Store className="w-4 h-4" />
              <span>View My Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Database Synchronization Status Bar */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-300">Database Sync Status:</span>
            <span className="text-emerald-400 font-mono text-[11px]">{isSyncing ? 'Synchronizing...' : `Connected (Synced ${lastSyncTime})`}</span>
          </div>

          <button
            onClick={() => syncDatabase()}
            disabled={isSyncing}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-4 space-y-2 sticky top-24">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-10 h-10 rounded-xl object-cover border border-emerald-500" alt={user.fullName} />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{user.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {sectionConfig.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all ${
                      activeSection === section.id
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <div className="text-left">
                      <p>{section.label}</p>
                      <p className="text-[9px] opacity-60">{section.desc}</p>
                    </div>
                  </button>
                ))}
              </nav>

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Terminal</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <>
                {/* Profile Header Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <div className="relative group shrink-0">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-emerald-500 shadow-xl bg-slate-950" 
                          alt="Avatar"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 shadow-xl">
                          <User className="w-8 h-8 sm:w-10 sm:h-10" />
                          <span className="text-[8px] font-extrabold uppercase mt-0.5">No Photo</span>
                        </div>
                      )}
                      <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black hover:scale-110 transition-transform"
                        title="Change Profile Picture"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{fullName || 'Your Name'}</h1>
                        {user.verified ? (
                          <VerifiedBadge type={user.verificationType || 'individual'} showText />
                        ) : (
                          <button
                            onClick={() => setIsVerificationOpen(true)}
                            className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Get Verified Badge</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs pt-1 font-semibold text-slate-400 justify-center sm:justify-start flex-wrap">
                        <span>Active Ads: <strong className="text-emerald-400 font-black">{activeAdsCount}</strong></span>
                        <span>Sold: <strong className="text-teal-400 font-black">{soldAdsCount}</strong></span>
                        <span>Views: <strong className="text-amber-400 font-black">{totalViews}</strong></span>
                        <span>Value: <strong className="text-purple-400 font-black">{formatNGN(totalInventoryValue)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end w-full lg:w-auto relative z-10">
                    <Link 
                      to="/wallet"
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/20 transition-all group"
                    >
                      <WalletIcon className="w-4 h-4" />
                      <div className="text-left">
                        <p className="text-[8px] font-black uppercase leading-none opacity-60">Wallet Balance</p>
                        <p className="text-sm font-black leading-tight">{formatNGN(wallet?.balance || 0)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 ml-1 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-4 py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-bold rounded-2xl text-xs border border-rose-500/20 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>

                    <Link
                      to="/post-ad"
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Ad</span>
                    </Link>
                  </div>
                </div>

                {/* Profile Edit Form */}
                <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl">
                  
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                      <User className="w-5 h-5 text-emerald-400" />
                      <span>Personal Identity Information</span>
                    </h3>

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

                  {/* Communication & Privacy Preferences */}
                  <div className="space-y-6 pt-6 border-t border-slate-800">
                    <h3 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                      <Bell className="w-5 h-5 text-teal-400" />
                      <span>Communication & Privacy Controls</span>
                    </h3>

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

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Synchronizing to Supabase...' : 'Save Profile Changes'}</span>
                  </button>
                </form>
              </>
            )}

            {/* Storefront Section */}
            {activeSection === 'storefront' && (
              <>
                {/* Cover Photo Header Manager */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="relative h-44 sm:h-56 bg-slate-950 overflow-hidden flex items-center justify-center group">
                    {storeBannerUrl ? (
                      <img
                        src={storeBannerUrl}
                        alt="Store Cover Banner"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-xs">
                        <Layout className="w-5 h-5" />
                        <span>Upload Storefront Cover Photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                    <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute top-4 right-4 px-3.5 py-2 bg-slate-950/80 backdrop-blur-md text-emerald-400 hover:text-white rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 shadow-xl hover:scale-105 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{storeBannerUrl ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
                    </button>
                  </div>

                  <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                      <div className="relative group shrink-0">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-emerald-500 shadow-xl bg-slate-950" 
                            alt="Avatar"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 shadow-xl">
                            <User className="w-8 h-8 sm:w-10 sm:h-10" />
                            <span className="text-[8px] font-extrabold uppercase mt-0.5">No Photo</span>
                          </div>
                        )}
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black hover:scale-110 transition-transform"
                          title="Change Profile Picture"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{fullName || 'Your Name'}</h1>
                          {user.verified ? (
                            <VerifiedBadge type={user.verificationType || 'individual'} showText />
                          ) : (
                            <button
                              onClick={() => setIsVerificationOpen(true)}
                              className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 transition-colors"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Get Verified Badge</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </div>

                    {/* Storefront Metadata */}
                    <div className="space-y-6 pt-4 border-t border-slate-800">
                      <h3 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <span>Storefront & Merchant Details</span>
                      </h3>

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

                    {/* Bank Settlement Account */}
                    <div className="space-y-6 pt-6 border-t border-slate-800">
                      <h3 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                        <span>Bank Settlement Account (For Wallet Withdrawals)</span>
                      </h3>

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
                    <div className="space-y-6 pt-6 border-t border-slate-800">
                      <h3 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        <span>Social Media & Web Storefront Links</span>
                      </h3>

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

                    {/* Storefront Share Link */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                      <h3 className="text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                        <Share2 className="w-5 h-5 text-amber-400" />
                        <span>Storefront Share Link</span>
                      </h3>

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
                    </div>

                    <button
                      type="submit"
                      form="profile-form"
                      disabled={isSaving}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Synchronizing to Supabase...' : 'Save Storefront Changes'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Wallet Section */}
            {activeSection === 'wallet' && (
              <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Available Balance</span>
                      <WalletIcon className="w-5 h-5 text-white/50" />
                    </div>
                    <p className="text-4xl font-black text-white">{formatNGN(wallet?.balance || 0)}</p>
                    <button 
                      onClick={() => setActiveSection('wallet')}
                      className="w-full py-3 bg-white text-emerald-700 font-black rounded-2xl text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      WITHDRAW TO BANK
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Escrow Pending</span>
                    </div>
                    <p className="text-2xl font-black text-white">{formatNGN(wallet?.pendingBalance || 0)}</p>
                    <p className="text-[10px] text-slate-500">Locked until buyers confirm delivery</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Total Withdrawn</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">{formatNGN(wallet?.totalWithdrawn || 0)}</p>
                    <p className="text-[10px] text-slate-500">Lifetime earnings processed</p>
                  </div>
                </div>

                {/* Transaction History */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white">Recent Transactions</h2>
                    <button className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Refresh Feed
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl divide-y divide-slate-800">
                    {transactions.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 text-xs italic">No financial activity recorded yet.</div>
                    ) : (
                      transactions.map((tx) => (
                        <div key={tx.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border ${
                              tx.type === 'sale' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              tx.type === 'payout' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                              'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {tx.type === 'sale' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white">{tx.description}</h4>
                              <p className="text-[10px] text-slate-500 flex items-center gap-2">
                                {tx.createdAt} • <span className="uppercase font-black text-emerald-500/80">{tx.status}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {tx.amount > 0 ? '+' : '-'}{formatNGN(tx.amount)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Bank Details Hint */}
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-start gap-4">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white uppercase tracking-widest">Settlement Bank</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Withdrawals are processed to the bank account linked in your profile settings. Standard settlement time is 2-4 hours across the Ogbomoso Node.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                {/* Password & Verification */}
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

                {/* Device Permissions */}
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

                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">Two-Factor Authentication (2FA)</p>
                          <p className="text-[10px] text-slate-400">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold rounded-xl text-xs transition-colors border border-slate-700">
                        SETUP 2FA
                      </button>
                    </div>
                  </div>
                </section>

                {/* Active Sessions */}
                <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-4 shadow-xl">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" /> 
                    <span>Active Sessions</span>
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Current Session</p>
                          <p className="text-[10px] text-slate-400">Chrome on Android • Ogbomoso, NG</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active Now</span>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 text-slate-500 rounded-xl">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-300">Desktop Session</p>
                          <p className="text-[10px] text-slate-500">Chrome on Windows • Last active 2 days ago</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-rose-500/10 text-rose-400 font-bold rounded-lg text-[10px] hover:bg-rose-500/20">Revoke</button>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition-colors border border-slate-700">
                    Revoke All Other Sessions
                  </button>
                </section>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-400" /> 
                    <span>Notification Preferences</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Price Drop Alerts</p>
                          <p className="text-[10px] text-slate-400">Get notified when saved items drop in price</p>
                        </div>
                        <button className="w-11 h-6 rounded-full bg-emerald-500 relative p-0.5">
                          <div className="w-5 h-5 rounded-full bg-slate-950 translate-x-5 transition-transform"></div>
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500">Enabled for all saved searches</div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">New Message Alerts</p>
                          <p className="text-[10px] text-slate-400">Instant notifications for buyer inquiries</p>
                        </div>
                        <button className="w-11 h-6 rounded-full bg-emerald-500 relative p-0.5">
                          <div className="w-5 h-5 rounded-full bg-slate-950 translate-x-5 transition-transform"></div>
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500">Push + Email for all conversations</div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Weekly Market Digest</p>
                          <p className="text-[10px] text-slate-400">Top deals and market trends every Monday</p>
                        </div>
                        <button className="w-11 h-6 rounded-full bg-emerald-500 relative p-0.5">
                          <div className="w-5 h-5 rounded-full bg-slate-950 translate-x-5 transition-transform"></div>
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500">Sent every Monday 9:00 AM</div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Promotion Expiry Reminders</p>
                          <p className="text-[10px] text-slate-400">Alert before Top Ad boost expires</p>
                        </div>
                        <button className="w-11 h-6 rounded-full bg-emerald-500 relative p-0.5">
                          <div className="w-5 h-5 rounded-full bg-slate-950 translate-x-5 transition-transform"></div>
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500">48 hours before expiry</div>
                    </div>
                  </div>
                </section>

                {/* Recent Notifications */}
                <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-emerald-400" /> 
                      <span>Recent Notifications</span>
                    </h2>
                    <span className="text-[10px] font-mono text-emerald-400">{notifications.length} total</span>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs italic">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 20).map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 rounded-2xl border transition-colors flex items-start gap-4 ${
                            notif.read
                              ? 'bg-slate-950/40 border-slate-800/80'
                              : 'bg-slate-900 border-emerald-500/20 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/10'
                          }`}
                        >
                          <div className={`p-3 rounded-xl border shrink-0 ${notif.type === 'price_drop' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : notif.type === 'message' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            {notif.type === 'price_drop' && <TrendingDown className="w-5 h-5" />}
                            {notif.type === 'message' && <MessageSquare className="w-5 h-5" />}
                            {notif.type === 'offer' && <Tag className="w-5 h-5" />}
                            {notif.type === 'recommendation' && <Sparkles className="w-5 h-5" />}
                            {notif.type === 'payment' && <CheckCircle2 className="w-5 h-5" />}
                            {notif.type === 'system' && <Info className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className={`text-sm font-bold truncate ${notif.read ? 'text-slate-400' : 'text-white'}`}>
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-slate-500 shrink-0">{notif.time}</span>
                            </div>
                            <p className={`text-xs leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-300'}`}>
                              {notif.description}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* PWA Section */}
            {activeSection === 'pwa' && (
              <div className="space-y-6">
                <PwaInstallButton variant="card" />
                
                <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-400" /> 
                    <span>App Features & Capabilities</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Zap, title: 'Instant Load', desc: 'Cached for offline browsing' },
                      { icon: Bell, title: 'Push Alerts', desc: 'Real-time buyer notifications' },
                      { icon: Wifi, title: 'Offline Mode', desc: 'Browse saved ads without internet' },
                      { icon: Shield, title: 'Secure Storage', desc: 'Encrypted local data' },
                      { icon: Smartphone, title: 'Native Feel', desc: 'Full-screen app experience' },
                      { icon: Download, title: 'Auto Updates', desc: 'Always latest version' },
                    ].map((feature) => (
                      <div key={feature.title} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-3 group">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0 group-hover:scale-110 transition-transform">
                          <feature.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{feature.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
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