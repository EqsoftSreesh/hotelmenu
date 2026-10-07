"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Banner } from "@/types";
import { resolveImageUrl } from "@/lib/utils";

interface HeroBannerProps {
  banners: Banner[];
  onExploreClick?: () => void;
}

const FALLBACK_BANNER: Banner = {
  id: 0,
  title: "Good Food. Good Mood. Great Memories.",
  subtitle: "Exquisite Culinary Delights",
  description: "Fresh ingredients, artisanal flavors, and unforgettable hospitality.",
  image_url: "/placeholder-hero.jpg",
  button_text: "Explore Menu",
  button_link: "#menu-section",
  display_order: 0,
  is_active: true,
};

export function HeroBanner({ banners, onExploreClick }: HeroBannerProps) {
  const activeBanners = banners && banners.length > 0 ? banners : [FALLBACK_BANNER];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = activeBanners.length;

  useEffect(() => {
    if (total <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    setTouchStartX(null);
  };

  const current = activeBanners[currentIndex] || FALLBACK_BANNER;

  const handleExplore = (e: React.MouseEvent) => {
    if (onExploreClick) {
      e.preventDefault();
      onExploreClick();
    } else {
      const el = document.getElementById("menu-section");
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-card group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Photography Banner Container */}
      <div className="relative aspect-[16/10] sm:aspect-[2/1] lg:aspect-[21/9] w-full max-h-[460px] bg-stone-900 overflow-hidden">
        <Image
          src={resolveImageUrl(current.image_url)}
          alt={current.title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Ambient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Banner Copy & Call to Action */}
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white max-w-2xl">
          {current.subtitle && (
            <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-1 drop-shadow-sm">
              {current.subtitle}
            </span>
          )}

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-2 drop-shadow-md">
            {current.title}
          </h2>

          {current.description && (
            <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-lg mb-4 font-light leading-relaxed">
              {current.description}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleExplore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-brand-950 font-semibold text-xs sm:text-sm shadow-goldGlow transition-all duration-200"
            >
              <span>{current.button_text || "Explore Menu"}</span>
              <ArrowRight className="w-4 h-4 text-brand-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls (Shown when multiple banners exist) */}
      {total > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-6 bg-gold-400"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
