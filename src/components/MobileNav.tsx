import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Heart, PlusCircle, MessageSquare, Shield, User } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import AuthModal from './AuthModal';

export const MobileNav: React.FC = () => {
  const { savedListingIds, conversations, user, isAdmin } = useSealify();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    } else if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/my-ads');
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-3 py-1.5 shadow-2xl">
        <div className="flex justify-around items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold relative transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span>Saved</span>
            {savedListingIds.length > 0 && (
              <span className="absolute top-0 right-2 bg-emerald-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {savedListingIds.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/post-ad"
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-slate-900 font-black">
              <PlusCircle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 mt-0.5">Sell</span>
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold relative transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Inbox</span>
            {totalUnreadMessages > 0 && (
              <span className="absolute top-0 right-2 bg-teal-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalUnreadMessages}
              </span>
            )}
          </NavLink>

          {/* Prominent Profile Avatar Button */}
          <button
            onClick={handleAccountClick}
            className="flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors text-slate-400 hover:text-slate-200"
          >
            {user?.avatarUrl ? (
              <div className="relative mb-0.5">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                />
              </div>
            ) : isAdmin ? (
              <Shield className="w-5 h-5 mb-0.5 text-rose-400" />
            ) : (
              <User className="w-5 h-5 mb-0.5" />
            )}
            <span>{isAdmin ? 'Admin' : user ? 'My Ads' : 'Account'}</span>
          </button>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default MobileNav;