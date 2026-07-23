import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import MagicSearch from './MagicSearch';
import EscrowProtectionModal from './EscrowProtectionModal';
import AuthModal from './AuthModal';
import { SupportedLanguage } from '../translations/languages';
import { 
  Heart, 
  MessageSquare, 
  LogOut, 
  Search,
  Menu,
  X,
  Bell,
  Globe,
  ShieldCheck,
  Building2,
  Command,
  Lock,
  Settings as SettingsIcon,
  Package,
  User,
  Store,
  ChevronDown,
  Shield
} from 'lucide-react';

const languages: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'pg', label: 'Pidgin' },
  { code: 'ha', label: 'Hausa' },
  { code: 'fr', label: 'Français' },
  { code: 'zh', label: '中文' },
];

const Navbar: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin,
    logout, 
    notifications,
    language,
    setLanguage,
    t
  } = useSealify();

  const navigate = useNavigate();
  const [isMagicSearchOpen, setIsMagicSearchOpen] = useState(false);
  const [isEscrowOpen, setIsEscrowOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsMagicSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl font-sans">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          
          <Link to="/" className="flex items-center shrink-0">
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-700">
              <img 
                src="/logo.png" 
                alt="Sealify Logo" 
                className="h-8 sm:h-10 w-auto object-contain" 
              />
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md">
            <button 
              onClick={() => setIsMagicSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-slate-400 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">{t('search_placeholder')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800 rounded-md border border-slate-700 text-[10px] font-black group-hover:text-emerald-400 transition-colors">
                  <Command className="w-2.5 h-2.5" />
                  <span>K</span>
                </div>
              </div>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsEscrowOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors mr-1 bg-teal-500/10 rounded-xl border border-teal-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Safe Escrow Protocol</span>
            </button>

            <Link to="/vendors" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors mr-1">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Vendors</span>
            </Link>

            <Link to="/safety" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors mr-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety</span>
            </Link>

            <div className="relative group">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{language.toUpperCase()}</span>
              </button>

              {showLangMenu && (
                <div className="absolute top-full mt-2 right-0 w-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${language === lang.code ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/notifications" className="relative p-2.5 hover:bg-slate-800 rounded-xl text-slate-300">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <Link to="/messages" className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300">
              <MessageSquare className="w-5 h-5" />
            </Link>

            <Link to="/saved" className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Prominent High-Visibility Profile Avatar / Dropdown for Everyone */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 p-1.5 pr-3 rounded-2xl border border-emerald-500/40 shadow-lg transition-all group"
                >
                  <div className="relative">
                    <img 
                      src={user?.avatarUrl} 
                      className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" 
                      alt={user?.fullName}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                      }}
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-slate-900 animate-pulse"></span>
                  </div>
                  <div className="text-left hidden xl:block min-w-0">
                    <p className="text-xs font-black text-white truncate leading-tight">{user?.fullName}</p>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{isAdmin ? 'Admin' : user?.role || 'Member'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-2">
                      <p className="font-extrabold text-white truncate">{user?.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={`/seller/${user?.id}`}
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors"
                    >
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>My Public Storefront</span>
                    </Link>

                    <Link
                      to="/my-ads"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors"
                    >
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>My Ads & Inventory</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-purple-400" />
                      <span>Account & Store Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2.5 hover:bg-rose-500/20 bg-rose-500/10 rounded-xl text-rose-400 font-black transition-colors my-1 border border-rose-500/20"
                      >
                        <Shield className="w-4 h-4 text-rose-400" />
                        <span>Admin Terminal</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl font-bold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-black rounded-xl text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Log In / Register</span>
              </button>
            )}

            <Link to="/post-ad" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg">
              {t('post_free_ad').toUpperCase()}
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setIsMagicSearchOpen(true)} className="p-2 text-emerald-400">
              <Search className="w-6 h-6" />
            </button>

            {isAuthenticated ? (
              <Link to="/my-ads" className="relative p-1">
                <img 
                  src={user?.avatarUrl} 
                  className="w-8 h-8 rounded-full border-2 border-emerald-500 object-cover" 
                  alt={user?.fullName} 
                />
              </Link>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="p-2 text-slate-300">
                <User className="w-6 h-6" />
              </button>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/vendors" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold">
                <Building2 className="w-4 h-4 text-emerald-400" /> Merchants
              </Link>
              <Link to="/safety" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Safety
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/my-ads" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold">
                    <Package className="w-4 h-4 text-amber-400" /> My Ads
                  </Link>
                  <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold">
                    <SettingsIcon className="w-4 h-4 text-purple-400" /> Settings
                  </Link>
                </>
              )}
            </div>
            <Link to="/post-ad" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-3.5 bg-emerald-500 text-slate-950 font-black rounded-2xl text-center">
              {t('post_free_ad').toUpperCase()}
            </Link>
          </div>
        )}

        {isMagicSearchOpen && (
          <MagicSearch isOpen={isMagicSearchOpen} onClose={() => setIsMagicSearchOpen(false)} />
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <EscrowProtectionModal isOpen={isEscrowOpen} onClose={() => setIsEscrowOpen(false)} />
    </>
  );
};

export default Navbar;