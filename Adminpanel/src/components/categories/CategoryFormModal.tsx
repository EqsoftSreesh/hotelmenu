"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Save, FolderPlus, Edit3, AlertCircle } from "lucide-react";
import { Category, CategoryInput } from "@/types";
import { categoryService } from "@/services/categories";
import { useToast } from "@/components/common/Toast";
import { ImageUpload } from "@/components/common/ImageUpload";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().max(100).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  display_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

const COMMON_ICONS = ["utensils", "coffee", "wine", "pizza", "cake", "salad", "flame", "fish"];

export function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      display_order: 0,
      is_active: true,
    },
  });

  const selectedIcon = watch("icon");

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        icon: category.icon || "",
        display_order: category.display_order,
        is_active: category.is_active,
      });
      setSelectedImageFile(null);
      setImageRemoved(false);
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        icon: "",
        display_order: 0,
        is_active: true,
      });
      setSelectedImageFile(null);
      setImageRemoved(false);
    }
  }, [category, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const payload: CategoryInput = {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
        icon: values.icon || undefined,
        display_order: Number(values.display_order),
        is_active: values.is_active,
      };

      let catId: number;

      if (isEdit && category) {
        const updated = await categoryService.updateCategory(category.id, payload);
        catId = updated.id;
        addToast({
          type: "success",
          title: "Category Updated",
          message: `Category "${updated.name}" updated successfully.`,
        });
      } else {
        const created = await categoryService.createCategory(payload);
        catId = created.id;
        addToast({
          type: "success",
          title: "Category Created",
          message: `Category "${created.name}" created successfully.`,
        });
      }

      if (selectedImageFile) {
        try {
          await categoryService.uploadImage(catId, selectedImageFile);
        } catch (uploadErr) {
          addToast({
            type: "warning",
            title: "Image Upload",
            message: "Category was saved, but image upload encountered an issue.",
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "An unexpected error occurred while saving category.";
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
      <div className="fixed inset-0 bg-brand-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800">
              {isEdit ? <Edit3 className="w-5 h-5" /> : <FolderPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-950">
                {isEdit ? "Edit Category" : "New Category"}
              </h3>
              <p className="text-xs text-stone-500">
                {isEdit ? "Update category details and icon" : "Create a culinary category for your menu"}
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
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Appetizers, Starters, Wines"
              className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              {...register("description")}
              placeholder="Brief description of dishes in this collection..."
              className="w-full px-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
            />
          </div>

          {/* Icon Selection & Display Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Icon Name
              </label>
              <input
                type="text"
                {...register("icon")}
                placeholder="utensils, coffee..."
                className="w-full px-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_ICONS.slice(0, 4).map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setValue("icon", ic)}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      selectedIcon === ic
                        ? "bg-brand-900 text-white border-brand-900"
                        : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                {...register("display_order")}
                placeholder="0"
                className="w-full px-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <ImageUpload
              value={imageRemoved ? null : category?.image}
              onChange={(file) => {
                setSelectedImageFile(file);
                if (file) setImageRemoved(false);
              }}
              onRemove={() => {
                setSelectedImageFile(null);
                setImageRemoved(true);
              }}
              label="Category Header Image"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <p className="text-sm font-semibold text-brand-950">Active Status</p>
              <p className="text-xs text-stone-500">Visible to guests in customer menu</p>
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
                  {isEdit ? "Update Category" : "Create Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
