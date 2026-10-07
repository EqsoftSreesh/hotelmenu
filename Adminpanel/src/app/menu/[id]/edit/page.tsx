"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MenuForm } from "@/components/menu/MenuForm";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { menuService } from "@/services/menu";

export default function EditMenuItemPage() {
  const params = useParams();
  const id = Number(params?.id);

  const {
    data: item,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["menu-item", id],
    queryFn: () => menuService.getMenuItem(id),
    enabled: !isNaN(id) && id > 0,
  });

  return (
    <AdminLayout>
      <div className="py-2">
        {isLoading ? (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="h-10 w-48 bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-96 bg-white rounded-2xl border border-stone-200 animate-pulse" />
          </div>
        ) : isError || !item ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">Item Not Found</h2>
            <p className="text-sm text-stone-500 mb-6">
              The dish you are trying to edit could not be found or has been removed.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 text-white font-semibold text-sm hover:bg-brand-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Menu Catalog
            </Link>
          </div>
        ) : (
          <MenuForm initialData={item} isEdit={true} />
        )}
      </div>
    </AdminLayout>
  );
}
