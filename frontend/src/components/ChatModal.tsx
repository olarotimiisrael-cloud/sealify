import React, { useState } from 'react';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ listing, isOpen, onClose }) => {
  const { sendMessage, conversations, user } = useSealify();
  const [text, setText] = useState('');

  if (!listing) return null;

  const activeConv = conversations.find((c) => c.listingId === listing.id);
  const listingMessages = activeConv?.messages || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(listing.id, listing.sellerId, text);
    setText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 rounded-2xl p-0 overflow-hidden flex flex-col h-[520px] shadow-xl">
        {/* Header */}
        <div className="p-4 bg-emerald-600 text-slate-900 flex items-center gap-3 border-b border-slate-200">
          <img
            src={listing.images?.[0] || '/placeholder.svg'}
            alt={listing.title}
            className="w-12 h-12 rounded-xl object-cover border border-white/20"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{listing.title}</h4>
            <div className="flex items-center text-xs text-emerald-100 mt-0.5">
              <span className="font-semibold text-slate-900">₦{listing.price.toLocaleString()}</span>
              <span className="mx-1.5">•</span>
              <span className="truncate text-slate-900">{listing.sellerName}</span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50">
          {listingMessages.length === 0 ? (
            <div className="text-center text-slate-600 my-auto py-10">
              <p className="text-xs">No messages yet. Send an inquiry to the seller!</p>
            </div>
          ) : (
            listingMessages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-emerald-600 text-slate-900' : 'bg-white text-slate-900 border border-slate-200'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask seller if available..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-slate-900 px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              disabled={!text.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};


