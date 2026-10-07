"use client";

import React from "react";

export function HeroSkeleton() {
  return (
    <div className="w-full aspect-[16/9] md:aspect-[21/9] max-h-[440px] rounded-3xl bg-stone-200/70 animate-pulse overflow-hidden relative shadow-sm" />
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-stone-200/80 animate-pulse" />
          <div className="w-12 h-3 bg-stone-200/60 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/70 p-4 shadow-sm space-y-3 animate-pulse">
      <div className="w-full aspect-[4/3] rounded-2xl bg-stone-200/70" />
      <div className="space-y-1.5 pt-1">
        <div className="w-3/4 h-4 bg-stone-200/80 rounded" />
        <div className="w-1/2 h-3 bg-stone-200/50 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="w-16 h-5 bg-stone-200/80 rounded" />
        <div className="w-20 h-5 bg-stone-200/60 rounded-full" />
      </div>
    </div>
  );
}

export function FullMenuSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      <div className="w-full h-12 bg-stone-200/60 rounded-2xl animate-pulse" />
      <HeroSkeleton />
      <CategorySkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
