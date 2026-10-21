import React, { useEffect, useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Bell, Clock, AlertCircle, CheckCircle2, ArrowRight, Mail, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchNotifications, markNotificationRead, markAllNotificationsRead } = useSealify();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      setNotifications(res?.data || res || []);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err: any) {
      // Silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Notifications — Sealify Nigeria" />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
              <Bell className="w-3 h-3" />
              <span>Notifications</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
              Notifications
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Stay updated with your marketplace activity, messages, and promotions.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Mark all as read ({unreadCount})</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-500 text-xs">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`bg-white border border-slate-200 rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 hover:border-emerald-200 ${!n.read ? 'border-l-4 border-emerald-600 bg-emerald-50/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    {n.type === 'message' ? (
                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                        <Mail className="w-3 h-3" />
                      </div>
                    ) : n.type === 'promotion' ? (
                      <div className="w-5 h-5 bg-amber-100 text-amber-600 rounded flex items-center justify-center">
                        <Star className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-slate-900 text-sm ${!n.read ? '' : 'text-slate-600'}`}>
                      {n.title}
                    </h4>
                    <p className={`text-[10px] ${!n.read ? 'text-slate-700' : 'text-slate-500'} mt-0.5 line-clamp-2`}>
                      {n.description || n.body || 'You have a new notification.'}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0">
                    {new Date(n.created_at || n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}

