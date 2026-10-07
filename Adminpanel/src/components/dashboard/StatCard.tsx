import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode | React.ComponentType<{ className?: string }>;
  variant?: "default" | "warning" | "success" | "gold";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: StatCardProps) {
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : typeof icon === "function" || typeof icon === "object"
    ? React.createElement(icon as any, { className: "w-5 h-5" })
    : icon;

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border transition-all duration-200 bg-white shadow-card flex items-start justify-between gap-3 group hover:shadow-soft hover:translate-y-[-2px]",
        variant === "default" && "border-stone-200 hover:border-brand-500/40",
        variant === "warning" && "border-amber-200 bg-amber-50/20 hover:border-amber-400",
        variant === "success" && "border-emerald-200 bg-emerald-50/20 hover:border-emerald-400",
        variant === "gold" && "border-gold-300 bg-gold-50/30 hover:border-gold-400"
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-stone-400">{subtitle}</p>}
      </div>

      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
          variant === "default" && "bg-brand-50 text-brand-850 border border-brand-100",
          variant === "warning" && "bg-amber-100 text-amber-800 border border-amber-200",
          variant === "success" && "bg-emerald-100 text-emerald-800 border border-emerald-200",
          variant === "gold" && "bg-gold-100 text-gold-700 border border-gold-200"
        )}
      >
        {renderedIcon}
      </div>
    </div>
  );
}
