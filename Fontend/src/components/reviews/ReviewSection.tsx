"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquareQuote, ChevronRight, Sparkles, User } from "lucide-react";
import { Review } from "@/types";
import { resolveImageUrl, formatDate } from "@/lib/utils";

interface ReviewSectionProps {
  reviews: Review[];
  onOpenRateModal: () => void;
  qrToken?: string;
  averageRating?: number;
  totalReviews?: number;
}

export function ReviewSection({
  reviews,
  onOpenRateModal,
  qrToken,
  averageRating = 4.8,
  totalReviews = 0,
}: ReviewSectionProps) {
  return (
    <section className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs font-bold text-gold-600 uppercase tracking-widest">
              Guest Feedback
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950 mt-1">
            What Our Guests Say
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Verified dining experiences and culinary compliments
          </p>
        </div>

        {/* Rating Score Box & Rate Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gold-50 border border-gold-200/80 px-4 py-2 rounded-2xl">
            <Star className="w-5 h-5 fill-gold-500 text-gold-500" />
            <div>
              <span className="font-serif text-lg font-bold text-brand-950 leading-none block">
                {averageRating > 0 ? averageRating.toFixed(1) : "5.0"}
              </span>
              <span className="text-[10px] text-text-muted">
                {totalReviews > 0 ? `${totalReviews} reviews` : "Top Rated"}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenRateModal}
            className="px-5 py-2.5 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Rate Experience</span>
          </button>
        </div>
      </div>

      {/* Reviews Cards Slider / Grid */}
      {reviews.length === 0 ? (
        <div className="p-8 text-center bg-surface-bg/50 rounded-2xl border border-dashed border-stone-300 space-y-2">
          <p className="text-xs text-text-muted italic">
            Be the first guest to leave a complimentary review for our culinary team!
          </p>
          <button
            onClick={onOpenRateModal}
            className="text-xs font-semibold text-brand-900 hover:text-gold-600 transition-colors"
          >
            Write a Review →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.slice(0, 6).map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-surface-bg/60 border border-surface-border flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? "fill-gold-500 text-gold-500"
                            : "fill-stone-200 text-stone-200"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-mono text-text-muted">
                    {formatDate(rev.created_at)}
                  </span>
                </div>

                {rev.review_text && (
                  <p className="text-xs text-text-primary italic leading-relaxed line-clamp-3">
                    &quot;{rev.review_text}&quot;
                  </p>
                )}

                {/* Attached review images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {rev.images.slice(0, 3).map((img) => (
                      <div
                        key={img.id}
                        className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200"
                      >
                        <Image
                          src={resolveImageUrl(img.image_url)}
                          alt="Guest review photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Author & Subject */}
              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-brand-950 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-stone-400" />
                  {rev.customer_name || "Anonymous Guest"}
                </span>

                <span className="text-gold-700 font-medium truncate max-w-[140px]">
                  {rev.menu_item_name || rev.staff_name || "Restaurant Experience"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link to Full Reviews Page */}
      {qrToken && (
        <div className="pt-2 flex justify-center">
          <Link
            href={`/menu/${qrToken}/reviews`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:text-gold-600 transition-colors"
          >
            <span>View All Guest Reviews & Breakdown</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
