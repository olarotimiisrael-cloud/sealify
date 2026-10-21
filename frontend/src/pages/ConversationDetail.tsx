import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSealify } from '@/context/SealifyContext';
import { api, queryKeys } from '@/lib/api-client';
import { echo } from '@/lib/echo';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { MessageCircle, User, ChevronLeft, Send, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import VoiceNoteRecorder from '../components/VoiceNoteRecorder';
import VoiceNotePlayer from '../components/VoiceNotePlayer';

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSealify();
  const [textContent, setTextContent] = useState('');

  const { data: conversation, isLoading: convLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const res = await api.get<any>(`/conversations/${id}`);
      return res;
    },
    enabled: !!id,
  });

  const { data: messagesData, isLoading: msgLoading, refetch: refetchMessages } = useQuery({
    queryKey: queryKeys.messages(id || ''),
    queryFn: async () => {
      const res = await api.get<{ messages: any[] }>(`/conversations/${id}/messages`);
      return res?.messages || [];
    },
    enabled: !!id,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post<any>(`/conversations/${id}/messages`, {
        content: content.trim(),
      });
      return res;
    },
    onSuccess: () => {
      setTextContent('');
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(id || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });

  const otherUser =
    conversation?.other_user ||
    (conversation?.participants?.[0] && conversation.participants[0].id !== user?.id
      ? conversation.participants[0]
      : conversation?.participants?.[1]) ||
    null;

  const messages = (messagesData || []) as any[];

  // Real-time Echo subscription for this conversation
  const echoChannelRef = useRef<any>(null);
  useEffect(() => {
    if (!id || echoChannelRef.current) return;

    const channelName = `conversation.${id}`;
    echoChannelRef.current = echo.private(channelName)
      .listen('MessageSent', (event: any) => {
        if (event.sender_id !== user?.id) {
          queryClient.setQueryData(queryKeys.messages(id), (prev: any[]) => {
            const exists = prev?.some((m: any) => m.id === event.id);
            if (exists) return prev;
            return [
              ...(prev || []),
              {
                id: event.id,
                sender_id: event.sender_id,
                body: event.body,
                type: event.type,
                created_at: event.created_at,
                attachments: event.attachments || [],
              },
            ];
          });
        }
      });

    return () => {
      if (echoChannelRef.current) {
        echo.leave(channelName);
        echoChannelRef.current = null;
      }
    };
  }, [id, user?.id, queryClient]);


  if (convLoading || msgLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading conversation...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center py-20">
        <MessageCircle className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-2">Sign In to Chat</h2>
        <p className="text-slate-500 text-xs mb-6">Voice notes and messaging require an account.</p>
        <button
          onClick={() => navigate('/auth/login')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;
    try {
      await sendMessage.mutateAsync(textContent.trim());
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwn = (senderId: string) => String(senderId) === String(user.id);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title={`Conversation — Sealify Nigeria`} />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/messages" className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-emerald-600">
            <ChevronLeft className="w-3 h-3" />
            <span>Back to Messages</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0">
              {otherUser?.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 leading-tight">{otherUser?.name || 'User'}</h1>
              <p className="text-[10px] text-emerald-600 font-semibold">Active · Sealify Marketplace</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col h-[70vh]">
          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <div className="text-center my-auto py-10">
                <Volume2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((message) => {
              const attachments = message.attachments || [];
              const voiceAttachment = attachments.find(
                (a: any) => a.mime_type?.startsWith('audio') || message.type === 'voice',
              );
              const isMe = isOwn(message.sender_id);
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-[fade-in_0.2s_ease-out]`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl inline-block ${
                      isMe
                        ? 'bg-emerald-600 text-slate-900 rounded-tr-none shadow-sm'
                        : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200 shadow-sm'
                    }`}
                  >
                    {message.body ? (
                      <>
                        <p className="text-sm leading-relaxed">{message.body}</p>
                        <span className="text-[9px] block mt-1 opacity-60">
                          {isMe ? 'Read' : 'Delivered'} · {formatTime(message.created_at)}
                        </span>
                      </>
                    ) : null}
                    {voiceAttachment ? (
                      <div className="mt-2">
                        <VoiceNotePlayer
                          url={voiceAttachment.url}
                          durationSeconds={voiceAttachment.duration_seconds}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <div className="h-4" />
          </div>

          {/* Composer */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <VoiceNoteRecorder conversationId={id || ''} className="w-full sm:w-80" />
              <form onSubmit={handleSendText} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!textContent.trim()}
                  className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}

