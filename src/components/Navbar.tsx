import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import MagicSearch from './MagicSearch';
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
  Command
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

  const [isMagicSearchOpen, setIsMagicSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

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
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          
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
            <Link to="/vendors" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors mr-1">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Vendors</span>
            </Link>

            <Link to="/safety" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors mr-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety Center</span>
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

            {isAdmin && (
              <Link to="/admin" className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black text-[10px] rounded-xl">ADMIN</Link>
            )}

            {isAuthenticated && (
              <>
                <Link 
                  to={isAdmin ? '/admin' : '/my-ads'} 
                  className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-xl border border-slate-800 transition-colors"
                >
                  <img 
                    src={user?.avatarUrl} 
                    className="w-8 h-8 rounded-full border border-emerald-500" 
                    alt={user?.fullName}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                    }}
                  />
                  <span className="text-xs font-bold hidden xl:inline">{user?.fullName}</span>
                </Link>
                
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            <Link to="/post-ad" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg">
              {t('post_free_ad').toUpperCase()}
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setIsMagicSearchOpen(true)} className="p-2 text-emerald-400">
              <Search className="w-6 h-6" />
            </button>
            <Link to="/notifications" className="relative p-2 text-slate-300">
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
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
    </>
  );
};

export default Navbar;