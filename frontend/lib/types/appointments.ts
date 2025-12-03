// Roles de usuario
export const USER_ROLES = {
  CLIENT: 1,
  BARBER: 2,
  ADMIN: 3,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Servicios de barbería
export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Participantes de una cita
export interface AppointmentParticipant {
  id: string;
  role: "client" | "barber";
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Servicio de una cita
export interface AppointmentServiceItem {
  id: string;
  service: Service;
}

// Rating de una cita
export interface AppointmentRating {
  id: string;
  rating: number;
  comment?: string;
}

// Cita
export interface Appointment {
  id: string;
  date: string;
  hour: string;
  state: "scheduled" | "cancelled" | "reschedulled";
  totalPrice: number;
  participants: AppointmentParticipant[];
  services: AppointmentServiceItem[];
  ratings: AppointmentRating[];
  createdAt: string;
  updatedAt: string;
}

// DTOs para crear/actualizar
export interface CreateAppointmentRequest {
  clientId: string;
  barberId: string;
  date: string;
  hour: string;
  serviceIds: number[];
}

export interface RescheduleAppointmentRequest {
  appointmentId: string;
  newDate: string;
  newHour: string;
}

// Horarios del barbero
export interface BarberSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBarberScheduleRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

// Horario especial por fecha
export interface BarberBreak {
  id: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface BarberDateSchedule {
  id: string;
  date: string;
  isWorkDay: boolean;
  note?: string;
  breaks: BarberBreak[];
}

export interface CreateBarberDateScheduleRequest {
  date: string;
  isWorkDay?: boolean;
  note?: string;
  breaks?: {
    startTime: string;
    endTime: string;
    reason?: string;
  }[];
}

// Disponibilidad
export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  isWorkDay: boolean;
  slots: TimeSlot[];
}

export interface BarberAvailability {
  barberId: string;
  availability: DayAvailability[];
}

// Barbero para listado
export interface Barber {
  id: string;
  name: string;
  email: string;
}
