"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  QrCode,
  Printer,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Download,
  Sparkles,
  Smartphone,
  Eye,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { locationService } from "@/services/locations";
import { useToast } from "@/components/common/Toast";
import { resolveImageUrl } from "@/lib/utils";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const {
    data: locations = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationService.getLocations(),
  });

  const mainLocation = locations[0] || null;

  // Regenerate QR mutation
  const regenerateQRMutation = useMutation({
    mutationFn: (id: number) => locationService.regenerateQR(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      addToast({
        type: "success",
        title: "QR Code Regenerated",
        message: `New QR token generated for "${updated.name}".`,
      });
    },
    onError: () => {
      addToast({
        type: "error",
        title: "Action Failed",
        message: "Failed to regenerate QR code.",
      });
    },
  });

  const customerMenuUrl = mainLocation
    ? `http://localhost:3000/?token=${mainLocation.qr_token}`
    : "http://localhost:3000";

  const handleCopyMenuLink = () => {
    navigator.clipboard.writeText(customerMenuUrl);
    setCopied(true);
    addToast({
      type: "success",
      title: "Menu Link Copied",
      message: "Direct customer menu URL copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold-100 text-gold-900 border border-gold-300">
                <Sparkles className="w-3 h-3 fill-gold-600 text-gold-600" />
                Single Unified Menu Access
              </span>
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-950 mt-1">
              Digital Menu QR Code
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Contactless digital QR code for all hotel and dining guests to browse dishes, check live availability, and submit reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-brand-950 hover:bg-stone-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh QR Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            </button>

            <a
              href={customerMenuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <ExternalLink className="w-4 h-4 text-gold-400" />
              <span>Open Customer Menu</span>
            </a>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="h-96 bg-white rounded-3xl border border-stone-200 animate-pulse" />
        ) : !mainLocation ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
            <QrCode className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-stone-800">No QR Code Available</h3>
            <p className="text-sm text-stone-500 mt-1">Please run seed data to generate the restaurant menu QR code.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: The Executive Display Stand Card */}
            <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden flex flex-col items-center text-center p-8 relative bg-gradient-to-b from-stone-50/60 via-white to-stone-50/40">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />

              <div className="w-14 h-14 rounded-2xl bg-brand-900 border-2 border-gold-400/40 text-gold-400 font-serif font-bold text-xl flex items-center justify-center shadow-lg shadow-brand-950/20 mb-3 mt-2">
                H
              </div>

              <h2 className="font-serif text-2xl font-bold text-brand-950 tracking-tight">
                Grand Hotel & Dining
              </h2>
              <p className="text-[11px] uppercase tracking-widest text-gold-600 font-bold mt-0.5">
                Official Digital Menu
              </p>

              {/* QR Image Box */}
              <div className="my-6 p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-md relative">
                {mainLocation.qr_image_url ? (
                  <div className="relative w-56 h-56">
                    <Image
                      src={resolveImageUrl(mainLocation.qr_image_url)}
                      alt={`QR code for ${mainLocation.name}`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 flex flex-col items-center justify-center text-stone-400">
                    <QrCode className="w-16 h-16" />
                    <span className="text-xs mt-2">Generating QR code...</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 max-w-xs">
                <p className="text-xs font-bold text-stone-800 tracking-wide uppercase">
                  Scan to View Menu & Live Availability
                </p>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Open smartphone camera to browse dishes, daily chef specials, and leave compliments.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 w-full flex items-center justify-center gap-2 text-xs text-stone-500">
                <Smartphone className="w-3.5 h-3.5 text-gold-600" />
                <span>Compatible with iOS & Android Camera</span>
              </div>
            </div>

            {/* Right: Management & Quick Actions */}
            <div className="lg:col-span-6 space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
                <h3 className="font-serif text-lg font-bold text-brand-950">
                  QR Code Actions
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href={`/locations/${mainLocation.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white transition-all shadow-md group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gold-400">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold block">Print QR Stand</span>
                      <span className="text-[10px] text-stone-300">Table tent / card</span>
                    </div>
                  </Link>

                  {mainLocation.qr_image_url && (
                    <a
                      href={resolveImageUrl(mainLocation.qr_image_url)}
                      download="hotel-digital-menu-qr.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-800 transition-all shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center text-gold-700">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold block">Download PNG</span>
                        <span className="text-[10px] text-stone-500">High-res file</span>
                      </div>
                    </a>
                  )}

                  <a
                    href={customerMenuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-800 transition-all shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold block">Live Preview</span>
                      <span className="text-[10px] text-stone-500">Customer view</span>
                    </div>
                  </a>

                  <button
                    onClick={() => regenerateQRMutation.mutate(mainLocation.id)}
                    disabled={regenerateQRMutation.isPending}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-800 transition-all shadow-sm disabled:opacity-50"
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                      <RefreshCw className={`w-4 h-4 ${regenerateQRMutation.isPending ? "animate-spin" : ""}`} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold block">Regenerate</span>
                      <span className="text-[10px] text-stone-500">Cycle QR token</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Direct Customer Menu URL Card */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-brand-950">
                    Direct Customer Menu Link
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active & Synchronized
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-stone-700 truncate">
                    {customerMenuUrl}
                  </span>

                  <button
                    onClick={handleCopyMenuLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-semibold text-xs shadow-sm transition-all shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  You can share this link directly via SMS, WhatsApp, or post it on your website/social media alongside the physical QR stands.
                </p>
              </div>

              {/* System Note */}
              <div className="bg-brand-50/70 border border-brand-100 rounded-3xl p-5 flex items-start gap-3 text-xs text-brand-950">
                <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-900 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-gold-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-brand-950">Unified Menu Mode Active</h4>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    All guests now access the exact same digital menu and live kitchen stock updates through this single official QR code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
