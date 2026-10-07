"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  QrCode,
  Printer,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LocationFormModal } from "@/components/qr/LocationFormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { locationService } from "@/services/locations";
import { useToast } from "@/components/common/Toast";
import { Location } from "@/types";
import { resolveImageUrl } from "@/lib/utils";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const {
    data: locations = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationService.getLocations(),
  });

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

  const handleDelete = async () => {
    if (!locationToDelete) return;
    setIsDeleting(true);
    try {
      await locationService.deleteLocation(locationToDelete.id);
      addToast({
        type: "success",
        title: "Location Deleted",
        message: `"${locationToDelete.name}" and its QR access have been deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setLocationToDelete(null);
    } catch (err) {
      addToast({
        type: "error",
        title: "Deletion Failed",
        message: "Could not delete this location.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyMenuLink = (loc: Location) => {
    // Customer menu URL with token
    const customerUrl = `http://localhost:3000/?token=${loc.qr_token}`;
    navigator.clipboard.writeText(customerUrl);
    setCopiedId(loc.id);
    addToast({
      type: "success",
      title: "Menu Link Copied",
      message: `Direct customer link for ${loc.name} copied to clipboard.`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreate = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setSelectedLocation(loc);
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-950">
              Dining Locations & QR Codes
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Generate branded QR codes for dining tables, luxury suites, and restaurant areas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-brand-950 hover:bg-stone-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh Locations"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>Create Dining Location</span>
            </button>
          </div>
        </div>

        {/* Locations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-3xl border border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
            <EmptyState
              title="No Dining Locations Configured"
              description="Add dining tables or hotel suites to instantly generate contactless QR codes for your guests."
              action={{
                label: "Create First Location",
                onClick: handleOpenCreate,
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  {/* Top Bar: Name & Type */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                        {loc.location_type}
                        {loc.table_number ? ` #${loc.table_number}` : ""}
                        {loc.room_number ? ` #${loc.room_number}` : ""}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-brand-950 mt-1">
                        {loc.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        loc.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {loc.is_active ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {/* QR Image Box */}
                  <div className="flex items-center justify-center p-4 bg-stone-50 rounded-2xl border border-stone-200/60">
                    {loc.qr_image_url ? (
                      <div className="relative w-36 h-36 bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                        <Image
                          src={resolveImageUrl(loc.qr_image_url)}
                          alt={`QR for ${loc.name}`}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-36 flex flex-col items-center justify-center text-stone-400 bg-white rounded-xl border border-dashed border-stone-300">
                        <QrCode className="w-10 h-10 stroke-[1.5]" />
                        <span className="text-[10px] mt-1 font-medium">QR Pending</span>
                      </div>
                    )}
                  </div>

                  {/* QR Token snippet & Quick Copy */}
                  <div className="flex items-center justify-between text-xs bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
                    <span className="font-mono text-stone-500 truncate max-w-[170px]">
                      Token: {loc.qr_token.slice(0, 12)}...
                    </span>
                    <button
                      onClick={() => handleCopyMenuLink(loc)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-900 hover:text-brand-950 transition-colors"
                      title="Copy Customer Menu Link"
                    >
                      {copiedId === loc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-3.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/locations/${loc.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Printer className="w-3.5 h-3.5 text-gold-400" />
                      <span>Print Stand</span>
                    </Link>

                    <button
                      onClick={() => regenerateQRMutation.mutate(loc.id)}
                      className="p-1.5 text-stone-500 hover:text-brand-900 hover:bg-white rounded-lg transition-colors"
                      title="Regenerate QR Token"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(loc)}
                      className="p-1.5 text-stone-500 hover:text-brand-900 hover:bg-white rounded-lg transition-colors"
                      title="Edit Location"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setLocationToDelete(loc)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location Create/Edit Modal */}
      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        location={selectedLocation}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Dining Location"
        message={`Are you sure you want to delete "${locationToDelete?.name}"? The associated QR code will be invalidated.`}
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
