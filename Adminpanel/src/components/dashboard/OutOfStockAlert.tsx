"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronRight, UtensilsCrossed } from "lucide-react";
import { MenuItem } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "@/services/menu";
import { useToast } from "@/components/common/Toast";
import { resolveImageUrl } from "@/lib/utils";

interface OutOfStockAlertProps {
  items: MenuItem[];
}

export function OutOfStockAlert({ items }: OutOfStockAlertProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const toggleMutation = useMutation({
    mutationFn: (id: number) => menuService.updateAvailability(id, true),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      success(`"${data.name}" is now marked as AVAILABLE.`);
    },
    onError: () => {
      error("Failed to update availability.");
    },
  });

  if (items.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">All Menu Items In Stock</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              100% of your digital menu catalog is active and available for customer dining.
            </p>
          </div>
        </div>
        <Link
          href="/menu"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
        >
          <span>Manage Menu</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/40 border border-amber-300 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <span>Out of Stock Alert</span>
              <span className="bg-amber-200 text-amber-900 text-xs px-2 py-0.5 rounded-full font-mono">
                {items.length}
              </span>
            </h3>
            <p className="text-xs text-amber-800/80">
              These items currently show "OUT OF STOCK" on customer mobile screens.
            </p>
          </div>
        </div>

        <Link
          href="/menu?is_available=false"
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="bg-white border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center border border-stone-200">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed className="w-4 h-4 text-stone-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                <p className="text-[11px] text-stone-500 truncate">{item.category_name || "Dish"}</p>
              </div>
            </div>

            <button
              onClick={() => toggleMutation.mutate(item.id)}
              disabled={toggleMutation.isPending}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shrink-0 transition-colors disabled:opacity-50"
            >
              Make Available
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
