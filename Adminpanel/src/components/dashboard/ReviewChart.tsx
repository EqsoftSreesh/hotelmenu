import React from "react";
import { Star } from "lucide-react";

import { DashboardStats } from "@/types";

interface ReviewChartProps {
  averageRating?: number;
  totalReviews?: number;
  distribution?: Record<string, number>;
  stats?: DashboardStats;
}

export function ReviewChart({
  averageRating,
  totalReviews,
  distribution,
  stats,
}: ReviewChartProps) {
  const avg = averageRating ?? stats?.average_restaurant_rating ?? 5.0;
  const total = totalReviews ?? stats?.total_reviews ?? 0;
  const dist = distribution ?? { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  const stars = ["5", "4", "3", "2", "1"];

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-serif text-stone-900">Rating Breakdown</h3>
          <p className="text-xs text-stone-400 mt-0.5">Customer feedback distribution</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-50 border border-gold-200 rounded-xl">
          <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
          <span className="text-sm font-bold text-gold-700">{avg.toFixed(1)}</span>
          <span className="text-xs text-stone-400">/ 5.0</span>
        </div>
      </div>

      <div className="space-y-2.5 my-auto">
        {stars.map((star) => {
          const count = dist[star] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-7 font-semibold text-stone-700 flex items-center gap-1">
                {star}
                <Star className="w-3 h-3 text-gold-500 fill-gold-500 inline" />
              </span>

              <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="w-9 text-right font-mono text-stone-400">{percentage}%</span>
              <span className="w-8 text-right font-mono text-stone-600 font-semibold">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>Total Evaluated Feedback</span>
        <span className="font-bold text-stone-800">{totalReviews} Reviews</span>
      </div>
    </div>
  );
}
