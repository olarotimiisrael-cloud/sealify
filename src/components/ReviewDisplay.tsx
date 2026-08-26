import React from 'react';
import { Review as BaseReview } from '../types/sealify';

type Review = BaseReview & { status?: string };
import { Star, ShieldCheck, Calendar, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewDisplayProps {
  reviews: Review[];
  showHeader?: boolean;
  maxReviews?: number;
  onWriteReview?: () => void;
  currentUserId?: string;
}

export const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  reviews,
  showHeader = true,
  maxReviews,
  onWriteReview,
  currentUserId,
}) => {
  const displayedReviews = maxReviews ? reviews.slice(0, maxReviews) : reviews;
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const totalReviews = reviews.length;

  if (totalReviews === 0 && !onWriteReview) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No reviews yet</p>
        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl"
          >
            Be the first to review
          </button>
        )}
      </div>
    );
  }

  const getStarIcon = (filled: boolean) => (
    <Star
      className={`w-5 h-5 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
      fill={filled ? 'currentColor' : 'none'}
    />
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {showHeader && (
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-white">{averageRating}</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  getStarIcon(star <= Math.round(Number(averageRating)))
                ))}
              </div>
            </div>
            <div className="text-slate-400 text-sm">
              Based on <span className="font-bold text-white">{totalReviews}</span> review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {onWriteReview && (
            <button
              onClick={onWriteReview}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Write a Review
            </button>
          )}
        </div>
      )}

      <div className="divide-y divide-slate-800">
        {displayedReviews.map((review, index) => (
          <div key={review.id} className="p-5 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                {review.buyerAvatar ? (
                  <img
                    src={review.buyerAvatar}
                    alt={review.buyerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{review.buyerName}</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                    {review.status === 'pending' && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                        fill={star <= review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}

        {reviews.length > (maxReviews || Infinity) && (
          <div className="p-5 text-center border-t border-slate-800">
            <p className="text-sm text-slate-400 mb-2">
              Showing {maxReviews} of {reviews.length} reviews
            </p>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700">
              View All Reviews
            </button>
          </div>
        )}

        {totalReviews === 0 && onWriteReview && (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-3">No reviews yet</p>
            <button
              onClick={onWriteReview}
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Be the first to review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDisplay;