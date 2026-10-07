"use client";

import React from "react";
import { Utensils, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetText?: string;
}

export function EmptyState({
  title = "No dishes found",
  description = "We couldn't find any culinary selections matching your current search or filters.",
  onReset,
  resetText = "Clear Filters",
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-8 text-center max-w-md mx-auto shadow-sm my-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto shadow-inner">
        <Utensils className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="font-serif text-lg font-bold text-brand-950">{title}</h3>
        <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
          <span>{resetText}</span>
        </button>
      )}
    </div>
  );
}
