"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types";

interface PaginationProps {
  meta?: PaginationMeta;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  meta,
  page: propPage,
  totalPages: propTotalPages,
  totalItems: propTotalItems,
  pageSize: propPageSize,
  onPageChange,
}: PaginationProps) {
  const page = meta?.page ?? propPage ?? 1;
  const total = meta?.total ?? propTotalItems ?? 0;
  const limit = meta?.limit ?? propPageSize ?? 10;
  const total_pages = meta?.total_pages ?? propTotalPages ?? Math.max(1, Math.ceil(total / (limit || 1)));

  if (total_pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-stone-100 rounded-b-2xl">
      <div className="text-xs text-stone-500">
        Showing <span className="font-semibold text-stone-800">{start}</span> to{" "}
        <span className="font-semibold text-stone-800">{end}</span> of{" "}
        <span className="font-semibold text-stone-800">{total}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 text-stone-600 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-stone-200 transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {[...Array(total_pages)].map((_, i) => {
          const p = i + 1;
          // Show first, last, current, and surrounding pages
          if (p === 1 || p === total_pages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 text-xs font-semibold rounded-lg transition-all ${
                  p === page
                    ? "bg-brand-850 text-white shadow-sm"
                    : "text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {p}
              </button>
            );
          } else if (p === page - 2 || p === page + 2) {
            return (
              <span key={p} className="px-1 text-xs text-stone-400">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="p-1.5 text-stone-600 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-stone-200 transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
