'use client';

import { useState } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useToggleFollow, useFollowStatus } from '@/lib/api-client';
import { toast } from 'sonner';
import { useSealify } from '@/context/SealifyContext';

interface FollowButtonProps {
  userId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function FollowButton({ userId, className, size = 'md' }: FollowButtonProps) {
  const { user } = useSealify();
  const { data } = useFollowStatus(userId);
  const toggleFollow = useToggleFollow();
  const [mutating, setMutating] = useState(false);

  const isFollowing = data?.is_following || false;
  const isOwnProfile = user?.id === userId;

  const handleToggle = async () => {
    if (isOwnProfile || mutating) return;
    setMutating(true);
    try {
      await toggleFollow.mutateAsync({ userId, action: isFollowing ? 'unfollow' : 'follow' });
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update follow');
    } finally {
      setMutating(false);
    }
  };

  if (isOwnProfile) return null;

  const base =
    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200';
  const cls = isFollowing
    ? `${base} bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200`
    : `${base} bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700`;

  return (
    <button
      onClick={handleToggle}
      disabled={mutating || isOwnProfile}
      className={className || cls}
    >
      {mutating ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-3 h-3" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3 h-3" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}

