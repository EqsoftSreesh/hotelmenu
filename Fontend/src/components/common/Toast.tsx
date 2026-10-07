"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void;
  addToast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 4000,
    }: {
      type?: ToastType;
      title?: string;
      message: string;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => addToast({ type: "success", title, message }),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string) => addToast({ type: "error", title, message }),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string) => addToast({ type: "info", title, message }),
    [addToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => addToast({ type: "warning", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, addToast, success, error, info, warning }}>
      {children}
      {/* Toast popup alerts */}
      <div className="fixed top-5 right-5 left-5 sm:left-auto sm:right-5 sm:max-w-sm z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-sm transition-all duration-300 animate-in slide-in-from-top-4",
              t.type === "success" && "bg-brand-900 border-gold-500/50 text-white shadow-brand-950/20",
              t.type === "error" && "bg-rose-950 border-rose-500/40 text-white shadow-rose-950/20",
              t.type === "warning" && "bg-amber-950 border-amber-500/40 text-white shadow-amber-950/20",
              t.type === "info" && "bg-stone-900 border-stone-700 text-white shadow-stone-900/20"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              {t.title && <div className="font-semibold text-xs tracking-wider uppercase text-gold-400 mb-0.5">{t.title}</div>}
              <div className="text-stone-200 text-xs leading-relaxed">{t.message}</div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-stone-400 hover:text-white transition-colors p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
