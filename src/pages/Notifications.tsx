import React from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { 
  Bell, TrendingDown, MessageSquare, Tag, Sparkles, Trash2, 
  CheckCircle2, ShoppingBag, Clock, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
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

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'recommendation': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'payment': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'offer': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 rounded-3xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{t('notifications')}</h1>
              <p className="text-xs text-slate-400 font-medium">Keep track of your activity, offers, and AI recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-black rounded-xl border border-slate-800 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-20 text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                <Bell className="w-10 h-10 text-slate-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">All caught up!</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  You don't have any new notifications. Check back later for price drops and recommendations.
                </p>
              </div>
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                <ShoppingBag className="w-4 h-4" />
                Browse Market
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-5 rounded-[2rem] border transition-all flex items-start gap-5 relative group cursor-pointer ${
                    notif.read
                      ? 'bg-slate-950/40 border-slate-800/80 grayscale-[0.3]'
                      : 'bg-slate-900 border-emerald-500/20 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/10'
                  }`}
                >
                  <div className={`p-3.5 rounded-2xl border shrink-0 transition-transform group-hover:scale-110 ${getBadgeColor(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <h4 className={`text-sm sm:text-base font-black truncate ${notif.read ? 'text-slate-400' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{notif.time}</span>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-300'}`}>
                      {notif.description}
                    </p>
                    
                    {notif.linkUrl && (
                      <Link
                        to={notif.linkUrl}
                        className="inline-flex items-center gap-1.5 pt-1 text-[11px] font-black text-emerald-400 hover:text-emerald-300 group/link"
                      >
                        <span>Take Action</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition-all"
                    title="Remove notification"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Protection Badge at Footer of page */}
        <div className="pt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>End-to-End Encrypted Notifications</span>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Notifications;