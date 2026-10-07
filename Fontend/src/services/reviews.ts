import api from "@/lib/api";
import { Review, ReviewCreate, ApiResponse, PaginatedResponse } from "@/types";

export interface ReviewFilterParams {
  review_type?: "MENU_ITEM" | "STAFF" | "RESTAURANT";
  menu_item_id?: number;
  staff_id?: number;
  page?: number;
  limit?: number;
}

export const reviewService = {
  async getReviews(params: ReviewFilterParams = {}): Promise<PaginatedResponse<Review>> {
    const response = await api.get<PaginatedResponse<Review>>("/reviews", {
      params,
    });
    return response.data;
  },

  async submitReview(data: ReviewCreate): Promise<Review> {
    const response = await api.post<ApiResponse<Review>>("/reviews", data);
    return response.data.data;
  },

  async uploadReviewImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<string>>("/reviews/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },
};
