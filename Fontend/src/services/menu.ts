import api from "@/lib/api";
import { CustomerMenuResponse, MenuItem, MenuVersionResponse, ApiResponse } from "@/types";

export const menuService = {
  async getMenuByToken(qr_token: string): Promise<CustomerMenuResponse> {
    const response = await api.get<CustomerMenuResponse>(`/menu/${qr_token}`);
    return response.data;
  },

  async getMenuVersion(qr_token: string): Promise<number> {
    const response = await api.get<MenuVersionResponse>(`/menu/${qr_token}/version`);
    return response.data.version;
  },

  async getMenuItem(id: number): Promise<MenuItem> {
    const response = await api.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
    return response.data.data;
  },
};
