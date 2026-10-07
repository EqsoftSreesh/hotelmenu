"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Loader2, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/common/Toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid administrative email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@hotel.com",
      password: "admin123",
    },
  });

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      addToast({
        type: "success",
        title: "Access Granted",
        message: "Welcome to the Grand Hotel & Dining Administration Suite.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Invalid administrative credentials. Please verify your email and password.";
      setErrorMessage(typeof detail === "string" ? detail : JSON.stringify(detail));
      addToast({
        type: "error",
        title: "Authentication Failed",
        message: "Please check your login credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setValue("email", "admin@hotel.com");
    setValue("password", "admin123");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-900 border border-gold-500/30 text-gold-400 font-serif font-bold text-2xl shadow-xl shadow-brand-950 mb-4">
            H
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-100">
            Grand Hotel & Dining
          </h1>
          <p className="text-xs uppercase tracking-widest text-gold-400/90 font-medium mt-1">
            Executive Digital Menu Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-stone-900/90 backdrop-blur-md rounded-3xl p-8 border border-stone-800 shadow-2xl space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
              Administrative Login
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Enter your credentials to access the back-office management console.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="admin@hotel.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all placeholder-stone-600"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all placeholder-stone-600"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-brand-950 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 hover:from-gold-300 hover:to-gold-400 shadow-gold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-950" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-brand-950" />
                  Sign In to Management
                </>
              )}
            </button>
          </form>

          {/* Seed demo autofill helper */}
          <div className="pt-4 border-t border-stone-800/80 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-stone-400 hover:text-gold-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Fill Seed Credentials</span>
              <span className="font-mono text-[11px] text-stone-500 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                admin@hotel.com
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-stone-600 mt-8">
          Grand Hotel & Dining Group &bull; Digital Dining System v1.0
        </p>
      </div>
    </div>
  );
}
