import api from "@/lib/api";
import { DashboardStats, ApiResponse } from "@/types";

export interface SystemStatus {
  status: string;
  components: {
    api: string;
    database: string;
    websocket_connections: number;
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
    return response.data.data;
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const response = await api.get<SystemStatus>("/system/status");
    return response.data;
  },
};
