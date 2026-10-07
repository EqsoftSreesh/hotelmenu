import api from "@/lib/api";
import { Review, ApiResponse, PaginatedResponse } from "@/types";

export interface ReviewFilterParams {
  review_type?: "MENU_ITEM" | "STAFF" | "RESTAURANT";
  menu_item_id?: number;
  staff_id?: number;
  location_id?: number;
  is_approved?: boolean;
  is_visible?: boolean;
  page?: number;
  limit?: number;
}

export const reviewService = {
  async getReviews(params: ReviewFilterParams = {}): Promise<PaginatedResponse<Review>> {
    const queryParams: Record<string, any> = {};
    if (params.review_type) queryParams.review_type = params.review_type;
    if (params.menu_item_id) queryParams.menu_item_id = params.menu_item_id;
    if (params.staff_id) queryParams.staff_id = params.staff_id;
    if (params.location_id) queryParams.location_id = params.location_id;
    if (params.is_approved !== undefined) queryParams.is_approved = params.is_approved;
    if (params.is_visible !== undefined) queryParams.is_visible = params.is_visible;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const response = await api.get<PaginatedResponse<Review>>("/admin/reviews", {
      params: queryParams,
    });
    return response.data;
  },

  async getReview(id: number): Promise<Review> {
    const response = await api.get<ApiResponse<Review>>(`/admin/reviews/${id}`);
    return response.data.data;
  },

  async approveReview(id: number, is_approved: boolean): Promise<Review> {
    const response = await api.patch<ApiResponse<Review>>(
      `/admin/reviews/${id}/approve`,
      { is_approved }
    );
    return response.data.data;
  },

  async setVisibility(id: number, is_visible: boolean): Promise<Review> {
    const response = await api.patch<ApiResponse<Review>>(
      `/admin/reviews/${id}/visibility`,
      { is_visible }
    );
    return response.data.data;
  },

  async deleteReview(id: number): Promise<void> {
    await api.delete(`/admin/reviews/${id}`);
  },
};
