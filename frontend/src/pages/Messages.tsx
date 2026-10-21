import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { MessageSquare, AlertCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { conversations: ctxConversations, refreshConversations, user } = useSealify();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadConversations(user.id);
    }
  }, [user, refreshConversations]);

  const loadConversations = async (userId: string) => {
    setLoading(true);
    try {
      await refreshConversations(userId);
      setConversations(ctxConversations);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center py-20">
        <MessageSquare className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-2">Log In to View Messages</h2>
        <p className="text-slate-500 text-xs mb-6">Communicate directly with buyers and sellers.</p>
        <button
          onClick={() => navigate('/auth/login?mode=login')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Messages — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Stay connected with buyers and sellers
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3"></div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">No conversations yet</h3>
            <p className="text-slate-500 text-xs">
              Start a conversation from any listing page to chat with sellers.
            </p>
            <Link to="/" className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col h-[70vh]">
            {/* Conversations List */}
            <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-100 font-black text-base text-slate-900 flex items-center justify-between">
                <span>Conversations</span>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-extrabold">
                  {conversations.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                    className="w-full p-4 text-left flex gap-3 transition-colors hover:bg-slate-50 border-l-4 border-transparent hover:border-emerald-500"
                  >
                    <div className="w-11 h-11 rounded-2xl object-cover shrink-0 bg-slate-100">
                      {conv.other_user?.avatar ? (
                        <img src={conv.other_user.avatar} alt={conv.other_user.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{conv.other_user?.name || 'User'}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{conv.last_message_time || '—'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.last_message || 'Say hello!'}</p>
                    </div>
                  </button>
                ))}
                {conversations.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-slate-500">No conversations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">Chat</h3>
                    <p className="text-xs text-emerald-600 font-semibold">Sealify Marketplace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors">
                    <MessageSquare className="w-3 h-3" />
                    <span className="hidden sm:inline">Reply</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="text-center text-slate-400 my-auto py-10">
                  <p className="text-xs">Select a conversation to start chatting</p>
                </div>
              </div>

              <div className="p-3 border-t border-slate-200 bg-white">
                <form className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}
