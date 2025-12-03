import { api } from "../api";
import type {
  Rating,
  BarberRatingsResponse,
  CreateRatingRequest,
  UpdateRatingRequest,
} from "../types/ratings";

export interface CanRateResponse {
  canRate: boolean;
  reason?: string;
}

export const ratingsService = {
  // Create a new rating
  createRating: async (data: CreateRatingRequest): Promise<Rating> => {
    const response = await api.post<Rating>("/ratings", data);
    return response.data;
  },

  // Get ratings for a barber
  getBarberRatings: async (barberId: string): Promise<BarberRatingsResponse> => {
    const response = await api.get<BarberRatingsResponse>(
      `/ratings/barber/${barberId}`
    );
    return response.data;
  },

  // Get my ratings (as client)
  getMyRatings: async (): Promise<Rating[]> => {
    const response = await api.get<Rating[]>("/ratings/my-ratings");
    return response.data;
  },

  // Get rating by appointment
  getRatingByAppointment: async (
    appointmentId: string
  ): Promise<Rating | null> => {
    const response = await api.get<Rating | null>(
      `/ratings/appointment/${appointmentId}`
    );
    return response.data;
  },

  // Check if user can rate an appointment
  checkCanRate: async (appointmentId: string): Promise<CanRateResponse> => {
    const response = await api.get<CanRateResponse>(
      `/ratings/check/${appointmentId}`
    );
    return response.data;
  },

  // Update a rating
  updateRating: async (
    ratingId: string,
    data: UpdateRatingRequest
  ): Promise<Rating> => {
    const response = await api.patch<Rating>(`/ratings/${ratingId}`, data);
    return response.data;
  },

  // Delete a rating
  deleteRating: async (ratingId: string): Promise<void> => {
    await api.delete(`/ratings/${ratingId}`);
  },
};
