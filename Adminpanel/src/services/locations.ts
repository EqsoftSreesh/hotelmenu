import api from "@/lib/api";
import { Location, LocationInput, QRCodeData, ApiResponse } from "@/types";

export const locationService = {
  async getLocations(): Promise<Location[]> {
    const response = await api.get<ApiResponse<Location[]>>("/admin/locations");
    return response.data.data;
  },

  async getLocation(id: number): Promise<Location> {
    const response = await api.get<ApiResponse<Location>>(`/admin/locations/${id}`);
    return response.data.data;
  },

  async createLocation(data: LocationInput): Promise<Location> {
    const response = await api.post<ApiResponse<Location>>("/admin/locations", data);
    return response.data.data;
  },

  async updateLocation(id: number, data: Partial<LocationInput>): Promise<Location> {
    const response = await api.put<ApiResponse<Location>>(`/admin/locations/${id}`, data);
    return response.data.data;
  },

  async deleteLocation(id: number): Promise<void> {
    await api.delete(`/admin/locations/${id}`);
  },

  async regenerateQR(id: number): Promise<Location> {
    const response = await api.post<ApiResponse<Location>>(`/admin/locations/${id}/generate-qr`);
    return response.data.data;
  },

  async getQRInfo(id: number): Promise<QRCodeData> {
    const response = await api.get<ApiResponse<QRCodeData>>(`/admin/locations/${id}/qr`);
    return response.data.data;
  },
};
