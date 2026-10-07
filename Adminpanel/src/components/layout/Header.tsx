"use client";

import React from "react";
import { Menu, Bell, ExternalLink, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { CUSTOMER_MENU_URL } from "@/lib/constants";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobile?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, onOpenMobile, actions }: HeaderProps) {
  const { admin } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-stone-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="flex items-center gap-4">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 text-stone-600 hover:text-brand-900 hover:bg-stone-100 rounded-xl transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          {title && (
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h1>
          )}
          {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        <a
          href={CUSTOMER_MENU_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-brand-700" />
          <span>Customer Menu</span>
        </a>

        <div className="h-6 w-px bg-stone-200 hidden md:block" />

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-semibold text-stone-800 block leading-tight">{admin?.name || "Admin"}</span>
            <span className="text-[10px] text-stone-400 capitalize">{admin?.role || "Staff"}</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-brand-850 text-gold-400 font-bold text-xs flex items-center justify-center border border-gold-500/20 shadow-sm uppercase">
            {admin?.name?.charAt(0) || "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
