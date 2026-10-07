"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Save, QrCode, AlertCircle } from "lucide-react";
import { Location, LocationInput } from "@/types";
import { locationService } from "@/services/locations";
import { useToast } from "@/components/common/Toast";

const locationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  location_type: z.enum(["TABLE", "ROOM", "RESTAURANT", "OTHER"]),
  table_number: z.string().max(20).optional().nullable(),
  room_number: z.string().max(20).optional().nullable(),
  is_active: z.boolean().default(true),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null;
}

export function LocationFormModal({ isOpen, onClose, location }: LocationFormModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEdit = !!location;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: {
      name: "",
      location_type: "TABLE",
      table_number: "",
      room_number: "",
      is_active: true,
    },
  });

  const selectedType = watch("location_type");

  useEffect(() => {
    if (location) {
      reset({
        name: location.name,
        location_type: location.location_type,
        table_number: location.table_number || "",
        room_number: location.room_number || "",
        is_active: location.is_active,
      });
    } else {
      reset({
        name: "",
        location_type: "TABLE",
        table_number: "",
        room_number: "",
        is_active: true,
      });
    }
  }, [location, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: LocationFormData) => {
    setIsSubmitting(true);
    try {
      const payload: LocationInput = {
        name: values.name,
        location_type: values.location_type,
        table_number: values.table_number || undefined,
        room_number: values.room_number || undefined,
        is_active: values.is_active,
      };

      if (isEdit && location) {
        const updated = await locationService.updateLocation(location.id, payload);
        addToast({
          type: "success",
          title: "Location Updated",
          message: `Location "${updated.name}" has been updated.`,
        });
      } else {
        const created = await locationService.createLocation(payload);
        addToast({
          type: "success",
          title: "Location & QR Created",
          message: `Created "${created.name}" with a dedicated QR token.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["locations"] });
      onClose();
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "An unexpected error occurred while saving the location.";
      addToast({
        type: "error",
        title: "Action Failed",
        message: typeof message === "string" ? message : JSON.stringify(message),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-950">
                {isEdit ? "Edit Location" : "Add Dining Location"}
              </h3>
              <p className="text-xs text-stone-500">
                Generate and configure dedicated QR digital menu access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Location Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Table 14 - Garden Patio"
              className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
              Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("location_type")}
              className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
            >
              <option value="TABLE">Table (Restaurant / Patio / Bar)</option>
              <option value="ROOM">Hotel Room / Suite</option>
              <option value="RESTAURANT">General Restaurant Entry / Front Desk</option>
              <option value="OTHER">Other / Poolside / Lounge</option>
            </select>
          </div>

          {/* Table / Room Number depending on type */}
          {selectedType === "TABLE" && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Table Identifier
              </label>
              <input
                type="text"
                {...register("table_number")}
                placeholder="e.g. T-14"
                className="w-full px-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
          )}

          {selectedType === "ROOM" && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Room Number
              </label>
              <input
                type="text"
                {...register("room_number")}
                placeholder="e.g. 402"
                className="w-full px-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
          )}

          {/* Active status */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <p className="text-sm font-semibold text-brand-950">Active QR Code</p>
              <p className="text-xs text-stone-500">Allow customers to scan and view menu</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("is_active")} className="sr-only peer" />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-900 hover:bg-brand-950 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-gold-400" />
                  {isEdit ? "Update Location" : "Create Location"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
