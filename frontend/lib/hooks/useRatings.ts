"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratingsService } from "../services/ratings.service";
import type { CreateRatingRequest, UpdateRatingRequest } from "../types/ratings";

// ==================== QUERIES ====================

export function useBarberRatings(barberId: string | undefined) {
  return useQuery({
    queryKey: ["ratings", "barber", barberId],
    queryFn: () => ratingsService.getBarberRatings(barberId!),
    enabled: !!barberId,
  });
}

export function useMyRatings() {
  return useQuery({
    queryKey: ["ratings", "my-ratings"],
    queryFn: () => ratingsService.getMyRatings(),
  });
}

export function useRatingByAppointment(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ["ratings", "appointment", appointmentId],
    queryFn: () => ratingsService.getRatingByAppointment(appointmentId!),
    enabled: !!appointmentId,
  });
}

export function useCanRateAppointment(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ["ratings", "can-rate", appointmentId],
    queryFn: () => ratingsService.checkCanRate(appointmentId!),
    enabled: !!appointmentId,
  });
}

// ==================== MUTATIONS ====================

export function useCreateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRatingRequest) => ratingsService.createRating(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ratingId,
      data,
    }: {
      ratingId: string;
      data: UpdateRatingRequest;
    }) => ratingsService.updateRating(ratingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
    },
  });
}

export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ratingId: string) => ratingsService.deleteRating(ratingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
    },
  });
}
