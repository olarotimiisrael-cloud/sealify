'use client';

import React, { useState } from 'react';
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from '@/lib/api-client';
import { useSealify } from '@/context/SealifyContext';
import {
  MessageCircle,
  Send,
  Trash2,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import FollowButton from './FollowButton';

interface CommentSectionProps {
  commentableType: string;
  commentableId: string;
  className?: string;
}

export default function CommentSection({
  commentableType,
  commentableId,
  className,
}: CommentSectionProps) {
  const { data, isLoading } = useComments(commentableType, commentableId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const { user } = useSealify();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const comments = (data?.data || []) as any[];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    setSubmitting(true);
    try {
      await addComment.mutateAsync({
        commentableType,
        commentableId,
        content: content.trim(),
        ...(replyingTo ? { parentId: replyingTo } : {}),
      });
      setContent('');
      setReplyingTo(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment.mutateAsync(id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment');
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="h-32 animate-pulse rounded bg-slate-100" />
    );
  }

  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Comments ({comments.length})</span>
        </h3>
      </div>

      <form onSubmit={handleAdd} className="space-y-3">
        {replyingTo && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
            <span>Replying to comment</span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-amber-600 font-bold hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="absolute right-2 top-2 bg-emerald-600 text-white rounded-lg p-1.5 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No comments yet. Be the first!
          </div>
        ) : (
          comments.map((comment) => {
            const replies = (comment.replies || []) as any[];
            const isOwner = comment.user?.id === user?.id;
            return (
              <div key={comment.id} className="space-y-2">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    {comment.user?.avatar_url ? (
                      <img
                        src={comment.user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {comment.user?.name || 'Sealify user'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setContent('');
                          setReplyingTo(comment.id);
                        }}
                        className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <ChevronRight className="w-2.5 h-2.5" /> Reply
                      </button>
                    </div>
                  </div>
                </div>
                {replies.length > 0 && (
                  <div className="ml-10 border-l-2 border-slate-100 pl-3 space-y-1 pt-2">
                    {replies.map((reply: any) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-slate-900 truncate">
                            {reply.user?.name || 'Sealify user'}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {formatTime(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

