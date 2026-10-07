"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Admin, AuthResponse } from "@/types";
import { authService } from "@/services/auth";
import { useToast } from "@/components/common/Toast";

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const { error } = useToast();

  useEffect(() => {
    async function verifyAuth() {
      const token = authService.getStoredToken();
      if (!token) {
        setAdmin(null);
        setIsLoading(false);
        if (pathname !== "/login") {
          router.replace("/login");
        }
        return;
      }

      try {
        const profile = await authService.getMe();
        setAdmin(profile);
      } catch (err) {
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, [pathname, router]);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    try {
      const res = await authService.login(email, pass);
      setAdmin(res.admin);
      router.push("/dashboard");
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      error(msg, "Login Failed");
      throw err;
    }
  };

  const logout = () => {
    setAdmin(null);
    authService.logout();
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getMe();
      setAdmin(profile);
    } catch (err) {
      console.error("Failed to refresh profile", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
