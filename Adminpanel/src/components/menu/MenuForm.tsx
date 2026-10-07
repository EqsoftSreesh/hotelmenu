"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Save, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { MenuItem, MenuItemInput } from "@/types";
import { menuService } from "@/services/menu";
import { categoryService } from "@/services/categories";
import { useToast } from "@/components/common/Toast";
import { ImageUpload } from "@/components/common/ImageUpload";

const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  category_id: z.coerce.number().min(1, "Please select a category"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  short_description: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  preparation_time: z.string().max(50).optional().nullable(),
  tags: z.string().max(255).optional().nullable(),
  display_order: z.coerce.number().default(0),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_popular: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuFormProps {
  initialData?: MenuItem;
  isEdit?: boolean;
}

const COMMON_TAGS = [
  "Chef's Special",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Spicy",
  "Signature Dish",
  "Beverage",
  "Organic",
];

export function MenuForm({ initialData, isEdit = false }: MenuFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      category_id: initialData?.category_id || (categories[0]?.id ?? 0),
      price: initialData?.price ? Number(initialData.price) : (0 as any),
      short_description: initialData?.short_description || "",
      description: initialData?.description || "",
      preparation_time: initialData?.preparation_time || "",
      tags: initialData?.tags || "",
      display_order: initialData?.display_order ?? 0,
      is_available: initialData?.is_available ?? true,
      is_featured: initialData?.is_featured ?? false,
      is_popular: initialData?.is_popular ?? false,
      is_bestseller: initialData?.is_bestseller ?? false,
    },
  });

  const currentTags = watch("tags") || "";

  const handleTagToggle = (tag: string) => {
    const tagsArray = currentTags
      ? currentTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    if (tagsArray.includes(tag)) {
      const updated = tagsArray.filter((t) => t !== tag).join(", ");
      setValue("tags", updated);
    } else {
      const updated = [...tagsArray, tag].join(", ");
      setValue("tags", updated);
    }
  };

  const onSubmit = async (values: MenuItemFormData) => {
    setIsSubmitting(true);
    try {
      const inputPayload: MenuItemInput = {
        name: values.name,
        category_id: Number(values.category_id),
        price: Number(values.price),
        short_description: values.short_description || undefined,
        description: values.description || undefined,
        preparation_time: values.preparation_time || undefined,
        tags: values.tags || undefined,
        display_order: Number(values.display_order),
        is_available: values.is_available,
        is_featured: values.is_featured,
        is_popular: values.is_popular,
        is_bestseller: values.is_bestseller,
      };

      let itemId: number;

      if (isEdit && initialData) {
        const updated = await menuService.updateMenuItem(initialData.id, inputPayload);
        itemId = updated.id;
        addToast({
          type: "success",
          title: "Menu Item Updated",
          message: `"${values.name}" has been successfully saved.`,
        });
      } else {
        const created = await menuService.createMenuItem(inputPayload);
        itemId = created.id;
        addToast({
          type: "success",
          title: "Menu Item Created",
          message: `"${values.name}" has been added to the digital menu.`,
        });
      }

      // If a new image file was uploaded, upload it to the item
      if (selectedImageFile) {
        try {
          await menuService.uploadImage(itemId, selectedImageFile);
        } catch (uploadErr: any) {
          addToast({
            type: "warning",
            title: "Image Upload Notice",
            message: "Item details were saved, but image upload encountered an error.",
          });
        }
      }

      // Invalidate relevant query caches
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      router.push("/menu");
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "An unexpected error occurred while saving the item.";
      addToast({
        type: "error",
        title: "Failed to Save",
        message: typeof message === "string" ? message : JSON.stringify(message),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-brand-900 transition-colors uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Menu Items
          </Link>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-950">
            {isEdit ? `Edit: ${initialData?.name}` : "Create New Menu Item"}
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {isEdit
              ? "Modify presentation, pricing, availability, and attributes."
              : "Add an exquisite culinary selection to your digital catalog."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-brand-900 hover:bg-brand-950 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-gold-400" />
                {isEdit ? "Save Changes" : "Create Item"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-brand-950 pb-3 border-b border-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              General Information
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Royal Truffle Risotto"
                className="w-full px-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900 placeholder-stone-400"
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("category_id")}
                  disabled={isLoadingCategories}
                  className="w-full px-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                  Price ($) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-sm font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price")}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            {/* Preparation time & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                  Preparation Time
                </label>
                <input
                  type="text"
                  {...register("preparation_time")}
                  placeholder="e.g. 15-20 mins"
                  className="w-full px-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900 placeholder-stone-400"
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
                  className="w-full px-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                {...register("short_description")}
                placeholder="One sentence summary for menu card highlights"
                className="w-full px-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900 placeholder-stone-400"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Full Description & Culinary Story
              </label>
              <textarea
                rows={4}
                {...register("description")}
                placeholder="Detailed ingredient list, preparation methods, allergen details, and flavor notes..."
                className="w-full px-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900 placeholder-stone-400 resize-y"
              />
            </div>

            {/* Tags & Quick Select */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Dietary & Culinary Tags (Comma separated)
              </label>
              <input
                type="text"
                {...register("tags")}
                placeholder="Spicy, Gluten-Free, Chef's Special"
                className="w-full px-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900 placeholder-stone-400 mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TAGS.map((tag) => {
                  const isSelected = currentTags
                    .split(",")
                    .map((t) => t.trim().toLowerCase())
                    .includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? "bg-gold-50 border-gold-400 text-gold-900 font-semibold"
                          : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Image & Badges/Flags */}
        <div className="space-y-6">
          {/* Image Upload Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-brand-950 pb-2 border-b border-stone-100">
              Dish Photography
            </h2>
            <ImageUpload
              value={imageRemoved ? null : initialData?.image_url}
              onChange={(file) => {
                setSelectedImageFile(file);
                if (file) setImageRemoved(false);
              }}
              onRemove={() => {
                setSelectedImageFile(null);
                setImageRemoved(true);
              }}
              label="Item Photo"
            />
            <p className="text-xs text-stone-400">
              High resolution photo (1200x800px recommended). Max 5MB.
            </p>
          </div>

          {/* Visibility & Badges Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-brand-950 pb-2 border-b border-stone-100">
              Availability & Badges
            </h2>

            {/* In Stock / Available Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <p className="text-sm font-semibold text-brand-950">In Stock / Available</p>
                <p className="text-xs text-stone-500">Customers can view and order</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_available")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Featured Badge */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <p className="text-sm font-semibold text-brand-950">Featured Item</p>
                <p className="text-xs text-stone-500">Highlighted on top carousels</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_featured")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
              </label>
            </div>

            {/* Popular Badge */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <p className="text-sm font-semibold text-brand-950">Popular Choice</p>
                <p className="text-xs text-stone-500">Shows &quot;Popular&quot; flame badge</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_popular")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-700"></div>
              </label>
            </div>

            {/* Bestseller Badge */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <p className="text-sm font-semibold text-brand-950">Bestseller</p>
                <p className="text-xs text-stone-500">Shows &quot;Bestseller&quot; luxury badge</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_bestseller")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
