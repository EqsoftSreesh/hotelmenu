"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Save, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Banner, BannerInput } from "@/types";
import { bannerService } from "@/services/banners";
import { useToast } from "@/components/common/Toast";
import { ImageUpload } from "@/components/common/ImageUpload";

const bannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  subtitle: z.string().max(200).optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  button_text: z.string().max(50).optional().nullable(),
  button_link: z.string().max(255).optional().nullable(),
  display_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
}

export function BannerFormModal({ isOpen, onClose, banner }: BannerFormModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEdit = !!banner;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      image_url: "",
      button_text: "",
      button_link: "",
      display_order: 0,
      is_active: true,
      start_date: "",
      end_date: "",
    },
  });

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title,
        subtitle: banner.subtitle || "",
        description: banner.description || "",
        image_url: banner.image_url || "",
        button_text: banner.button_text || "",
        button_link: banner.button_link || "",
        display_order: banner.display_order,
        is_active: banner.is_active,
        start_date: banner.start_date ? banner.start_date.split("T")[0] : "",
        end_date: banner.end_date ? banner.end_date.split("T")[0] : "",
      });
      setSelectedImageFile(null);
      setImageRemoved(false);
    } else {
      reset({
        title: "",
        subtitle: "",
        description: "",
        image_url: "",
        button_text: "",
        button_link: "",
        display_order: 0,
        is_active: true,
        start_date: "",
        end_date: "",
      });
      setSelectedImageFile(null);
      setImageRemoved(false);
    }
  }, [banner, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: BannerFormData) => {
    if (!isEdit && !selectedImageFile && !values.image_url) {
      addToast({
        type: "error",
        title: "Image Required",
        message: "Please upload an image or provide an image URL for the banner.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BannerInput = {
        title: values.title,
        subtitle: values.subtitle || undefined,
        description: values.description || undefined,
        image_url: values.image_url || "/uploads/placeholder_banner.jpg",
        button_text: values.button_text || undefined,
        button_link: values.button_link || undefined,
        display_order: Number(values.display_order),
        is_active: values.is_active,
        start_date: values.start_date ? new Date(values.start_date).toISOString() : undefined,
        end_date: values.end_date ? new Date(values.end_date).toISOString() : undefined,
      };

      let bannerId: number;

      if (isEdit && banner) {
        const updated = await bannerService.updateBanner(banner.id, payload);
        bannerId = updated.id;
        addToast({
          type: "success",
          title: "Banner Updated",
          message: `Banner "${updated.title}" updated successfully.`,
        });
      } else {
        const created = await bannerService.createBanner(payload);
        bannerId = created.id;
        addToast({
          type: "success",
          title: "Banner Created",
          message: `Banner "${created.title}" created successfully.`,
        });
      }

      if (selectedImageFile) {
        try {
          await bannerService.uploadImage(bannerId, selectedImageFile);
        } catch (uploadErr) {
          addToast({
            type: "warning",
            title: "Image Upload",
            message: "Banner saved, but image upload encountered an error.",
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["banners"] });
      onClose();
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "An unexpected error occurred while saving the banner.";
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
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-950">
                {isEdit ? "Edit Promotional Banner" : "New Promotional Banner"}
              </h3>
              <p className="text-xs text-stone-500">
                Showcase chef specials, seasonal pairings, and events.
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
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
              Banner Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="e.g. Summer Truffle Degustation"
              className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              {...register("subtitle")}
              placeholder="e.g. Handcrafted 5-course evening tasting menu"
              className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
            />
          </div>

          {/* Image Upload */}
          <div>
            <ImageUpload
              value={imageRemoved ? null : banner?.image_url}
              onChange={(file) => {
                setSelectedImageFile(file);
                if (file) setImageRemoved(false);
              }}
              onRemove={() => {
                setSelectedImageFile(null);
                setImageRemoved(true);
              }}
              label="Banner Image / Photography"
            />
          </div>

          {/* Button Text & Button Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Call to Action Text
              </label>
              <input
                type="text"
                {...register("button_text")}
                placeholder="e.g. Explore Menu"
                className="w-full px-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                CTA Target Link
              </label>
              <input
                type="text"
                {...register("button_link")}
                placeholder="#desserts or /menu"
                className="w-full px-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
          </div>

          {/* Date Range & Order */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                {...register("start_date")}
                className="w-full px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                End Date
              </label>
              <input
                type="date"
                {...register("end_date")}
                className="w-full px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                {...register("display_order")}
                placeholder="0"
                className="w-full px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <p className="text-sm font-semibold text-brand-950">Active Banner</p>
              <p className="text-xs text-stone-500">Enable display in customer menu hero carousel</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("is_active")} className="sr-only peer" />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Modal Actions */}
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
                  {isEdit ? "Update Banner" : "Create Banner"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
