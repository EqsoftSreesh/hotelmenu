import api from "@/lib/api";
import { Category, ApiResponse } from "@/types";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>("/categories");
    return response.data.data;
  },
};
