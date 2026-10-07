import React from "react";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-stone-100 mb-3" />
          <div className="w-16 h-4 bg-stone-100 rounded mb-2" />
          <div className="w-12 h-7 bg-stone-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
        <div className="w-48 h-5 bg-stone-100 rounded" />
        <div className="w-24 h-8 bg-stone-100 rounded-lg" />
      </div>
      <div className="divide-y divide-stone-100">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 bg-stone-200 rounded" />
              <div className="w-1/4 h-3 bg-stone-100 rounded" />
            </div>
            <div className="w-20 h-4 bg-stone-100 rounded hidden md:block" />
            <div className="w-16 h-6 bg-stone-100 rounded-full" />
            <div className="w-24 h-8 bg-stone-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="h-44 bg-stone-100" />
          <div className="p-5 space-y-3">
            <div className="w-2/3 h-5 bg-stone-200 rounded" />
            <div className="w-full h-3.5 bg-stone-100 rounded" />
            <div className="w-4/5 h-3.5 bg-stone-100 rounded" />
            <div className="pt-2 flex justify-between items-center">
              <div className="w-16 h-6 bg-stone-100 rounded-full" />
              <div className="w-20 h-8 bg-stone-100 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton({ className = "h-48 w-full bg-stone-100 rounded-2xl animate-pulse" }: { className?: string }) {
  return <div className={className} />;
}

