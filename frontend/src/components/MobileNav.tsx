import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Heart, PlusCircle, MessageSquare, Shield, User } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import AuthModal from './AuthModal';

export const MobileNav: React.FC = () => {
  const { savedListingIds, conversations, user, isAdmin, t } = useSealify();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-3 py-1.5 shadow-xl shadow-slate-200/50">
        <div className="flex justify-around items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                isActive ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-700'
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>{t('home')}</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold relative transition-colors ${
                isActive ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-700'
              }`
            }
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span>{t('saved')}</span>
            {savedListingIds.length > 0 && (
              <span className="absolute top-0 right-2 bg-emerald-600 text-slate-900 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedListingIds.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/post-ad"
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-12 h-12 bg-emerald-600 text-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 border-2 border-slate-200 font-black">
              <PlusCircle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-600 mt-0.5">{t('sell')}</span>
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold relative transition-colors ${
                isActive ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-700'
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>{t('inbox')}</span>
            {totalUnreadMessages > 0 && (
              <span className="absolute top-0 right-2 bg-teal-600 text-slate-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalUnreadMessages}
              </span>
            )}
          </NavLink>

          <button
            onClick={handleAccountClick}
            className="flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors text-slate-600 hover:text-slate-700"
          >
            {user?.avatarUrl ? (
              <div className="relative mb-0.5">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-600"
                />
              </div>
            ) : isAdmin ? (
              <Shield className="w-5 h-5 mb-0.5 text-rose-600" />
            ) : (
              <User className="w-5 h-5 mb-0.5" />
            )}
            <span>{isAdmin ? 'Admin' : user ? t('my_ads') : t('account')}</span>
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

