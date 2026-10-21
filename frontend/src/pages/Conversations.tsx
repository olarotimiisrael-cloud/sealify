import React, { useState, useEffect, useRef } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { echo } from '@/lib/echo';
import { MessageSquare, User, Clock, MapPin, ArrowRight, CheckCircle2, AlertCircle, Send, Paperclip, Mic, Search, Video, Slash, Phone, X, PhoneIcon, Bell } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_REPLIES = [
  'Is this still available?',
  'Can we negotiate the price?',
  'Where can we meet to inspect?',
  'Do you accept delivery?',
  'Is it in good condition?',
];

export default function Conversations() {
  const { conversations, user, sendMessage, isAuthenticated } = useSealify();
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; body: string; senderId: string; senderName: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(!isAuthenticated);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoCallQuality, setVideoCallQuality] = useState<'uhd' | 'hd' | 'sd'>('uhd');
  const [videoCallStatus, setVideoCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Real-time Echo subscription for the active conversation
  const echoChannelRef = useRef<any>(null);

  useEffect(() => {
    if (!activeConvId || echoChannelRef.current) return;

    const channelName = `conversation.${activeConvId}`;
    echoChannelRef.current = echo.private(channelName)
      .listen('MessageSent', (event: any) => {
        setConversations(prev => prev.map(c => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: event.id,
                  senderId: event.sender_id,
                  receiverId: activeConv.otherUser.id,
                  listingId: activeConv.listingId,
                  content: event.body,
                  createdAt: event.created_at,
                  isRead: false,
                  attachments: event.attachments || [],
                  replyToId: null,
                },
              ],
              lastMessage: event.body,
              lastMessageTime: event.created_at,
              unreadCount: (c.unreadCount || 0) + 1,
            };
          }
          return c;
        }));
      });

    return () => {
      if (echoChannelRef.current) {
        echo.leave(channelName);
        echoChannelRef.current = null;
      }
    };
  }, [activeConvId]);

  // Build unread counts from conversation data
  const unreadCounts: Record<string, number> = {};
  conversations.forEach((c) => {
    unreadCounts[c.id] = c.unreadCount || 0;
  });

  // Calculate total unread count
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const cancelReply = () => setReplyTo(null);
  const cancelVideoCall = () => { setIsVideoCallActive(false); setVideoCallStatus('idle'); };
  const endCall = () => { setIsVideoCallActive(false); setVideoCallStatus('ended'); toast.success('Call ended'); };

  // Mark conversation as read when opened
  useEffect(() => {
    if (activeConvId && activeConv?.unreadCount && activeConv.unreadCount > 0) {
      // Note: unread count reset happens on server via read receipts
    }
  }, [activeConvId, activeConv]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) return;
    try {
      await sendMessage(activeConv.listingId, activeConv.otherUser.id, text.trim(), replyTo?.id || undefined);
      setText('');
      setReplyTo(null);
      toast.success('Message sent');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    }
  };

  const handleReply = (msg: any) => {
    setReplyTo({
      id: msg.id,
      body: msg.body,
      senderId: msg.senderId,
      senderName: msg.sender?.name || 'User',
    });
  };

  const startVideoCall = () => {
    setIsVideoCallActive(true);
    setVideoCallStatus('ringing');
    setTimeout(() => setVideoCallStatus('connected'), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Messages — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[650px]">
          {/* Conversations List */}
          <div className="w-full md:w-80 border-r border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="font-black text-slate-900 text-sm">Inbox</span>
              </div>
              <span className={`text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full`}>
                {conversations.length} chats
              </span>
              {totalUnread > 0 && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full ml-2">
                  {totalUnread} new
                </span>
              )}
            </div>

            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-4 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500">No conversations yet.</p>
                  <p className="text-[10px] text-slate-400">Start messaging sellers from listing pages.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {conversations.map((c) => {
                    const unreadCount = unreadCounts[c.id] || 0;
                    const isRead = unreadCount === 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveConvId(c.id)}
                        className={`w-full p-4 text-left flex gap-3 transition-colors ${
                          activeConv?.id === c.id
                            ? 'bg-emerald-50 border-l-4 border-emerald-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={c.otherUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt={c.otherUser.name}
                          className="w-11 h-11 rounded-2xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-900 truncate">{c.otherUser.name}</h4>
                              {unreadCount > 0 && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isRead ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 shrink-0">{c.lastMessageTime}</span>
                          </div>
                          <p className="text-[9px] text-slate-500 font-medium truncate">{c.listingTitle}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`text-[9px] ${isRead ? 'text-emerald-600' : 'text-rose-500'} font-bold`}>
                              {isRead ? 'Read' : 'New'}
                            </span>
                            <span className="text-[9px] text-slate-400">{c.lastMessage}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {activeConv ? (
              <>
                {/* Video Call Overlay */}
                {isVideoCallActive && (
                  <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between w-full max-w-md mb-6 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={activeConv.otherUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={activeConv.otherUser.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900">{activeConv.otherUser.name}</h3>
                          <p className="text-[10px] text-slate-500">{activeConv.listingTitle}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={cancelVideoCall}
                          className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                          title="Decline"
                        >
                          <Slash className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setVideoCallStatus('connected')}
                          className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                          title="Accept"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Call Status */}
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                        videoCallStatus === 'ringing'
                          ? 'bg-amber-100 text-amber-600 animate-pulse'
                          : videoCallStatus === 'connected'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-rose-100 text-rose-600'
                      }`}>
                        {videoCallStatus === 'ringing' ? (
                          <Video className="w-8 h-8 animate-spin" />
                        ) : videoCallStatus === 'connected' ? (
                          <PhoneIcon className="w-8 h-8" />
                        ) : (
                          <X className="w-8 h-8" />
                        )}
                      </div>
                      <p className="text-lg font-black text-slate-900">
                        {videoCallStatus === 'ringing' ? 'Incoming Video Call' : videoCallStatus === 'connected' ? 'Call Connected' : 'Call Ended'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {videoCallStatus === 'ringing' ? 'Sealify is connecting you...' : videoCallStatus === 'connected' ? 'UHD Live Video Chat Active' : ''}
                      </p>
                    </div>

                    {/* Call Controls */}
                    <div className="flex gap-4 mt-8">
                      {videoCallStatus === 'connected' && (
                        <>
                          {/* Video Quality Selector */}
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full border border-slate-200">
                            <span className="text-[9px] font-bold text-slate-600">UHD</span>
                            {['uhd', 'hd', 'sd'].map((q) => (
                              <button
                                key={q}
                                onClick={() => setVideoCallQuality(q)}
                                className={`w-8 h-8 rounded-full transition-all ${
                                  videoCallQuality === q
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                                title={`${q.toUpperCase()} Quality`}
                              >
                                <span className="text-[10px] font-bold">
                                  {q === 'uhd' ? '4K' : q === 'hd' ? '1080p' : '720p'}
                                </span>
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setIsAudioOnly(!isAudioOnly)}
                            className={`p-3 rounded-full transition-colors ${
                              isAudioOnly ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title={isAudioOnly ? 'Unmute Audio' : 'Mute Audio'}
                          >
                            <Mic className={`w-5 h-5 ${isAudioOnly ? 'text-white' : ''}`} />
                          </button>
                          <button
                            onClick={() => setIsAudioOnly(false)}
                            className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                            title="Enable Video"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                          <button
                            onClick={endCall}
                            className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                            title="End Call"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Call Controls Bar (when connected) */}
                {isVideoCallActive && videoCallStatus === 'connected' && (
                  <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-600">LIVE VIDEO CHAT</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded">UHD 4K</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAudioOnly(!isAudioOnly)}
                        className={`p-2 rounded-lg transition-colors ${
                          isAudioOnly ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Mic className={`w-4 h-4 ${isAudioOnly ? 'text-white' : ''}`} />
                      </button>
                      <button
                        onClick={endCall}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat Header */}
                <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConv.otherUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={activeConv.otherUser.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{activeConv.otherUser.name}</h3>
                      <p className="text-[10px] text-emerald-600 font-semibold">{activeConv.listingTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {videoCallStatus !== 'connected' && (
                      <>
                        <button
                          onClick={startVideoCall}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-medium border border-emerald-100 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span className="text-xs">Video Call</span>
                        </button>
                        <button
                          onClick={startVideoCall}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-medium border border-blue-100 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs">Voice Call</span>
                        </button>
                      </>
                    )}
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => setText(q)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-bold border border-slate-200 hover:border-emerald-200 flex items-center gap-1 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages History */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3">
                  {activeConv.messages.length === 0 ? (
                    <div className="text-center text-slate-400 my-auto py-10">
                      <p className="text-xs">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    activeConv.messages.map((m) => {
                      const isMe = m.senderId === user?.id;
                      const isReply = m.replyToId;
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                            {/* Reply Context */}
                            {isReply && m.replyTo && (
                              <div className="mb-1.5">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Replying to</span>
                                  <span className="text-[8px] font-bold text-emerald-600">{m.replyTo.senderName}</span>
                                </div>
                                <div className="bg-slate-50/50 rounded-lg p-1.5 border border-slate-100">
                                  <p className="text-[9px] text-slate-600 italic">{m.replyTo.body}</p>
                                </div>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                            <span className="text-[9px] opacity-60 mt-1 block">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {/* Reply button */}
                            <button
                              onClick={() => handleReply(m)}
                              className="text-[8px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5 hover:text-emerald-700"
                            >
                              <span className="w-1 h-1 rounded-full bg-emerald-600" />
                              Reply
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Context Bar */}
                {replyTo && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-3 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-emerald-700">↪</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Replying to {replyTo.senderName}</p>
                      <p className="text-[10px] text-slate-700 line-clamp-1">{replyTo.body}</p>
                    </div>
                    <button
                      onClick={cancelReply}
                      className="text-emerald-500 hover:text-emerald-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={replyTo ? `Replying to ${replyTo.senderName}...` : 'Type a message...'}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      disabled={!text.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-slate-500 text-xs">
                Select a conversation from the sidebar to start chatting
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}
