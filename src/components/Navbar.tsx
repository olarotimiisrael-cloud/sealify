import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import AuthModal from './AuthModal';
import SqlSchemaViewer from './SqlSchemaViewer';
import SafetyTipsModal from './SafetyTipsModal';
import { 
  ShieldCheck, 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Database,
  Search,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, savedListingIds, conversations, filters, setFilters } = useSealify();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        {/* Top Mini Bar */}
        <div className="bg-emerald-600 text-xs py-1 px-4 text-center font-medium flex justify-between items-center max-w-7xl mx-auto">
          <button 
            onClick={() => setIsSafetyModalOpen(true)}
            className="flex items-center gap-1 hover:underline text-white font-semibold cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sealify Safety Protocol — Read Buyer & Seller Tips</span>
          </button>

          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1 hover:underline text-emerald-100 font-semibold cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>View DB Schema</span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Sealify
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold -mt-1">Verified Classifieds</p>
            </div>
          </Link>

          {/* Quick Search Header bar for desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-lg relative">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search phones, cars, apartments..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-800 text-white pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Nav Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Safety Guidelines"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <Link
              to="/saved"
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Saved Ads"
            >
              <Heart className="w-5 h-5" />
              {savedListingIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {savedListingIds.length}
                </span>
              )}
            </Link>

            <Link
              to="/messages"
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-400 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                <Link
                  to="/my-ads"
                  className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-lg text-sm text-slate-200"
                >
                  <img
                    src={user?.avatarUrl}
                    alt={user?.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-xs leading-none">{user?.fullName}</p>
                    <p className="text-[10px] text-emerald-400 font-medium capitalize">{user?.role}</p>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-emerald-400 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}

            <Link
              to="/post-ad"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>SELL NOW</span>
            </Link>
          </div>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search phone, cars, flats..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-slate-800 text-white pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-sm">
              <Link
                to="/saved"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg text-slate-200"
              >
                <Heart className="w-4 h-4 text-emerald-400" />
                <span>Saved Ads ({savedListingIds.length})</span>
              </Link>
              <Link
                to="/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg text-slate-200"
              >
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span>Inbox</span>
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl">
                <Link
                  to="/my-ads"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img src={user?.avatarUrl} className="w-8 h-8 rounded-full border border-emerald-400" />
                  <div>
                    <p className="font-bold text-sm">{user?.fullName}</p>
                    <p className="text-xs text-emerald-400">My Listings & Profile</p>
                  </div>
                </Link>
                <button onClick={logout} className="text-xs text-red-400 font-semibold">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2 bg-slate-800 text-emerald-400 font-bold rounded-xl text-sm text-center"
              >
                Login / Register
              </button>
            )}

            <Link
              to="/post-ad"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-2.5 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-center shadow"
            >
              + POST AN AD
            </Link>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* SQL Migration Modal */}
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />

      {/* Safety Guidelines Modal */}
      <SafetyTipsModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
    </>
  );
};

export default Navbar;