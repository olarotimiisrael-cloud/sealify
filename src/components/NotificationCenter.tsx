import React from 'react';
import { X, Bell, TrendingDown, MessageSquare, Tag, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSealify, AppNotification } from '../context/SealifyContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, clearNotification, markNotificationRead } = useSealify();

  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-teal-400" />;
      case 'offer':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'alert_match':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 h-full overflow-y-auto p-6 space-y-6 shadow-2xl border-l border-slate-800 text-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Notifications</h2>
              <p className="text-xs text-slate-400">{unreadCount} unread updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                Mark Read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No notifications right now.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-2xl border transition-colors flex items-start gap-3 relative group cursor-pointer ${
                  notif.read
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    : 'bg-slate-800/80 border-emerald-500/30 text-slate-100 shadow-md'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-xs text-white leading-snug">{notif.title}</h4>
                    <span className="text-[10px] text-slate-500 shrink-0">{notif.time}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{notif.description}</p>

                  {notif.linkUrl && (
                    <Link
                      to={notif.linkUrl}
                      onClick={onClose}
                      className="inline-block pt-1 text-[11px] font-extrabold text-emerald-400 hover:underline"
                    >
                      View Details →
                    </Link>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-opacity absolute top-3 right-3"
                  title="Remove notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;