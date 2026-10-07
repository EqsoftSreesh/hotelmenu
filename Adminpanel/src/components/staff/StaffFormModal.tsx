"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Save, UserCheck, AlertCircle } from "lucide-react";
import { Staff, StaffInput } from "@/types";
import { staffService } from "@/services/staff";
import { useToast } from "@/components/common/Toast";
import { ImageUpload } from "@/components/common/ImageUpload";

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  employee_code: z.string().min(2, "Code must be at least 2 characters").max(50),
  designation: z.string().min(2, "Designation must be at least 2 characters").max(100),
  is_active: z.boolean().default(true),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: Staff | null;
}

const COMMON_DESIGNATIONS = [
  "Senior Server",
  "Head Sommelier",
  "Bartender",
  "Captain",
  "Host / Hostess",
  "Head Waiter",
];

export function StaffFormModal({ isOpen, onClose, staff }: StaffFormModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEdit = !!staff;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as any,
    defaultValues: {
      name: "",
      employee_code: "",
      designation: "",
      is_active: true,
    },
  });

  const currentDesignation = watch("designation");

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        employee_code: staff.employee_code,
        designation: staff.designation,
        is_active: staff.is_active,
      });
      setSelectedImageFile(null);
      setImageRemoved(false);
    } else {
      reset({
        name: "",
        employee_code: "",
        designation: "",
        is_active: true,
      });
      setSelectedImageFile(null);
      setImageRemoved(false);
    }
  }, [staff, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: StaffFormData) => {
    setIsSubmitting(true);
    try {
      const payload: StaffInput = {
        name: values.name,
        employee_code: values.employee_code,
        designation: values.designation,
        is_active: values.is_active,
      };

      let staffId: number;

      if (isEdit && staff) {
        const updated = await staffService.updateStaff(staff.id, payload);
        staffId = updated.id;
        addToast({
          type: "success",
          title: "Staff Member Updated",
          message: `${updated.name}'s profile has been updated.`,
        });
      } else {
        const created = await staffService.createStaff(payload);
        staffId = created.id;
        addToast({
          type: "success",
          title: "Staff Member Added",
          message: `${created.name} has been added to the team.`,
        });
      }

      if (selectedImageFile) {
        try {
          await staffService.uploadImage(staffId, selectedImageFile);
        } catch (uploadErr) {
          addToast({
            type: "warning",
            title: "Portrait Upload",
            message: "Staff profile was saved, but profile image upload failed.",
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "An unexpected error occurred while saving staff.";
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

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-950">
                {isEdit ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <p className="text-xs text-stone-500">
                Manage service personnel and enable guest ratings.
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
          {/* Name & Employee Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Laurent Petit"
                className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
                Staff Code / ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("employee_code")}
                placeholder="e.g. STF-042"
                className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900"
              />
              {errors.employee_code && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.employee_code.message}
                </p>
              )}
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase mb-1.5">
              Designation / Role <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("designation")}
              placeholder="e.g. Lead Server / Sommelier"
              className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white text-stone-900 mb-2"
            />
            {errors.designation && (
              <p className="text-xs text-rose-600 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.designation.message}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_DESIGNATIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue("designation", role)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                    currentDesignation === role
                      ? "bg-brand-900 text-white border-brand-900"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Photo */}
          <div>
            <ImageUpload
              value={imageRemoved ? null : staff?.profile_image}
              onChange={(file) => {
                setSelectedImageFile(file);
                if (file) setImageRemoved(false);
              }}
              onRemove={() => {
                setSelectedImageFile(null);
                setImageRemoved(true);
              }}
              label="Staff Portrait Photo"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <p className="text-sm font-semibold text-brand-950">Active on Duty</p>
              <p className="text-xs text-stone-500">Allows diners to select this staff member for reviews</p>
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
                  {isEdit ? "Update Staff" : "Add Staff"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
