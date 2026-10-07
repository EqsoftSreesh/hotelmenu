"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "@/services/menu";
import { useToast } from "@/components/common/Toast";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AvailabilityToggleProps {
  itemId: number;
  itemName: string;
  isAvailable: boolean;
  size?: "sm" | "md";
}

export function AvailabilityToggle({
  itemId,
  itemName,
  isAvailable,
  size = "md",
}: AvailabilityToggleProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const mutation = useMutation({
    mutationFn: (newVal: boolean) => menuService.updateAvailability(itemId, newVal),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      const statusText = data.is_available ? "AVAILABLE" : "OUT OF STOCK";
      success(`"${itemName}" is now marked as ${statusText}.`);
    },
    onError: () => {
      error("Failed to update availability status.");
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    mutation.mutate(!isAvailable);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={mutation.isPending}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none",
        isAvailable
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 focus:ring-emerald-500 border border-emerald-300"
          : "bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500 border border-red-300",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        mutation.isPending && "opacity-75 cursor-wait"
      )}
      title={`Click to mark ${isAvailable ? "OUT OF STOCK" : "AVAILABLE"}`}
    >
      {mutation.isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isAvailable ? "bg-emerald-600 animate-pulse" : "bg-red-600"
          )}
        />
      )}
      <span>{isAvailable ? "Available" : "Out of Stock"}</span>
    </button>
  );
}
