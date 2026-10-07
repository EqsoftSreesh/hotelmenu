import api from "@/lib/api";
import { AuthResponse, Admin, ApiResponse } from "@/types";
import { TOKEN_STORAGE_KEY, ADMIN_STORAGE_KEY } from "@/lib/constants";

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    const data = response.data;
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data.admin));
    }
    return data;
  },

  async getMe(): Promise<Admin> {
    const response = await api.get<ApiResponse<Admin>>("/auth/me");
    const admin = response.data.data;
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    }
    return admin;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      window.location.href = "/login";
    }
  },

  getStoredToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    }
    return null;
  },

  getStoredAdmin(): Admin | null {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
    }
    return null;
  },
};
