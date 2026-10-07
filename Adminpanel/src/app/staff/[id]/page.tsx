"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Star,
  Award,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { staffService } from "@/services/staff";
import { reviewService } from "@/services/reviews";
import { resolveImageUrl, formatDate } from "@/lib/utils";

export default function StaffDetailPage() {
  const params = useParams();
  const staffId = Number(params?.id);

  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => staffService.getStaff(staffId),
    enabled: !isNaN(staffId) && staffId > 0,
  });

  const { data: ratingStats, isLoading: isLoadingRatings } = useQuery({
    queryKey: ["staff-ratings", staffId],
    queryFn: () => staffService.getStaffRatings(staffId),
    enabled: !isNaN(staffId) && staffId > 0,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["staff-reviews", staffId],
    queryFn: () => reviewService.getReviews({ staff_id: staffId, limit: 10 }),
    enabled: !isNaN(staffId) && staffId > 0,
  });

  const reviews = reviewsData?.data || [];
  const distribution = ratingStats?.distribution || {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
  };
  const total = ratingStats?.total_ratings || 0;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-brand-900 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Staff List
        </Link>

        {isLoadingStaff ? (
          <div className="h-64 bg-white rounded-3xl border border-stone-200 animate-pulse" />
        ) : !staff ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-stone-900">Staff Member Not Found</h3>
          </div>
        ) : (
          <>
            {/* Profile Header Banner */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-brand-900 text-gold-300 flex items-center justify-center font-serif text-3xl font-bold flex-shrink-0 shadow-lg">
                  {staff.profile_image ? (
                    <Image
                      src={resolveImageUrl(staff.profile_image)}
                      alt={staff.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>
                      {staff.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded border border-stone-200">
                      {staff.employee_code}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        staff.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {staff.is_active ? "Active On Duty" : "Off Duty"}
                    </span>
                  </div>

                  <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-950 mt-1.5">
                    {staff.name}
                  </h1>
                  <p className="text-sm font-medium text-stone-500 flex items-center gap-1.5 mt-0.5">
                    <Award className="w-4 h-4 text-gold-500" />
                    {staff.designation}
                  </p>
                </div>
              </div>

              {/* Total score box */}
              <div className="flex items-center gap-4 bg-gold-50/80 border border-gold-200/80 rounded-2xl p-4 self-start md:self-auto">
                <div>
                  <p className="text-xs text-stone-500 uppercase font-semibold">Service Score</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Star className="w-5 h-5 fill-gold-500 text-gold-500" />
                    <span className="font-serif text-2xl font-bold text-gold-950">
                      {staff.average_rating > 0 ? staff.average_rating.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>
                <div className="h-10 w-px bg-gold-200" />
                <div>
                  <p className="text-xs text-stone-500 uppercase font-semibold">Total Reviews</p>
                  <p className="font-serif text-2xl font-bold text-stone-800 mt-0.5">
                    {staff.total_ratings}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Breakdown & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rating Bars */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-brand-950">
                  Rating Distribution
                </h3>

                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = distribution[stars.toString()] || 0;
                    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 w-12 font-medium text-stone-600">
                          {stars} <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                        </span>

                        <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <span className="w-10 text-right text-stone-400 font-mono">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guest Reviews List */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-brand-950 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gold-500" />
                  Recent Diner Feedback for {staff.name}
                </h3>

                {reviews.length === 0 ? (
                  <p className="text-sm text-stone-400 italic py-6 text-center">
                    No guest reviews recorded yet for this staff member.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {reviews.map((r) => (
                      <div key={r.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= r.rating
                                      ? "fill-gold-500 text-gold-500"
                                      : "fill-stone-200 text-stone-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-stone-700">
                              {r.customer_name || "Anonymous Guest"}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400">
                            {formatDate(r.created_at)}
                          </span>
                        </div>

                        {r.review_text && (
                          <p className="text-xs text-stone-600 italic">
                            &quot;{r.review_text}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
