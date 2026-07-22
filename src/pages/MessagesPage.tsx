import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  const { messages, currentUser, sendMessage } = useApp();
  const [activeListingId, setActiveListingId] = useState<string | null>(messages[0]?.listing_id || null);
  const [replyText, setReplyText] = useState('');

  // Group messages by listing
  const conversationsMap = messages.reduce((acc, msg) => {
    if (!acc[msg.listing_id]) {
      acc[msg.listing_id] = [];
    }
    acc[msg.listing_id].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  const conversationKeys = Object.keys(conversationsMap);
  const activeThread = activeListingId ? conversationsMap[activeListingId] || [] : [];
  const activeSample = activeThread[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeListingId || !activeSample) return;
    sendMessage(activeListingId, activeSample.sender_id, replyText);
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">
          
          {/* Conversation List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Conversations
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversationKeys.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No active chats</div>
              ) : (
                conversationKeys.map((lid) => {
                  const thread = conversationsMap[lid];
                  const lastMsg = thread[thread.length - 1];
                  const isSelected = activeListingId === lid;

                  return (
                    <button
                      key={lid}
                      onClick={() => setActiveListingId(lid)}
                      className={`w-full p-3 text-left flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-100/50'
                      }`}
                    >
                      <img
                        src={lastMsg.listing_image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100'}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-slate-800 truncate">{lastMsg.listing_title}</h5>
                        <p className="text-[11px] text-slate-500 truncate">{lastMsg.content}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {activeSample ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                  <img
                    src={activeSample.listing_image}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{activeSample.listing_title}</h4>
                    <p className="text-[10px] text-emerald-600 font-semibold">Active Conversation</p>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                  {activeThread.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                            isMe ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button type="submit" size="sm" className="bg-emerald-600 text-white rounded-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
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