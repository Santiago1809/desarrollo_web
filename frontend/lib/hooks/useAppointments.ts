"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "../services/appointments.service";
import type {
  CreateAppointmentRequest,
  RescheduleAppointmentRequest,
  CreateBarberScheduleRequest,
  CreateBarberDateScheduleRequest,
} from "../types/appointments";

// ==================== QUERIES DE CITAS ====================

export function useClientAppointments() {
  return useQuery({
    queryKey: ["appointments", "client"],
    queryFn: () => appointmentsService.getClientAppointments(),
  });
}

export function useBarberAppointments() {
  return useQuery({
    queryKey: ["appointments", "barber"],
    queryFn: () => appointmentsService.getBarberAppointments(),
  });
}

export function useAllAppointments() {
  return useQuery({
    queryKey: ["appointments", "all"],
    queryFn: () => appointmentsService.getAllAppointments(),
  });
}

// ==================== MUTATIONS DE CITAS ====================

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      appointmentsService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RescheduleAppointmentRequest) =>
      appointmentsService.rescheduleAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentsService.cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentsService.completeAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// ==================== HORARIOS DEL BARBERO ====================

export function useBarberSchedule(barberId: string | undefined) {
  return useQuery({
    queryKey: ["barberSchedule", barberId],
    queryFn: () => appointmentsService.getBarberSchedule(barberId!),
    enabled: !!barberId,
  });
}

export function useAddBarberSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBarberScheduleRequest) =>
      appointmentsService.addBarberSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberSchedule"] });
    },
  });
}

export function useDeactivateBarberSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) =>
      appointmentsService.deactivateBarberSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberSchedule"] });
    },
  });
}

// ==================== HORARIOS ESPECIALES ====================

export function useBarberDateSchedules(barberId: string | undefined) {
  return useQuery({
    queryKey: ["barberDateSchedules", barberId],
    queryFn: () => appointmentsService.getBarberDateSchedules(barberId!),
    enabled: !!barberId,
  });
}

export function useSetBarberDateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBarberDateScheduleRequest) =>
      appointmentsService.setBarberDateSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberDateSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["barberAvailability"] });
    },
  });
}

export function useDeleteBarberDateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) =>
      appointmentsService.deleteBarberDateSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberDateSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["barberAvailability"] });
    },
  });
}

// ==================== DISPONIBILIDAD ====================

export function useBarberAvailability(
  barberId: string | undefined,
  startDate: string,
  endDate: string,
  slotDuration?: number
) {
  return useQuery({
    queryKey: [
      "barberAvailability",
      barberId,
      startDate,
      endDate,
      slotDuration,
    ],
    queryFn: () =>
      appointmentsService.getBarberAvailability(
        barberId!,
        startDate,
        endDate,
        slotDuration
      ),
    enabled: !!barberId && !!startDate && !!endDate,
  });
}

// ==================== SERVICIOS ====================

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => appointmentsService.getServices(),
  });
}

// ==================== BARBEROS ====================

export function useBarbers() {
  return useQuery({
    queryKey: ["barbers"],
    queryFn: () => appointmentsService.getBarbers(),
  });
}
