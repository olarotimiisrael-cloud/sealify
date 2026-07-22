import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { MessageSquare, Send } from 'lucide-react';

export default function MessagesPage() {
  const { conversations, user, sendMessage } = useSealify();
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, replyText);
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row h-[600px]">
          {/* Conversation List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-900/50">
            <div className="p-4 border-b border-slate-800 font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Conversations ({conversations.length})
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No active chats</div>
              ) : (
                conversations.map((c) => {
                  const isSelected = activeConv?.id === c.id;

                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full p-3 text-left flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-slate-800 border-l-4 border-emerald-500' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <img
                        src={c.otherUser.avatar}
                        alt={c.otherUser.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-white truncate">{c.otherUser.name}</h5>
                        <p className="text-[11px] text-emerald-400 truncate">{c.listingTitle}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.lastMessage}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-slate-950">
            {activeConv ? (
              <>
                <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900">
                  <img
                    src={activeConv.otherUser.avatar}
                    alt={activeConv.otherUser.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white">{activeConv.otherUser.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">{activeConv.listingTitle}</p>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {activeConv.messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                            isMe ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 flex gap-2 bg-slate-900">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-full text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full text-xs transition-colors flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a conversation from the left to view messages.
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}