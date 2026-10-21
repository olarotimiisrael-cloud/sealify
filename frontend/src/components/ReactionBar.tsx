'use client';

import { useReactions, useToggleReaction } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Heart,
  HandHeart,
  Smile,
  AlertCircle,
  Frown,
  Angry,
  Loader2,
} from 'lucide-react';

const REACTIONS: {
  type: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  color: string;
}[] = [
  { type: 'like', label: 'Like', Icon: Heart, color: 'text-rose-500' },
  { type: 'love', label: 'Love', Icon: HandHeart, color: 'text-pink-500' },
  { type: 'haha', label: 'Haha', Icon: Smile, color: 'text-amber-500' },
  { type: 'wow', label: 'Wow', Icon: AlertCircle, color: 'text-purple-500' },
  { type: 'sad', label: 'Sad', Icon: Frown, color: 'text-blue-500' },
  { type: 'angry', label: 'Angry', Icon: Angry, color: 'text-orange-500' },
];

interface ReactionBarProps {
  reactionableType: string;
  reactionableId: string;
  className?: string;
}

export default function ReactionBar({
  reactionableType,
  reactionableId,
  className,
}: ReactionBarProps) {
  const { data, isLoading } = useReactions(reactionableType, reactionableId);
  const toggleReaction = useToggleReaction();
  const [pressing, setPressing] = useState<string | null>(null);

  const counts = data?.counts || {};
  const userReaction = data?.user_reaction || null;
  const total = Object.values(counts).reduce((a: number, b: number) => a + b, 0);

  const handleSelect = async (type: string) => {
    setPressing(type);
    try {
      await toggleReaction.mutateAsync({
        reactionableType,
        reactionableId,
        reactionType: type,
      });
    } catch (e: any) {
      toast.error(e.message || 'Failed to react');
    } finally {
      setPressing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 min-w-[150px]">
        <span className="text-[10px] text-slate-400 font-bold">Loading</span>
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <span className="text-[10px] text-slate-500 font-bold">
        {total} reactions
      </span>
      {REACTIONS.map(({ type, label, Icon, color }) => {
        const count = (counts[type] || 0) as number;
        const isMine = userReaction === type;
        return (
          <button
            key={type}
            onClick={() => handleSelect(type)}
            title={label}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-200 ${
              isMine
                ? `${color} bg-${color.replace('text-', '').replace('-500', '')}-100 border-${color.replace('text-', '').replace('-500', '')}-200`
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${pressing === type ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-bold">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

