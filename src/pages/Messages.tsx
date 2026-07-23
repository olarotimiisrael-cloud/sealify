import React, { useState, useRef } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import MobileNav from '../components/MobileNav';
import SafeMeetupModal from '../components/SafeMeetupModal';
import OfferModal from '../components/OfferModal';
import InspectionChecklistModal from '../components/InspectionChecklistModal';
import TransactionReceiptModal from '../components/TransactionReceiptModal';
import SEO from '../components/SEO';
import { MessageSquare, Send, Sparkles, MapPin, Tag, ShieldCheck, Image as ImageIcon, Mic, Paperclip, CheckSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_REPLIES = [
  'Is the price negotiable?',
  'Can I inspect it today?',
  'What is your best price?',
  'Is delivery available?',
];

const Messages: React.FC = () => {
  const { conversations, sendMessage, isAuthenticated, user, listings, sealDeal } = useSealify();
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || '');
  const [text, setText] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(!isAuthenticated);

  // Modals inside chat
  const [isMeetupOpen, setIsMeetupOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeListing = listings.find((l) => l.id === activeConv?.listingId);

  const isSeller = activeListing?.sellerId === user?.id;

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeConv) {
      sendMessage(activeConv.listingId, activeConv.otherUser.id, `📷 Attached inspection photo for product verification.`);
      toast.success('Inspection photo sent to seller!');
    }
  };

  const handleVoiceNote = () => {
    if (!activeConv) return;
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      toast.info('Recording voice note... Click microphone again to send.');
    } else {
      setIsRecordingVoice(false);
      sendMessage(activeConv.listingId, activeConv.otherUser.id, `🎙️ Voice Note (0:14 secs) — Click to play audio message.`);
      toast.success('Voice note audio message sent!');
    }
  };

  const handleSelectMeetupSpot = (spotName: string, spotAddress: string) => {
    if (!activeConv) return;
    const meetupProposal = `📍 PROPOSED SAFE MEETUP LOCATION:\n${spotName}\n${spotAddress}`;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, meetupProposal);
  };

  const handleSendOffer = (offerPrice: number, offerMsg: string) => {
    if (!activeConv) return;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, offerMsg);
  };

  const handleSendInspectionReport = (reportMsg: string) => {
    if (!activeConv) return;
    sendMessage(activeConv.listingId, activeConv.otherUser.id, reportMsg);
  };

  const handleSealTheDeal = (receiptMsg: string) => {
    if (!activeConv || !activeListing) return;
    
    // Official Platform Action
    sealDeal(activeListing.id, activeConv.otherUser.name, activeListing.price);
    
    // Send Receipt Text to Chat
    sendMessage(activeConv.listingId, activeConv.otherUser.id, receiptMsg);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
        <SEO 
          title="Direct Inbox & Messages — Sealify Nigeria" 
          description="Communicate securely with buyers and sellers in real-time on Sealify." 
        />
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Direct Inbox & Messages — Sealify Nigeria" 
        description="Communicate securely with buyers and sellers in real-time on Sealify." 
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col md:flex-row min-h-[580px]">
          {/* Threads List Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
            <div className="p-4 border-b border-slate-800 font-bold text-base text-white flex items-center justify-between">
              <span>Inbox Threads</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-extrabold">
                {conversations.length} chats
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-4 text-left flex gap-3 transition-colors ${
                    activeConv?.id === c.id ? 'bg-slate-800/80 border-l-4 border-emerald-500' : 'hover:bg-slate-800/40'
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
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <img src={activeConv.otherUser.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">{activeConv.otherUser.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{activeConv.listingTitle} (₦{activeConv.listingPrice.toLocaleString()})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isSeller && activeListing?.status === 'active' && (
                    <button
                      onClick={() => setIsReceiptOpen(true)}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Seal the Deal</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsInspectionOpen(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-purple-400 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Checklist</span>
                  </button>

                  <button
                    onClick={() => setIsMeetupOpen(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-teal-400 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Meetup</span>
                  </button>

                  <button
                    onClick={() => setIsOfferOpen(true)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Offer</span>
                  </button>
                </div>
              </div>

              {/* Messages History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeConv.messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  const isLocationMsg = m.content.includes('PROPOSED SAFE MEETUP LOCATION');
                  const isOfferMsg = m.content.includes('OFFER PROPOSAL');
                  const isInspectionMsg = m.content.includes('IN-PERSON INSPECTION REPORT');
                  const isReceiptMsg = m.content.includes('OFFICIAL SEALIFY TRANSACTION RECEIPT');
                  const isAudioMsg = m.content.includes('Voice Note');

                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none shadow-md'
                            : isLocationMsg
                            ? 'bg-teal-950/80 border border-teal-500/40 text-teal-200 rounded-bl-none'
                            : isOfferMsg
                            ? 'bg-amber-950/80 border border-amber-500/40 text-amber-200 rounded-bl-none'
                            : isInspectionMsg
                            ? 'bg-purple-950/80 border border-purple-500/40 text-purple-200 rounded-bl-none'
                            : isReceiptMsg
                            ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 rounded-bl-none'
                            : isAudioMsg
                            ? 'bg-purple-950/80 border border-purple-500/40 text-purple-200 rounded-bl-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        <span className={`block text-[9px] text-right ${isMe ? 'text-slate-900/70 font-bold' : 'text-slate-500'}`}>
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
                    className="text-[10px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-full shrink-0 border border-slate-700/60 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 items-center">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl border border-slate-800 transition-colors"
                  title="Attach Photo"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isRecordingVoice
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-purple-400 border-slate-800'
                  }`}
                  title={isRecordingVoice ? 'Stop & Send Voice Note' : 'Record Voice Note'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-slate-500 text-xs">
              Select a conversation from the sidebar to start chatting
            </div>
          )}
        </div>
      </main>

      <SafeMeetupModal
        isOpen={isMeetupOpen}
        onClose={() => setIsMeetupOpen(false)}
        itemTitle={activeConv?.listingTitle}
        onSelectSpot={handleSelectMeetupSpot}
      />

      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        listingTitle={activeConv?.listingTitle || ''}
        originalPrice={activeConv?.listingPrice || 0}
        onSendOffer={handleSendOffer}
      />

      <InspectionChecklistModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        category={activeListing?.category || 'Electronics'}
        itemTitle={activeConv?.listingTitle || 'Item'}
        onSendChecklistToChat={handleSendInspectionReport}
      />

      {activeListing && (
        <TransactionReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          listing={activeListing}
          onSendToChat={handleSealTheDeal}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default Messages;