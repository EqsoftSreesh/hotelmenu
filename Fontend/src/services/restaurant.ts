import { RestaurantInfo } from "@/types";
import { DEFAULT_RESTAURANT } from "@/lib/constants";

export const restaurantService = {
  async getRestaurantInfo(): Promise<RestaurantInfo> {
    // Can be fetched from an endpoint or uses configured defaults
    return DEFAULT_RESTAURANT;
  },
};
