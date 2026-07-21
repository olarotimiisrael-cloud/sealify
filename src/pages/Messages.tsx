import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import MobileNav from '../components/MobileNav';
import { MessageSquare, Send, Sparkles } from 'lucide-react';

const QUICK_REPLIES = [
  'Is the price negotiable?',
  'Can I inspect it today?',
  'What is your best price?',
  'Is delivery available?',
];

const Messages: React.FC = () => {
  const { conversations, sendMessage, isAuthenticated, user } = useSealify();
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [text, setText] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(!isAuthenticated);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, text);
    setText('');
  };

  const handleQuickReply = (reply: string) => {
    if (!activeConv) return;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, reply);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <MessageSquare className="w-12 h-12 text-emerald-400 mb-3" />
          <h2 className="text-xl font-bold text-white">Login to View Messages</h2>
          <p className="text-slate-400 text-xs mb-4">Communicate directly with buyers and sellers in real-time.</p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            Log In
          </button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col md:flex-row min-h-[550px]">
          {/* Threads List Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
            <div className="p-4 border-b border-slate-800 font-bold text-base text-white flex items-center justify-between">
              <span>Inbox Threads</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                {conversations.length} chats
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-4 text-left flex gap-3 transition-colors ${
                    activeConv?.id === c.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <img src={c.otherUser.avatar} className="w-11 h-11 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs text-white truncate">{c.otherUser.name}</h4>
                      <span className="text-[10px] text-slate-500 shrink-0">{c.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium truncate">{c.listingTitle}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Window */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-slate-950">
              {/* Chat Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeConv.otherUser.avatar} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">{activeConv.otherUser.name}</h3>
                    <p className="text-xs text-slate-400">{activeConv.listingTitle} (${activeConv.listingPrice})</p>
                  </div>
                </div>
              </div>

              {/* Messages History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeConv.messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <span className={`block text-[9px] text-right ${isMe ? 'text-slate-900/70' : 'text-slate-500'}`}>
                          {m.createdAt}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Suggestion Reply Chips */}
              <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 self-center" />
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickReply(q)}
                    className="text-[10px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-full shrink-0 border border-slate-700/60"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-slate-500 text-xs">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Messages;