"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  Utensils,
  Wine,
  Coffee,
  Pizza,
  Cake,
  Flame,
  Salad,
  Fish,
  Sparkles,
} from "lucide-react";
import { Category } from "@/types";
import { resolveImageUrl } from "@/lib/utils";

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  utensils: <Utensils className="w-6 h-6" />,
  wine: <Wine className="w-6 h-6" />,
  coffee: <Coffee className="w-6 h-6" />,
  pizza: <Pizza className="w-6 h-6" />,
  cake: <Cake className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  salad: <Salad className="w-6 h-6" />,
  fish: <Fish className="w-6 h-6" />,
};

export function CategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (cat: Category) => {
    if (cat.icon && ICON_MAP[cat.icon.toLowerCase()]) {
      return ICON_MAP[cat.icon.toLowerCase()];
    }
    // Fallback based on category name
    const lower = cat.name.toLowerCase();
    if (lower.includes("wine") || lower.includes("drink") || lower.includes("beverage"))
      return <Wine className="w-6 h-6" />;
    if (lower.includes("dessert") || lower.includes("sweet") || lower.includes("cake"))
      return <Cake className="w-6 h-6" />;
    if (lower.includes("offer") || lower.includes("special"))
      return <Flame className="w-6 h-6" />;
    return <Utensils className="w-6 h-6" />;
  };

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth"
      >
        {/* 'All Menu' Item */}
        <button
          onClick={() => onSelectCategory(null)}
          className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
        >
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              selectedCategoryId === null
                ? "bg-brand-900 text-gold-400 ring-4 ring-gold-400/30 scale-105 shadow-md"
                : "bg-white text-stone-600 border border-surface-border group-hover:border-brand-800/40"
            }`}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <span
            className={`text-xs font-semibold tracking-tight transition-colors ${
              selectedCategoryId === null
                ? "text-brand-950 font-bold"
                : "text-text-secondary group-hover:text-brand-950"
            }`}
          >
            All Menu
          </span>
        </button>

        {/* Dynamic Categories from backend */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
            >
              <div
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isSelected
                    ? "bg-brand-900 text-gold-400 ring-4 ring-gold-400/30 scale-105 shadow-md"
                    : "bg-white text-stone-600 border border-surface-border group-hover:border-brand-800/40"
                }`}
              >
                {cat.image ? (
                  <Image
                    src={resolveImageUrl(cat.image)}
                    alt={cat.name}
                    fill
                    className={`object-cover ${
                      isSelected ? "opacity-90 contrast-125" : "opacity-80"
                    }`}
                  />
                ) : (
                  getCategoryIcon(cat)
                )}
              </div>
              <span
                className={`text-xs font-semibold tracking-tight whitespace-nowrap transition-colors ${
                  isSelected
                    ? "text-brand-950 font-bold"
                    : "text-text-secondary group-hover:text-brand-950"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
