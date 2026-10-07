import api from "@/lib/api";
import { Staff, ApiResponse } from "@/types";

export interface StaffRatingStats {
  average_rating: number;
  total_ratings: number;
  distribution: Record<string, number>;
}

export const staffService = {
  async getActiveStaff(): Promise<Staff[]> {
    const response = await api.get<ApiResponse<Staff[]>>("/staff");
    return response.data.data;
  },

  async getStaffRatings(id: number): Promise<StaffRatingStats> {
    const response = await api.get<ApiResponse<StaffRatingStats>>(`/staff/${id}/ratings`);
    return response.data.data;
  },
};
