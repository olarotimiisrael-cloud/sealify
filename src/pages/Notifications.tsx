import React from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { Bell, TrendingDown, MessageSquare, Tag, Sparkles, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { notifications, markAllNotificationsRead, clearNotification, markNotificationRead, t } = useSealify();

  const getIcon = (type: string) => {
    switch (type) {
      case 'price_drop': return <TrendingDown className="w-5 h-5 text-emerald-400" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-teal-400" />;
      case 'offer': return <Tag className="w-5 h-5 text-amber-400" />;
      case 'recommendation': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'payment': return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{t('notifications')}</h1>
              <p className="text-xs text-slate-400">Stay updated with your activities on Sealify</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <Bell className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-400">No notifications yet. New alerts will appear here.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 relative group cursor-pointer ${
                  notif.read
                    ? 'bg-slate-950/60 border-slate-800/80'
                    : 'bg-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                }`}
              >
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex justify-between">
                    <h4 className={`text-sm font-bold truncate ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{notif.description}</p>
                  
                  {notif.linkUrl && (
                    <Link
                      to={notif.linkUrl}
                      className="inline-block pt-1 text-[11px] font-black text-emerald-400 hover:underline"
                    >
                      View Action →
                    </Link>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Notifications;