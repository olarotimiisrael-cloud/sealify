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
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 rounded-2xl p-0 overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center gap-3 border-b border-slate-800">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{listing.title}</h4>
            <div className="flex items-center text-xs text-slate-400 mt-0.5">
              <span className="font-semibold text-emerald-400">₦{listing.price.toLocaleString()}</span>
              <span className="mx-1.5">•</span>
              <span className="truncate">{listing.sellerName}</span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-950/60">
          {listingMessages.length === 0 ? (
            <div className="text-center text-slate-500 my-auto py-10">
              <p className="text-xs">No messages yet. Send an inquiry to the seller!</p>
            </div>
          ) : (
            listingMessages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      isMe
                        ? 'bg-emerald-500 text-slate-950 font-semibold rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isMe ? 'text-slate-900/70' : 'text-slate-400'
                      }`}
                    >
                      {msg.createdAt}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask seller if available..."
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-full text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full w-9 h-9 p-0 flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};