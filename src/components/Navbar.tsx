import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import AuthModal from './AuthModal';
import SqlSchemaViewer from './SqlSchemaViewer';
import SafetyTipsModal from './SafetyTipsModal';
import CompareModal from './CompareModal';
import SavedAlertsModal from './SavedAlertsModal';
import NotificationCenter from './NotificationCenter';
import VerifiedBadge from './VerifiedBadge';
import { 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Search,
  Menu,
  X,
  HelpCircle,
  Scale,
  Bell,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin,
    logout, 
    savedListingIds, 
    conversations, 
    filters, 
    setFilters, 
    listings,
    compareListingIds,
    notifications
  } = useSealify();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const liveSearchResults = filters.searchQuery.trim()
    ? listings.filter((l) =>
        l.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
    setIsSearchFocused(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Prominent Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="Sealify Logo"
              className="w-11 h-11 sm:w-13 sm:h-13 object-contain rounded-2xl group-hover:scale-105 transition-transform shadow-md bg-slate-950/40 p-0.5 border border-slate-800"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1 leading-none">
                Sealify
              </span>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-extrabold mt-0.5">
                Nigeria's Jiji
              </p>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-lg relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search phones, cars, electronics, real estate..."
                value={filters.searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={handleSearchChange}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border border-slate-700/80 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
            </div>

            {isSearchFocused && liveSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1">Matching Classifieds</p>
                {liveSearchResults.map((item) => (
                  <Link
                    key={item.id}
                    to={`/listing/${item.id}`}
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-xl transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-xs text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400">{item.category} • {item.location}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-400 shrink-0">₦{item.price.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="relative p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Compare Listings"
            >
              <Scale className="w-5 h-5" />
              {compareListingIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {compareListingIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Safety Rules"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <Link
              to="/saved"
              className="relative p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Saved Ads"
            >
              <Heart className="w-5 h-5" />
              {savedListingIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {savedListingIds.length}
                </span>
              )}
            </Link>

            <Link
              to="/messages"
              className="relative p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Inbox Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnreadMessages > 0 && (
                <span className="absolute top-1 right-1 bg-teal-400 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-xs px-3 py-2 rounded-xl hover:bg-rose-500/20 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>ADMIN</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <Link
                  to="/my-ads"
                  className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-xl text-sm text-slate-200"
                >
                  <img
                    src={user?.avatarUrl}
                    alt={user?.fullName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <div className="text-left hidden lg:block">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs leading-none text-white">{user?.fullName}</p>
                      {user?.verified && (
                        <VerifiedBadge type={user.verificationType || 'individual'} />
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-400 font-extrabold capitalize mt-0.5">{user?.role}</p>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                  title="Settings"
                >
                  <SettingsIcon className="w-4.5 h-4.5" />
                </Link>

                <button
                  onClick={logout}
                  className="p-2.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-emerald-400 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}

            <Link
              to="/post-ad"
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-xs tracking-wider"
            >
              <PlusCircle className="w-4 h-4" />
              <span>SELL AD</span>
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-slate-300 hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search phones, vehicles, flats..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-slate-950 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <Link
                to="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Admin Login</span>
              </Link>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCompareModalOpen(true);
                }}
                className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
              >
                <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compare ({compareListingIds.length})</span>
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <Link
                  to={isAdmin ? '/admin' : '/my-ads'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <img src={user?.avatarUrl} className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover" />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-black text-xs text-white">{user?.fullName}</p>
                      {user?.verified && (
                        <VerifiedBadge type={user.verificationType || 'individual'} />
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-400 font-bold">{isAdmin ? 'Admin Panel' : 'My Ads & Profile'}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Settings
                  </Link>
                  <button onClick={logout} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-bold">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 bg-slate-950 text-emerald-400 font-black rounded-xl text-xs text-center border border-slate-800"
              >
                Login / Register Free Account
              </button>
            )}

            <Link
              to="/post-ad"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-center shadow-lg text-xs tracking-wider"
            >
              + POST CLASSIFIED AD
            </Link>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <SafetyTipsModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
      <CompareModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} />
      <SavedAlertsModal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} />
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

export default Navbar;