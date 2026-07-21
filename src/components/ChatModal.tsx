import React, { useState } from 'react';
import { Listing } from '@/types';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, MapPin } from 'lucide-react';

interface ChatModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ listing, isOpen, onClose }) => {
  const { sendMessage, messages, currentUser } = useApp();
  const [text, setText] = useState('');

  if (!listing) return null;

  const listingMessages = messages.filter((m) => m.listing_id === listing.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(listing.id, listing.seller_id, text);
    setText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 overflow-hidden flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center gap-3">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-12 h-12 rounded-xl object-cover border border-emerald-400"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{listing.title}</h4>
            <div className="flex items-center text-xs text-emerald-100 mt-0.5">
              <span className="font-semibold text-emerald-200">${listing.price}</span>
              <span className="mx-1.5">•</span>
              <span className="truncate">{listing.seller?.full_name || 'Seller'}</span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
          {listingMessages.length === 0 ? (
            <div className="text-center text-slate-400 my-auto py-10">
              <p className="text-xs">No messages yet. Send a query to the seller!</p>
            </div>
          ) : (
            listingMessages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isMe ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask seller if available..."
            className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-9 h-9 p-0 flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </DialogContent>
    </Dialog>
  );
};