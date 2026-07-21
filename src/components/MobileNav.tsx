import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const MobileNav: React.FC = () => {
  const { messages, currentUser } = useApp();
  const unreadCount = messages.filter((m) => !m.read && m.receiver_id === currentUser?.id).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-3 py-1.5 shadow-lg">
      <div className="flex justify-around items-center">
        
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium relative transition-colors ${
              isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Chats</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/post-ad"
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 border-2 border-white">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5">Post Ad</span>
        </NavLink>

        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Saved</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Account</span>
        </NavLink>

      </div>
    </nav>
  );
};