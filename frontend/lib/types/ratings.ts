// Rating Types
export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  appointment: {
    id: string;
    date: string;
    hour: string;
    services?: Array<{
      service?: {
        id: string;
        name: string;
      };
    }>;
  };
}

export interface BarberRatingsResponse {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

export interface CreateRatingRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export interface UpdateRatingRequest {
  rating?: number;
  comment?: string;
}
