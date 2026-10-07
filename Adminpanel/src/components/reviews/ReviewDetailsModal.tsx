"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  User,
  MapPin,
  Calendar,
  Utensils,
  Award,
  Loader2,
} from "lucide-react";
import { Review } from "@/types";
import { reviewService } from "@/services/reviews";
import { useToast } from "@/components/common/Toast";
import { resolveImageUrl, formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: Review | null;
}

export function ReviewDetailsModal({ isOpen, onClose, review }: ReviewDetailsModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  if (!isOpen || !review) return null;

  const handleToggleApproval = async () => {
    setIsUpdating(true);
    try {
      const updated = await reviewService.approveReview(review.id, !review.is_approved);
      addToast({
        type: "success",
        title: updated.is_approved ? "Review Approved" : "Approval Revoked",
        message: `Review #${review.id} status updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    } catch (err) {
      addToast({
        type: "error",
        title: "Action Failed",
        message: "Could not update approval status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleVisibility = async () => {
    setIsUpdating(true);
    try {
      const updated = await reviewService.setVisibility(review.id, !review.is_visible);
      addToast({
        type: "success",
        title: updated.is_visible ? "Review Visible" : "Review Hidden",
        message: `Review #${review.id} visibility updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      onClose();
    } catch (err) {
      addToast({
        type: "error",
        title: "Action Failed",
        message: "Could not update visibility status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await reviewService.deleteReview(review.id);
      addToast({
        type: "success",
        title: "Review Removed",
        message: `Review #${review.id} has been permanently deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      addToast({
        type: "error",
        title: "Deletion Failed",
        message: "Could not delete this review.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onClose} />

        {/* Dialog */}
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 uppercase tracking-wider">
                  {review.review_type.replace("_", " ")}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    review.is_approved
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {review.is_approved ? "Approved" : "Pending Review"}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-950 mt-1">
                Review Details #{review.id}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Rating Stars & Score */}
            <div className="flex items-center justify-between p-4 bg-gold-50/50 rounded-2xl border border-gold-200/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= review.rating
                          ? "fill-gold-500 text-gold-500"
                          : "fill-stone-200 text-stone-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-serif text-xl font-bold text-gold-900 ml-1">
                  {review.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(review.created_at)}
              </span>
            </div>

            {/* Target & Customer Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
                <p className="text-xs text-stone-500 uppercase font-semibold mb-1">Feedback Subject</p>
                <div className="flex items-center gap-2 text-sm font-bold text-brand-950">
                  {review.review_type === "MENU_ITEM" && <Utensils className="w-4 h-4 text-gold-600" />}
                  {review.review_type === "STAFF" && <Award className="w-4 h-4 text-brand-700" />}
                  <span>
                    {review.menu_item_name ||
                      review.staff_name ||
                      (review.location_name ? `${review.location_name}` : "Overall Restaurant Experience")}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
                <p className="text-xs text-stone-500 uppercase font-semibold mb-1">Guest Identity</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-950">
                  <User className="w-4 h-4 text-stone-500" />
                  <span>{review.customer_name || "Anonymous Guest"}</span>
                </div>
                {review.location_name && (
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {review.location_name}
                  </p>
                )}
              </div>
            </div>

            {/* Comment Body */}
            <div>
              <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">
                Guest Experience & Comments
              </p>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-stone-800 text-sm leading-relaxed whitespace-pre-wrap italic font-serif">
                {review.review_text ? `"${review.review_text}"` : "No written comment was submitted."}
              </div>
            </div>

            {/* Attached Photos */}
            {review.images && review.images.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">
                  Guest Photographs ({review.images.length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {review.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-24 rounded-xl overflow-hidden border border-stone-200 group cursor-pointer"
                      onClick={() => window.open(resolveImageUrl(img.image_url), "_blank")}
                    >
                      <Image
                        src={resolveImageUrl(img.image_url)}
                        alt="Guest photo"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating || isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Review
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleVisibility}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors disabled:opacity-50"
              >
                {review.is_visible ? (
                  <>
                    <EyeOff className="w-4 h-4 text-stone-500" />
                    Hide Publicly
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-stone-700" />
                    Make Visible
                  </>
                )}
              </button>

              <button
                onClick={handleToggleApproval}
                disabled={isUpdating}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition-all disabled:opacity-50 ${
                  review.is_approved
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : review.is_approved ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Revoke Approval
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review? This action cannot be undone."
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
