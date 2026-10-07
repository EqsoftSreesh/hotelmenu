import api from "@/lib/api";
import { Banner, ApiResponse } from "@/types";

export const bannerService = {
  async getActiveBanners(): Promise<Banner[]> {
    const response = await api.get<ApiResponse<Banner[]>>("/banners");
    return response.data.data;
  },
};
