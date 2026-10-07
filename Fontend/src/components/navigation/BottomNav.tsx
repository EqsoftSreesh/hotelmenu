"use client";

import React from "react";
import Link from "next/link";
import { Home, Utensils, MessageSquare, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "menu" | "reviews" | "more";
  onTabChange: (tab: "home" | "menu" | "reviews" | "more") => void;
  qrToken?: string;
}

export function BottomNav({ activeTab, onTabChange, qrToken }: BottomNavProps) {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onTabChange("menu");
    const el = document.getElementById("menu-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleReviewsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onTabChange("reviews");
    const el = document.getElementById("reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onTabChange("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-border shadow-bottomNav pb-safe">
      <div className="grid grid-cols-4 h-16 px-2">
        {/* Home */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === "home" ? "text-brand-900 font-bold" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === "home" ? "stroke-[2.2]" : ""}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Menu */}
        <button
          onClick={handleMenuClick}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === "menu" ? "text-brand-900 font-bold" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <Utensils className={`w-5 h-5 ${activeTab === "menu" ? "stroke-[2.2]" : ""}`} />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>

        {/* Reviews */}
        <button
          onClick={handleReviewsClick}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === "reviews" ? "text-brand-900 font-bold" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === "reviews" ? "stroke-[2.2]" : ""}`} />
          <span className="text-[10px] tracking-tight">Reviews</span>
        </button>

        {/* More */}
        <button
          onClick={() => onTabChange("more")}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === "more" ? "text-brand-900 font-bold" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${activeTab === "more" ? "stroke-[2.2]" : ""}`} />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </div>
    </div>
  );
}
