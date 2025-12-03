import { api } from "../api";
import type {
  Appointment,
  CreateAppointmentRequest,
  RescheduleAppointmentRequest,
  BarberSchedule,
  CreateBarberScheduleRequest,
  BarberDateSchedule,
  CreateBarberDateScheduleRequest,
  BarberAvailability,
  Service,
  Barber,
} from "../types/appointments";

export const appointmentsService = {
  // ==================== CITAS ====================

  // Obtener citas del cliente actual
  getClientAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>("/appointments/client");
    return response.data;
  },

  // Obtener citas del barbero actual
  getBarberAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>("/appointments/barber");
    return response.data;
  },

  // Obtener todas las citas (solo admin)
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>("/appointments");
    return response.data;
  },

  // Crear una nueva cita
  createAppointment: async (
    data: CreateAppointmentRequest
  ): Promise<Appointment> => {
    const response = await api.post<Appointment>("/appointments", data);
    return response.data;
  },

  // Reprogramar una cita
  rescheduleAppointment: async (
    data: RescheduleAppointmentRequest
  ): Promise<Appointment> => {
    const response = await api.patch<Appointment>(
      "/appointments/reschedule",
      data
    );
    return response.data;
  },

  // Cancelar una cita
  cancelAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.patch<Appointment>(
      `/appointments/cancel/${appointmentId}`
    );
    return response.data;
  },

  // ==================== HORARIOS DEL BARBERO ====================

  // Agregar horario semanal del barbero
  addBarberSchedule: async (
    data: CreateBarberScheduleRequest
  ): Promise<BarberSchedule> => {
    const response = await api.post<BarberSchedule>(
      "/appointments/barber/schedule",
      data
    );
    return response.data;
  },

  // Obtener horario semanal de un barbero
  getBarberSchedule: async (barberId: string): Promise<BarberSchedule[]> => {
    const response = await api.get<BarberSchedule[]>(
      `/appointments/barber/schedule/${barberId}`
    );
    return response.data;
  },

  // Desactivar un horario
  deactivateBarberSchedule: async (scheduleId: string): Promise<void> => {
    await api.delete(`/appointments/barber/schedule/${scheduleId}`);
  },

  // ==================== HORARIOS ESPECIALES POR FECHA ====================

  // Establecer horario especial para una fecha
  setBarberDateSchedule: async (
    data: CreateBarberDateScheduleRequest
  ): Promise<BarberDateSchedule> => {
    const response = await api.post<BarberDateSchedule>(
      "/appointments/barber/date-schedule",
      data
    );
    return response.data;
  },

  // Obtener horarios especiales de un barbero
  getBarberDateSchedules: async (
    barberId: string
  ): Promise<BarberDateSchedule[]> => {
    const response = await api.get<BarberDateSchedule[]>(
      `/appointments/barber/date-schedules/${barberId}`
    );
    return response.data;
  },

  // Eliminar horario especial
  deleteBarberDateSchedule: async (scheduleId: string): Promise<void> => {
    await api.delete(`/appointments/barber/date-schedule/${scheduleId}`);
  },

  // ==================== DISPONIBILIDAD ====================

  // Obtener disponibilidad de un barbero
  getBarberAvailability: async (
    barberId: string,
    startDate: string,
    endDate: string,
    slotDuration?: number
  ): Promise<BarberAvailability> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    if (slotDuration) {
      params.append("slotDuration", slotDuration.toString());
    }
    const response = await api.get<BarberAvailability>(
      `/appointments/barber/availability/${barberId}?${params.toString()}`
    );
    return response.data;
  },

  // ==================== SERVICIOS ====================

  // Obtener todos los servicios disponibles
  getServices: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>("/services");
    return response.data;
  },

  // ==================== BARBEROS ====================

  // Obtener lista de barberos
  getBarbers: async (): Promise<Barber[]> => {
    const response = await api.get<Barber[]>("/users/barbers");
    return response.data;
  },
};
