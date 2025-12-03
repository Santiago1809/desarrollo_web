"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuthContext } from "@/app/contexts/AuthContext";
import {
  useBarbers,
  useServices,
  useBarberAvailability,
  useCreateAppointment,
} from "@/lib/hooks/useAppointments";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import type { Service, Barber } from "@/lib/types/appointments";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";

// Días de la semana (empezando en lunes)
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function NuevaCitaPage() {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const router = useRouter();

  // Steps
  const [step, setStep] = useState(1);

  // Selections
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Queries
  const { data: barbers, isLoading: barbersLoading } = useBarbers();
  const { data: services, isLoading: servicesLoading } = useServices();

  // Calculate date range for availability based on current visible month
  // Fetch from start of current month to end of next month for smooth navigation
  const dateRange = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(addMonths(currentMonth, 1)); // Include next month too

    // Don't fetch dates before today - use the later date
    const effectiveStart =
      monthStart.getTime() < today.getTime() ? today : monthStart;

    return {
      startDate: format(effectiveStart, "yyyy-MM-dd"),
      endDate: format(monthEnd, "yyyy-MM-dd"),
    };
  }, [currentMonth]);

  // Calculate total duration of selected services (in minutes)
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const { data: availability, isLoading: availabilityLoading } =
    useBarberAvailability(
      selectedBarber?.id,
      dateRange.startDate,
      dateRange.endDate,
      totalDuration > 0 ? totalDuration : 30
    );

  const createAppointment = useCreateAppointment();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // Generate calendar days (starting on Monday)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    // Add empty days for padding (adjust for Monday start: 0=Mon, 6=Sun)
    const dayOfWeek = firstDay.getDay();
    const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    for (let i = 0; i < paddingDays; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  // Check if a date has available slots
  const isDateAvailable = (date: Date): boolean => {
    if (!availability) return false;
    const dateStr = formatDate(date);
    const dayAvailability = availability.availability?.find(
      (d) => d.date === dateStr
    );
    return dayAvailability?.slots?.some((s) => s.available) ?? false;
  };

  // Get available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!availability || !selectedDate) return [];
    const dateStr = formatDate(selectedDate);
    const dayAvailability = availability.availability?.find(
      (d) => d.date === dateStr
    );
    return dayAvailability?.slots?.filter((s) => s.available) ?? [];
  }, [availability, selectedDate]);

  // Handle service toggle
  const toggleService = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      }
      return [...prev, service];
    });
    // Reset time when services change (duration affects availability)
    setSelectedTime(null);
  };

  // Calculate total price
  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );

  // Render time slots
  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
          Selecciona una fecha para ver los horarios
        </p>
      );
    }

    if (availableSlots.length === 0) {
      return (
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
          No hay horarios disponibles para esta fecha
        </p>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
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
    );
  };

  // Handle appointment creation
  const handleCreateAppointment = async () => {
    if (
      !user ||
      !selectedBarber ||
      !selectedDate ||
      !selectedTime ||
      selectedServices.length === 0
    ) {
      return;
    }

    try {
      await createAppointment.mutateAsync({
        clientId: user.id,
        barberId: selectedBarber.id,
        date: formatDate(selectedDate),
        hour: selectedTime,
        serviceIds: selectedServices.map((s) => s.id),
      });
      router.push("/citas");
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/citas"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a mis citas
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Agendar nueva cita
          </h1>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-between mb-8 max-w-md">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? "bg-amber-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 ${
                    step > s ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select barber */}
        {step === 1 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Selecciona un barbero
              </h2>
            </div>

            {barbersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {barbers?.map((barber) => (
                  <button
                    key={barber.id}
                    type="button"
                    onClick={() => {
                      setSelectedBarber(barber);
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedBarber?.id === barber.id
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-amber-300"
                    }`}
                  >
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {barber.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {barber.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select services */}
        {step === 2 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Scissors className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Selecciona los servicios
              </h2>
            </div>

            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {services?.map((service) => {
                    const isSelected = selectedServices.some(
                      (s) => s.id === service.id
                    );
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all flex justify-between items-center ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-amber-300"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {service.name}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {service.duration} min
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            ${Number(service.price).toLocaleString("es-ES")}
                          </span>
                          {isSelected && (
                            <Check className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedServices.length > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Total: {totalDuration} min
                      </p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        ${totalPrice.toLocaleString("es-ES")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              ← Cambiar barbero
            </button>
          </div>
        )}

        {/* Step 3: Select date and time */}
        {step === 3 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Selecciona fecha y hora
              </h2>
            </div>

            {availabilityLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
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
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {MONTHS[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
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
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-zinc-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((date, idx) => {
                      if (!date) {
                        return (
                          <div
                            key={`empty-start-${currentMonth.getMonth()}-${idx}`}
                          />
                        );
                      }
                      const isToday =
                        formatDate(date) === formatDate(new Date());
                      const isPast =
                        date < new Date(new Date().setHours(0, 0, 0, 0));
                      const isAvailable = !isPast && isDateAvailable(date);
                      const isSelected =
                        selectedDate &&
                        formatDate(date) === formatDate(selectedDate);

                      const getDateButtonClass = () => {
                        if (isSelected) return "bg-amber-500 text-white";
                        if (isAvailable)
                          return "hover:bg-amber-100 dark:hover:bg-amber-900/30 text-zinc-900 dark:text-white";
                        return "text-zinc-300 dark:text-zinc-700 cursor-not-allowed";
                      };

                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          disabled={isPast || !isAvailable}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }}
                          className={`p-2 text-sm rounded-lg transition-all ${getDateButtonClass()} ${
                            isToday && !isSelected
                              ? "ring-2 ring-amber-500"
                              : ""
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Horarios disponibles
                  </h3>

                  {renderTimeSlots()}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ← Cambiar servicios
              </button>
              {selectedDate && selectedTime && (
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Check className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Confirmar cita
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <User className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Barbero
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {selectedBarber?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <Scissors className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Servicios
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {selectedServices.map((s) => s.name).join(", ")}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Duración total: {totalDuration} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <Calendar className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Fecha y hora
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {selectedDate?.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    a las {selectedTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="font-medium text-zinc-900 dark:text-white">
                  Total a pagar
                </span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  ${totalPrice.toLocaleString("es-ES")}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ← Cambiar fecha/hora
              </button>
              <button
                type="button"
                onClick={handleCreateAppointment}
                disabled={createAppointment.isPending}
                className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-400 flex items-center gap-2"
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  "Confirmar cita"
                )}
              </button>
            </div>

            {createAppointment.isError && (
              <p className="mt-4 text-red-500 text-sm text-center">
                Error al crear la cita. Por favor, intenta de nuevo.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
