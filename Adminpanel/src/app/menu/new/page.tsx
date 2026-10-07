"use client";

import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MenuForm } from "@/components/menu/MenuForm";

export default function NewMenuItemPage() {
  return (
    <AdminLayout>
      <div className="py-2">
        <MenuForm isEdit={false} />
      </div>
    </AdminLayout>
  );
}
