"use client";

import { useAuthContext } from "@/app/contexts/AuthContext";
import {
  useClientAppointments,
  useBarberAppointments,
  useAllAppointments,
  useRescheduleAppointment,
  useBarberAvailability,
  useCancelAppointment,
  useCompleteAppointment,
} from "@/lib/hooks/useAppointments";
import { useCanRateAppointment } from "@/lib/hooks/useRatings";
import { USER_ROLES } from "@/lib/types/appointments";
import type { Appointment } from "@/lib/types/appointments";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Scissors,
  Loader2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import Navbar from "../components/Navbar";
import RatingModal from "../components/RatingModal";

/**
 * Parses a date string safely to avoid timezone issues
 */
function parseDate(dateStr: string): Date {
  const datePart = dateStr.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function AppointmentCard({
  appointment,
  onReschedule,
  onCancel,
  onComplete,
  onRate,
  userRole,
}: {
  readonly appointment: Appointment;
  readonly onReschedule: (appointment: Appointment) => void;
  readonly onCancel: (appointment: Appointment) => void;
  readonly onComplete: (appointment: Appointment) => void;
  readonly onRate: (appointment: Appointment) => void;
  readonly userRole: number;
}) {
  const barber = appointment.participants.find((p) => p.role === "barber");
  const client = appointment.participants.find((p) => p.role === "client");

  const { data: canRateData } = useCanRateAppointment(appointment.id);

  const stateColors: Record<string, string> = {
    scheduled:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    reschedulled:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    completed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const stateLabels: Record<string, string> = {
    scheduled: "Programada",
    cancelled: "Cancelada",
    reschedulled: "Reprogramada",
    completed: "Completada",
  };

  const canModify =
    appointment.state === "scheduled" || appointment.state === "reschedulled";
  const isCompleted = appointment.state === "completed";
  const isBarber = userRole === USER_ROLES.BARBER;
  const isClient = userRole === USER_ROLES.CLIENT;
  const canRate = isClient && isCompleted && canRateData?.canRate;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Scissors className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {appointment.services.map((s) => s.service?.name).join(", ") ||
                "Servicio"}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ID: {appointment.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            stateColors[appointment.state]
          }`}
        >
          {stateLabels[appointment.state]}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {parseDate(appointment.date).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{appointment.hour}</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <User className="h-4 w-4" />
          <span className="text-sm">
            Barbero: {barber?.user?.name || "No asignado"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <User className="h-4 w-4" />
          <span className="text-sm">
            Cliente: {client?.user?.name || "No asignado"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
          <DollarSign className="h-4 w-4" />
          <span>${appointment.totalPrice.toLocaleString("es-ES")}</span>
        </div>
      </div>

      {canModify && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
          {isBarber && (
            <button
              type="button"
              onClick={() => onComplete(appointment)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Completar
            </button>
          )}
          <button
            type="button"
            onClick={() => onReschedule(appointment)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reprogramar
          </button>
          <button
            type="button"
            onClick={() => onCancel(appointment)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Cancelar
          </button>
        </div>
      )}

      {canRate && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onRate(appointment)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <Star className="h-4 w-4" />
            Calificar Servicio
          </button>
        </div>
      )}

      {isCompleted && !canRate && isClient && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Ya calificaste este servicio
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to format date for API
const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

// Reschedule Modal Component
function RescheduleModal({
  appointment,
  onClose,
  onSuccess,
}: {
  readonly appointment: Appointment;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const reschedule = useRescheduleAppointment();

  const barber = appointment.participants.find((p) => p.role === "barber");
  const barberId = barber?.user?.id;

  // Calculate total duration from services
  const totalDuration = appointment.services.reduce(
    (sum, s) => sum + (s.service?.duration || 30),
    0
  );

  // Date range for availability
  const startDate = formatDate(new Date());
  const endDate = formatDate(addDays(new Date(), 30));

  const { data: availability, isLoading: availabilityLoading } =
    useBarberAvailability(barberId, startDate, endDate, totalDuration);

  // Calendar days generation (starting Monday)
  const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    const dayOfWeek = firstDay.getDay();
    const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    for (let i = 0; i < paddingDays; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  // Check if date has available slots
  const hasAvailableSlots = (date: Date) => {
    if (!availability) return false;
    const dateStr = formatDate(date);
    const dayAvailability = availability.availability?.find(
      (d) => d.date === dateStr
    );
    return dayAvailability?.slots?.some((s) => s.available) ?? false;
  };

  // Get available slots for selected date
  const availableSlots = useMemo(() => {
    if (!availability || !selectedDate) return [];
    const dateStr = formatDate(selectedDate);
    const dayAvailability = availability.availability?.find(
      (d) => d.date === dateStr
    );
    return dayAvailability?.slots?.filter((s) => s.available) ?? [];
  }, [availability, selectedDate]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;

    setError(null);
    try {
      await reschedule.mutateAsync({
        appointmentId: appointment.id,
        newDate: formatDate(selectedDate),
        newHour: selectedTime,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al reprogramar la cita"
      );
    }
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Reprogramar Cita
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current appointment info */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Cita actual
            </p>
            <p className="font-medium text-zinc-900 dark:text-white">
              {parseDate(appointment.date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              a las {appointment.hour}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Barbero: {barber?.user?.name || "No asignado"}
            </p>
          </div>

          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-zinc-900 dark:text-white">
                Selecciona nueva fecha
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    )
                  }
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    )
                  }
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-zinc-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, i) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-pad-${i.toString()}`}
                      className="aspect-square"
                    />
                  );
                }

                const isToday = formatDate(date) === formatDate(new Date());
                const isSelected =
                  selectedDate && formatDate(date) === formatDate(selectedDate);
                const isPast = isPastDate(date);
                const hasSlots = !isPast && hasAvailableSlots(date);

                const getButtonClass = () => {
                  if (isSelected) return "bg-amber-500 text-white";
                  if (isToday)
                    return "bg-amber-100 dark:bg-amber-900/30 text-amber-600";
                  if (isPast || !hasSlots)
                    return "text-zinc-300 dark:text-zinc-700 cursor-not-allowed";
                  return "hover:bg-zinc-100 dark:hover:bg-zinc-800";
                };

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={isPast || !hasSlots}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${getButtonClass()}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-white mb-3">
                Selecciona nueva hora
              </h3>
              {availabilityLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              )}
              {!availabilityLoading && availableSlots.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-4">
                  No hay horarios disponibles para esta fecha
                </p>
              )}
              {!availabilityLoading && availableSlots.length > 0 && (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        selectedTime === slot.time
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-amber-300"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedTime || reschedule.isPending}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {reschedule.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reprogramando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Reprogramar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Cancel Confirmation Modal Component
function CancelModal({
  appointment,
  onClose,
  onSuccess,
}: {
  readonly appointment: Appointment;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const cancelAppointment = useCancelAppointment();

  const barber = appointment.participants.find((p) => p.role === "barber");

  const handleCancel = async () => {
    setError(null);
    try {
      await cancelAppointment.mutateAsync(appointment.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cancelar la cita"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Cancelar Cita
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <p className="text-center text-zinc-600 dark:text-zinc-400">
            ¿Estás seguro de que deseas cancelar esta cita?
          </p>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
            <p className="font-medium text-zinc-900 dark:text-white">
              {parseDate(appointment.date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              a las {appointment.hour}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Barbero: {barber?.user?.name || "No asignado"}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Servicios:{" "}
              {appointment.services.map((s) => s.service?.name).join(", ")}
            </p>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Se enviará una notificación por correo al cliente y al barbero.
          </p>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelAppointment.isPending}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cancelAppointment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Cancelar Cita
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentsList({
  appointments,
  isLoading,
  error,
  onReschedule,
  onCancel,
  onComplete,
  onRate,
  userRole,
}: {
  readonly appointments: Appointment[] | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onReschedule: (appointment: Appointment) => void;
  readonly onCancel: (appointment: Appointment) => void;
  readonly onComplete: (appointment: Appointment) => void;
  readonly onRate: (appointment: Appointment) => void;
  readonly userRole: number;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          Error al cargar las citas: {error.message}
        </p>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Calendar className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
          No tienes citas
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 mb-4">
          Agenda tu primera cita con uno de nuestros barberos
        </p>
        <Link
          href="/citas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Agendar cita
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onReschedule={onReschedule}
          onCancel={onCancel}
          onComplete={onComplete}
          onRate={onRate}
          userRole={userRole}
        />
      ))}
    </div>
  );
}

export default function CitasPage() {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const router = useRouter();
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState<Appointment | null>(null);
  const [cancelAppointment, setCancelAppointment] =
    useState<Appointment | null>(null);
  const [ratingAppointment, setRatingAppointment] =
    useState<Appointment | null>(null);

  const completeAppointmentMutation = useCompleteAppointment();

  // Determine which query to use based on role
  const isClient = user?.role === USER_ROLES.CLIENT;
  const isBarber = user?.role === USER_ROLES.BARBER;
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const clientQuery = useClientAppointments();
  const barberQuery = useBarberAppointments();
  const adminQuery = useAllAppointments();

  // Select the appropriate query based on role
  const getActiveQuery = () => {
    if (isAdmin) return adminQuery;
    if (isBarber) return barberQuery;
    return clientQuery;
  };
  const activeQuery = getActiveQuery();

  const handleRescheduleSuccess = () => {
    activeQuery.refetch();
  };

  const handleCancelSuccess = () => {
    activeQuery.refetch();
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    if (!confirm("¿Estás seguro de que deseas marcar esta cita como completada?")) return;
    try {
      await completeAppointmentMutation.mutateAsync(appointment.id);
    } catch (error) {
      console.error("Error al completar la cita:", error);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleLabel = () => {
    if (isAdmin) return "Administrador";
    if (isBarber) return "Barbero";
    return "Cliente";
  };
  const roleLabel = getRoleLabel();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Mis Citas
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Vista de {roleLabel.toLowerCase()}
            </p>
          </div>

          {isClient && (
            <Link
              href="/citas/nueva"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Nueva cita
            </Link>
          )}

          {isBarber && (
            <Link
              href="/citas/horarios"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Gestionar horarios
            </Link>
          )}
        </div>

        <AppointmentsList
          appointments={activeQuery.data}
          isLoading={activeQuery.isLoading}
          error={activeQuery.error}
          onReschedule={setRescheduleAppointment}
          onCancel={setCancelAppointment}
          onComplete={handleCompleteAppointment}
          onRate={setRatingAppointment}
          userRole={user?.role || USER_ROLES.CLIENT}
        />
      </main>

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <RescheduleModal
          appointment={rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {/* Cancel Modal */}
      {cancelAppointment && (
        <CancelModal
          appointment={cancelAppointment}
          onClose={() => setCancelAppointment(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Rating Modal */}
      {ratingAppointment && (
        <RatingModal
          isOpen={true}
          onClose={() => setRatingAppointment(null)}
          appointmentId={ratingAppointment.id}
          barberName={
            ratingAppointment.participants.find((p) => p.role === "barber")?.user?.name || "Barbero"
          }
          serviceName={
            ratingAppointment.services.map((s) => s.service?.name).join(", ") || "Servicio"
          }
        />
      )}
    </div>
  );
}
