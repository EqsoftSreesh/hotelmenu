"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-900 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-bold text-xl shadow-gold">
          H
        </div>
        <Loader2 className="w-5 h-5 text-gold-500 animate-spin mt-2" />
        <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">
          Loading Grand Dining Portal...
        </p>
      </div>
    </div>
  );
}
