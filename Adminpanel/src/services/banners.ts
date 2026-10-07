import api from "@/lib/api";
import { Banner, BannerInput, ApiResponse } from "@/types";

export const bannerService = {
  async getBanners(): Promise<Banner[]> {
    const response = await api.get<ApiResponse<Banner[]>>("/admin/banners");
    return response.data.data;
  },

  async getBanner(id: number): Promise<Banner> {
    const response = await api.get<ApiResponse<Banner>>(`/admin/banners/${id}`);
    return response.data.data;
  },

  async createBanner(data: BannerInput): Promise<Banner> {
    const response = await api.post<ApiResponse<Banner>>("/admin/banners", data);
    return response.data.data;
  },

  async updateBanner(id: number, data: Partial<BannerInput>): Promise<Banner> {
    const response = await api.put<ApiResponse<Banner>>(`/admin/banners/${id}`, data);
    return response.data.data;
  },

  async deleteBanner(id: number): Promise<void> {
    await api.delete(`/admin/banners/${id}`);
  },

  async uploadImage(id: number, file: File): Promise<Banner> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<Banner>>(
      `/admin/banners/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },
};
