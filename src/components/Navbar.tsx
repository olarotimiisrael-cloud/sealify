import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import MagicSearch from './MagicSearch';
import EscrowProtectionModal from './EscrowProtectionModal';
import AiShoppingAssistantModal from './AiShoppingAssistantModal';
import Logo from './Logo';
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
  Shield,
  TrendingUp,
  HelpCircle,
  Users,
  PlayCircle,
  ArrowLeft,
  Newspaper,
  BadgeCheck,
  Bot,
  Sparkles
} from 'lucide-react';

const languages: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ig', label: 'Igbo' },
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
    siteSettings,
    t
  } = useSealify();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const [isMagicSearchOpen, setIsMagicSearchOpen] = useState(false);
  const [isEscrowOpen, setIsEscrowOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
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

  const isHome = pathname === '/';

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl font-sans">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 sm:gap-4">
            {!isHome && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-emerald-400 transition-all shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            <Link to="/" className="flex items-center shrink-0">
              <Logo size="md" />
            </Link>
          </div>

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
            {/* AI Copilot Button */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black transition-all shadow shadow-emerald-500/10 active:scale-95"
              title="Open Sealify AI Copilot Assistant"
            >
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>AI Copilot</span>
            </button>

            <Link to="/vendors" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors mr-1">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Vendors</span>
            </Link>

            <Link to="/community" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors mr-1">
              <Newspaper className="w-4 h-4 text-amber-400" />
              <span>Community</span>
            </Link>

            <Link to="/how-it-works" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors mr-1">
              <PlayCircle className="w-4 h-4" />
              <span>Guide</span>
            </Link>

            <Link to="/requests" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors mr-1 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('requests')}</span>
            </Link>

            <Link to="/market-insights" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors mr-1 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('insights')}</span>
            </Link>

            <button
              onClick={() => setIsEscrowOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors mr-1 bg-teal-500/10 rounded-xl border border-teal-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('safe_escrow')}</span>
            </button>

            <div className="relative group">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{language.toUpperCase()}</span>
              </button>

              {showLangMenu && (
                <div className="absolute top-full mt-2 right-0 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 grid grid-cols-1 gap-1">
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

            <Link to="/notifications" className="relative p-2.5 hover:bg-slate-800 rounded-xl text-slate-300" title={t('notifications')}>
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 p-1.5 pr-3 rounded-2xl border border-emerald-500/40 shadow-lg transition-all group"
                >
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" 
                      alt={user?.fullName}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="text-left hidden xl:block min-w-0">
                    <p className="text-xs font-black text-white truncate leading-tight">{user?.fullName}</p>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{isAdmin ? 'Admin' : user?.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </button>

                {showUserDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs space-y-0.5">
                    <Link to="/my-ads" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>{t('my_ads')}</span>
                    </Link>
                    <Link to="/vendors" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Merchant Directory</span>
                    </Link>
                    <Link to="/escrow-verify" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors">
                      <BadgeCheck className="w-4 h-4 text-teal-400" />
                      <span>Verify Escrow Code</span>
                    </Link>
                    <Link to="/settings" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors">
                      <SettingsIcon className="w-4 h-4 text-purple-400" />
                      <span>{t('settings')}</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-rose-500/20 bg-rose-500/10 rounded-xl text-rose-400 font-black transition-colors my-1 border border-rose-500/20">
                        <Shield className="w-4 h-4 text-rose-400" />
                        <span>Admin Terminal</span>
                      </Link>
                    )}
                    <button onClick={() => { setShowUserDropdown(false); logout(); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl font-bold transition-colors border-t border-slate-800 mt-1">
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-black rounded-xl text-xs border border-slate-700 transition-all flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{t('login')}</span>
              </button>
            )}

            <Link to="/post-ad" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg">
              {t('post_free_ad').toUpperCase()}
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setIsAiAssistantOpen(true)} className="p-2 text-emerald-400" title="AI Copilot">
              <Bot className="w-6 h-6 animate-pulse" />
            </button>
            <button onClick={() => setIsMagicSearchOpen(true)} className="p-2 text-emerald-400">
              <Search className="w-6 h-6" />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {languages.map(l => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); setIsMobileMenuOpen(false); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shrink-0 ${language === l.code ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>
                    {l.label}
                  </button>
                ))}
             </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button onClick={() => { setIsMobileMenuOpen(false); setIsAiAssistantOpen(true); }} className="py-2.5 bg-slate-950 border border-emerald-500/30 text-emerald-400 rounded-xl text-center flex items-center justify-center gap-1.5 font-black">
                <Bot className="w-4 h-4" /> AI Copilot
              </button>
              <Link to="/vendors" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 bg-slate-950 border border-slate-800 text-amber-400 rounded-xl text-center flex items-center justify-center gap-1.5">
                <Building2 className="w-4 h-4" /> Vendors
              </Link>
              <Link to="/community" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 bg-slate-950 border border-slate-800 text-teal-400 rounded-xl text-center flex items-center justify-center gap-1.5">
                <Newspaper className="w-4 h-4" /> Community
              </Link>
              <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 bg-slate-950 border border-slate-800 text-emerald-400 rounded-xl text-center flex items-center justify-center gap-1.5">
                <PlayCircle className="w-4 h-4" /> Guide
              </Link>
            </div>
            <Link to="/requests" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold rounded-xl text-center text-xs">
              {t('requests')}
            </Link>
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
      <AiShoppingAssistantModal isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} />
    </>
  );
};

export default Navbar;