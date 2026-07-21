import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Search, PlusCircle, Bookmark, MessageSquare, User, ShieldCheck, LogIn, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';

interface NavbarProps {
  onOpenFilter?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenFilter }) => {
  const { currentUser, savedIds, messages, searchFilter, setSearchFilter } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  const unreadCount = messages.filter((m) => !m.read && m.receiver_id === currentUser?.id).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Seal<span className="text-emerald-600">ify</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Verified Marketplace</span>
              </div>
            </Link>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl items-center relative">
              <div className="relative w-full flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter.query}
                  onChange={(e) => setSearchFilter((prev) => ({ ...prev, query: e.target.value }))}
                  placeholder="Search cars, phones, houses, electronics..."
                  className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 h-8 text-xs font-semibold"
                >
                  Search
                </Button>
              </div>
              {onOpenFilter && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenFilter}
                  className="ml-2 rounded-full border-slate-200 text-slate-600 hover:text-emerald-600"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                  Filters
                </Button>
              )}
            </form>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/saved">
                <Button variant="ghost" size="sm" className="relative text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <Bookmark className="w-4 h-4 mr-1.5" />
                  Saved
                  {savedIds.length > 0 && (
                    <span className="ml-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {savedIds.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/messages">
                <Button variant="ghost" size="sm" className="relative text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Chats
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              {currentUser ? (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-700 hover:text-emerald-600">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={currentUser.full_name}
                      className="w-6 h-6 rounded-full object-cover mr-1.5 border border-emerald-500"
                    />
                    <span className="font-medium text-xs max-w-[100px] truncate">{currentUser.full_name}</span>
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsAuthOpen(true)} className="text-slate-600 hover:text-emerald-600">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Login
                </Button>
              )}

              <Link to="/post-ad">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Sell Now
                </Button>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <Link to="/saved" className="p-2 text-slate-600 hover:text-emerald-600 relative">
                <Bookmark className="w-5 h-5" />
                {savedIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {savedIds.length}
                  </span>
                )}
              </Link>
              
              <Link to="/post-ad">
                <Button size="sm" className="bg-emerald-600 text-white rounded-full text-xs font-bold px-3 py-1">
                  + Sell
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};