import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { User, Settings as SettingsIcon, Save, ShieldCheck, LogIn, UserPlus, Globe, MessageSquare, Bell } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { LanguageSwitcher } from './LanguageSwitcher';

const Navbar = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { t } = useSealify();
  const { isAdmin } = useSealify();
  const { user, conversations } = useSealify();
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <nav className="bg-white border-b border-emerald-50 sticky top-0 z-50 shadow-sm">
      <div className="relative">
        {/* Top accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1 bg-emerald-500/10 rounded-lg border border-emerald-200 group-hover:border-emerald-500/50 transition-colors">
                <img src="/logo.png" alt="Sealify" className="h-8 w-8" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">Sealify</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Home</Link>
              <Link to="/listings" className="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Listings</Link>
              <Link to="/services" className="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Services</Link>
              <Link to="/how-it-works" className="text-slate-800 hover:text-emerald-600 transition-colors font-bold">How It Works</Link>
              <Link to="/contact" className="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Contact</Link>
            </div>

            <div className="flex items-center gap-3">
              <NavLink
                to="/messages"
                className="relative"
              >
                <MessageSquare className="w-5 h-5 text-slate-800 hover:text-emerald-600 transition-colors" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
                    {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                  </span>
                )}
              </NavLink>
              <button className="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl"
              >
                <User className="w-5 h-5" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-wider">User Menu</p>
                  </div>

                  <Link
                    to="/auth/signup"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>{t('signup')}</span>
                  </Link>

                  <Link
                    to="/auth/login"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-emerald-600" />
                    <span>{t('login')}</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-purple-600" />
                    <span>{t('settings')}</span>
                  </Link>

                  <Link
                    to="/saved-searches"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors"
                  >
                    <Save className="w-4 h-4 text-blue-600" />
                    <span>Saved Searches</span>
                  </Link>

                  {isAdmin && (
                    <div>
                      <Link
                        to="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-900 font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span>Admin Panel</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

