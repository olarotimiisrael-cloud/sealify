import React from 'react';
import { Star, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { Review as BaseReview } from '../types/sealify';

type Review = BaseReview & { status?: string };

interface ReviewSummaryProps {
  reviews: Review[];
  sellerName: string;
  sellerVerified: boolean;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  reviews,
  sellerName,
  sellerVerified,
}) => {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  const verifiedCount = reviews.filter((r) => r.status === 'approved').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
      {/* Overall Rating */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-black text-white">{averageRating}</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                }`}
                fill={star <= Math.round(Number(averageRating)) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-8 text-right">{star}★</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-500 w-10">{Math.round(percentage)}%</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-emerald-400">{verifiedCount}</p>
            <p className="text-[10px] text-slate-400 uppercase">Verified</p>
          </div>
          <div className="text-center p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-blue-400">{totalReviews}</p>
            <p className="text-[10px] text-slate-400 uppercase">Total Reviews</p>
          </div>
          <div className="text-center p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-amber-400">{averageRating}</p>
            <p className="text-[10px] text-slate-400 uppercase">Avg Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;